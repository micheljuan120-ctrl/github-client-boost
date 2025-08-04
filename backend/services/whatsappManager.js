const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const { pool } = require('../config/db');
const { encrypt, decrypt } = require('../config/encryption');
const { io } = require('../server'); // Importa a instância do Socket.IO

// Mapa para armazenar clientes WhatsApp ativos, indexados por userId e instanceId
// Ex: activeClients[userId][instanceId] = { client, status, qrCode, lastActivity }
const activeClients = {};

const { v4: uuidv4 } = require('uuid');

// Função para gerar um ID de instância único (UUID real)
const generateInstanceId = () => {
    return uuidv4();
};

// Função para inicializar um cliente WhatsApp para um usuário e instância específicos
const initializeClient = async (userId, instanceId) => {
    if (!activeClients[userId]) {
        activeClients[userId] = {};
    }
    if (activeClients[userId][instanceId] && activeClients[userId][instanceId].client) {
        console.log(`Cliente WhatsApp para usuário ${userId}, instância ${instanceId} já está inicializado.`);
        return activeClients[userId][instanceId];
    }

    console.log(`Inicializando cliente WhatsApp para usuário ${userId}, instância ${instanceId}...`);

    let sessionData = null;
    try {
        const result = await pool.query(
            `SELECT session_data FROM whatsapp_instances WHERE user_id = $1 AND id = $2 AND status = 'connected' LIMIT 1`,
            [userId, instanceId]
        );
        if (result.rows.length > 0 && result.rows[0].session_data) {
            try {
                sessionData = JSON.parse(decrypt(result.rows[0].session_data));
                console.log(`Sessão WhatsApp encontrada e descriptografada para instância ${instanceId}.`);
            } catch (e) {
                console.error(`Erro ao descriptografar ou parsear session_data para instância ${instanceId}:`, e);
                sessionData = null;
            }
        }
    } catch (error) {
        console.error(`Erro ao buscar sessão do DB para instância ${instanceId}:`, error);
    }

    const client = new Client({
        authStrategy: new LocalAuth({
            clientId: instanceId, // Cada instância terá seu próprio diretório de sessão
        }),
        puppeteer: {
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        },
    });

    activeClients[userId][instanceId] = {
        client,
        status: 'connecting',
        qrCode: null,
        lastActivity: new Date(),
    };

    // Eventos do cliente WhatsApp
    client.on('qr', async (qr) => {
        console.log(`[${instanceId}] QR RECEIVED`);
        try {
            const qrCodeData = await qrcode.toDataURL(qr);
            activeClients[userId][instanceId].qrCode = qrCodeData;
            activeClients[userId][instanceId].status = 'qr_received';
            await pool.query(
                `UPDATE whatsapp_instances SET qr_code_data = $1, status = 'qr_received' WHERE id = $2 AND user_id = $3`,
                [qrCodeData, instanceId, userId]
            );
            console.log(`[${instanceId}] QR code salvo no DB e status atualizado para qr_received.`);
        } catch (e) {
            console.error(`[${instanceId}] Erro ao gerar ou salvar QR code:`, e);
        }
    });

    client.on('ready', async () => {
        console.log(`[${instanceId}] Cliente pronto!`);
        activeClients[userId][instanceId].status = 'connected';
        activeClients[userId][instanceId].qrCode = null; // Limpa o QR code após a conexão
        activeClients[userId][instanceId].lastActivity = new Date();

        try {
            await pool.query(
                `UPDATE whatsapp_instances SET status = 'connected', qr_code_data = NULL, last_connected_at = NOW() WHERE id = $1 AND user_id = $2`,
                [instanceId, userId]
            );
            console.log(`[${instanceId}] Status atualizado para connected no DB.`);
        } catch (e) {
            console.error(`[${instanceId}] Erro ao atualizar status para connected no DB:`, e);
        }
    });

    client.on('disconnected', async (reason) => {
        console.log(`[${instanceId}] Cliente desconectado:`, reason);
        activeClients[userId][instanceId].status = 'disconnected';
        activeClients[userId][instanceId].qrCode = null;
        activeClients[userId][instanceId].lastActivity = new Date();

        try {
            await pool.query(
                `UPDATE whatsapp_instances SET status = 'disconnected', qr_code_data = NULL WHERE id = $1 AND user_id = $2`,
                [instanceId, userId]
            );
            console.log(`[${instanceId}] Status atualizado para disconnected no DB.`);
        } catch (e) {
            console.error(`[${instanceId}] Erro ao atualizar status para disconnected no DB:`, e);
        }

        if (reason === 'NAVIGATION' || reason === 'PRIMARY_UNSYNC') {
            console.log(`[${instanceId}] Desconexão permanente, destruindo cliente.`);
            delete activeClients[userId][instanceId];
            client.destroy();
        }
    });

    client.on('auth_failure', async (msg) => {
        console.error(`[${instanceId}] FALHA DE AUTENTICAÇÃO:`, msg);
        activeClients[userId][instanceId].status = 'auth_failure';
        activeClients[userId][instanceId].qrCode = null;
        activeClients[userId][instanceId].lastActivity = new Date();

        try {
            await pool.query(
                `UPDATE whatsapp_instances SET status = 'auth_failure', session_data = NULL, qr_code_data = NULL WHERE id = $1 AND user_id = $2`,
                [instanceId, userId]
            );
            console.log(`[${instanceId}] Status atualizado para auth_failure no DB.`);
        } catch (e) {
            console.error(`[${instanceId}] Erro ao atualizar status para auth_failure no DB:`, e);
        }
        delete activeClients[userId][instanceId];
        client.destroy();
    });

    client.on('message', async message => {
        console.log(`[${instanceId}] Mensagem recebida:`, message.body);
        if (!message.fromMe) {
            try {
                const contact = await message.getContact();
                message.senderName = contact.pushname || contact.name || message.from;
            } catch (e) {
                console.warn(`[${instanceId}] Não foi possível obter contato para a mensagem ${message.id._serialized}:`, e);
                message.senderName = message.from;
            }
        } else {
            message.senderName = 'Você';
        }
        io.to(userId).emit('whatsapp_message', { instanceId, message });
    });

    console.log(`[${instanceId}] Chamando client.initialize()...`);
    client.initialize();
    return activeClients[userId][instanceId];
};

// Função para obter o status de uma instância
const getInstanceStatus = (userId, instanceId) => {
    return activeClients[userId]?.[instanceId]?.status || 'disconnected';
};

// Função para obter o QR Code de uma instância
const getInstanceQrCode = (userId, instanceId) => {
    return activeClients[userId]?.[instanceId]?.qrCode || null;
};

// Função para desconectar uma instância
const disconnectClient = async (userId, instanceId) => {
    if (activeClients[userId]?.[instanceId]?.client) {
        await activeClients[userId][instanceId].client.logout();
        return true;
    }
    return false;
};

// Função para destruir uma instância (logout completo e remoção de dados)
const destroyClient = async (userId, instanceId) => {
    let clientDestroyed = false;
    if (activeClients[userId]?.[instanceId]?.client) {
        try {
            await activeClients[userId][instanceId].client.destroy();
            clientDestroyed = true;
        } catch (e) {
            console.error(`Erro ao destruir cliente ${instanceId}:`, e);
        }
        delete activeClients[userId][instanceId];
    }

    // Sempre tentar remover do banco de dados
    try {
        await pool.query(`DELETE FROM whatsapp_instances WHERE id = $1 AND user_id = $2`, [instanceId, userId]);
        return true; // Successfully deleted from DB
    } catch (e) {
        console.error(`Erro ao deletar do DB para instância ${instanceId}:`, e);
        return false; // Failed to delete from DB
    }
};

// Função para obter todos os chats de uma instância
const getChats = async (userId, instanceId) => {
    const client = activeClients[userId]?.[instanceId]?.client;
    if (client && activeClients[userId][instanceId].status === 'connected') {
        return await client.getChats();
    }
    return [];
};

// Função para obter mensagens de um chat específico
const getMessages = async (userId, instanceId, chatId, limit = 50, beforeMessageId = null) => {
    const client = activeClients[userId]?.[instanceId]?.client;
    if (client && activeClients[userId][instanceId].status === 'connected') {
        console.log(`Tentando buscar chat com ID: ${chatId} para instância ${instanceId}`);
        const chat = await client.getChatById(chatId);
        if (chat) {
            console.log(`Chat encontrado: ${chat.name || chat.id._serialized}. Buscando mensagens...`);
            const options = { limit: parseInt(limit) };
            if (beforeMessageId) {
                options.before = beforeMessageId;
            }
            const fetchedMessages = await chat.fetchMessages(options);

            // Enrich messages with sender names
            const enrichedMessages = await Promise.all(fetchedMessages.map(async (msg) => {
                if (!msg.fromMe) { // If not sent by me, try to get sender name
                    try {
                        const contact = await msg.getContact();
                        msg.senderName = contact.pushname || contact.name || msg.from;
                    } catch (e) {
                        console.warn(`Could not get contact for message ${msg.id._serialized}:`, e);
                        msg.senderName = msg.from; // Fallback to raw ID
                    }
                } else {
                    msg.senderName = 'Você'; // For messages sent by the current user
                }
                return msg;
            }));
            return enrichedMessages;
        } else {
            console.warn(`Chat com ID ${chatId} não encontrado para instância ${instanceId}.`);
        }
    }
    return [];
};


module.exports = {
    initializeClient,
    getInstanceStatus,
    getInstanceQrCode,
    disconnectClient,
    destroyClient,
    generateInstanceId,
    getChats,
    getMessages,
};
