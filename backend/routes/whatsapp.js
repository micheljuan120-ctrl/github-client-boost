const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const { initializeClient, getInstanceStatus, getInstanceQrCode, disconnectClient, destroyClient, generateInstanceId, getChats, getMessages } = require('../services/whatsappManager');
const { pool } = require('../config/db');

// Rota para conectar/inicializar uma instância do WhatsApp
router.post('/connect', authenticateToken, async (req, res) => {
    const userId = req.user.id; // Obtém o ID do usuário do token
    const { instanceId: requestedInstanceId, name: instanceName } = req.body; // Pode ser um ID existente ou nulo para nova instância, e o nome

    let instanceId = requestedInstanceId;
    let nameToSave = instanceName; // Inicializa com o nome fornecido

    if (!instanceId) {
        instanceId = generateInstanceId();
        if (!nameToSave) { // Se nenhum nome foi fornecido, gera um padrão
            nameToSave = `Instância ${instanceId.substring(0, 8)}`;
        }
        // Salva a nova instância no DB com status 'pending' e o nome
        await pool.query(
            `INSERT INTO whatsapp_instances (id, user_id, status, name) VALUES ($1, $2, $3, $4)`,
            [instanceId, userId, 'pending', nameToSave]
        );
    }

    const currentStatus = getInstanceStatus(userId, instanceId);
    const currentQrCode = getInstanceQrCode(userId, instanceId);

    if (currentStatus === 'connected') {
        return res.status(200).json({ status: 'connected', message: 'WhatsApp já está conectado.', instanceId });
    }
    if (currentStatus === 'qr_received' && currentQrCode) {
        return res.status(200).json({ status: 'qr_received', qrCode: currentQrCode, message: 'Aguardando escaneamento do QR Code.', instanceId });
    }

    try {
        const instance = await initializeClient(userId, instanceId);
        res.status(200).json({ status: instance.status, qrCode: instance.qrCode, message: 'Iniciando processo de conexão. Aguarde o QR Code.', instanceId });
    } catch (error) {
        console.error('Erro na rota /api/whatsapp/connect:', error);
        res.status(500).json({ status: 'error', message: 'Erro ao iniciar conexão do WhatsApp.' });
    }
});

// Rota para desconectar uma instância do WhatsApp
router.post('/disconnect', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const { instanceId } = req.body;

    if (!instanceId) {
        return res.status(400).json({ message: 'Instance ID is required.' });
    }

    const success = await disconnectClient(userId, instanceId);
    if (success) {
        res.status(200).json({ status: 'disconnected', message: 'WhatsApp desconectado. Instância salva.' });
    } else {
        res.status(400).json({ status: 'error', message: 'WhatsApp não está conectado para desconectar ou instância não encontrada.' });
    }
});

// Rota para fazer logout e destruir uma instância do WhatsApp
router.post('/logout', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const { instanceId } = req.body;

    if (!instanceId) {
        return res.status(400).json({ message: 'Instance ID is required.' });
    }

    const success = await destroyClient(userId, instanceId);
    if (success) {
        res.status(200).json({ status: 'logged_out', message: 'Sessão WhatsApp encerrada e instância removida.' });
    } else {
        res.status(400).json({ status: 'error', message: 'Nenhuma instância WhatsApp para fazer logout ou instância não encontrada.' });
    }
});

// Rota para obter o status de uma ou todas as instâncias do WhatsApp de um usuário
router.get('/status', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const { instanceId } = req.query; // Pode ser passado via query param

    if (!instanceId) {
        // Se nenhum instanceId for fornecido, retorna o status de todas as instâncias do usuário
        try {
            const result = await pool.query(
                `SELECT id, status, qr_code_data, name FROM whatsapp_instances WHERE user_id = $1 ORDER BY created_at DESC`,
                [userId]
            );
            return res.status(200).json(result.rows);
        } catch (error) {
            console.error('Erro ao buscar status de todas as instâncias do DB:', error);
            return res.status(500).json({ message: 'Erro interno do servidor ao buscar instâncias.' });
        }
    }

    const status = getInstanceStatus(userId, instanceId);
    const qrCode = getInstanceQrCode(userId, instanceId);

    res.status(200).json({ status, qrCode, instanceId });
});

// Rota para obter todos os chats de uma instância específica
router.get('/chats', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const { instanceId } = req.query;

    if (!instanceId) {
        return res.status(400).json({ message: 'Instance ID is required.' });
    }

    try {
        const chats = await getChats(userId, instanceId);
        res.status(200).json(chats);
    } catch (error) {
        console.error('Erro ao buscar chats:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao buscar chats.' });
    }
});

// Rota para obter mensagens de um chat específico
router.get('/messages', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const { instanceId, chatId, limit, beforeMessageId } = req.query; // Adicionado 'beforeMessageId'

    if (!instanceId || !chatId) {
        return res.status(400).json({ message: 'Instance ID and Chat ID are required.' });
    }

    try {
        const messages = await getMessages(userId, instanceId, chatId, limit, beforeMessageId);
        res.status(200).json(messages);
    } catch (error) {
        console.error('Erro ao buscar mensagens:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao buscar mensagens.' });
    }
});

// Rota para deletar e destruir uma instância do WhatsApp
router.delete('/:instanceId', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const { instanceId } = req.params; // Obtém o instanceId dos parâmetros da URL

    if (!instanceId) {
        return res.status(400).json({ message: 'Instance ID is required.' });
    }

    try {
        const success = await destroyClient(userId, instanceId);
        if (success) {
            res.status(200).json({ status: 'deleted', message: 'Sessão WhatsApp encerrada e instância removida com sucesso.' });
        } else {
            res.status(404).json({ status: 'error', message: 'Instância WhatsApp não encontrada ou já desconectada.' });
        }
    } catch (error) {
        console.error('Erro na rota DELETE /api/whatsapp/:instanceId:', error);
        res.status(500).json({ status: 'error', message: 'Erro interno do servidor ao tentar deletar a instância WhatsApp.' });
    }
});

module.exports = router;
