const path=require('path'); // Importa o módulo path primeiro
require('dotenv').config({ path: path.resolve(__dirname, '.env') }); // Garante que o dotenv seja carregado primeiro com caminho absoluto

const express=require('express');
const app=express();
const http = require('http');
const { Server } = require('socket.io');
const PORT=process.env.PORT || 3001;

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*", // Permitir todas as origens para desenvolvimento. Ajustar em produção.
        methods: ["GET", "POST"]
    }
});

module.exports = { io }; // Mover a exportação para aqui

const { Client, LocalAuth }=require('whatsapp-web.js');
const qrcode=require('qrcode');
const { Pool }=require('pg');
const cors=require('cors');
const jwt = require('jsonwebtoken'); // Importar jsonwebtoken
const { encrypt, decrypt } = require('./config/encryption');

// Middleware de autenticação para Socket.IO
io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
        return next(new Error('Authentication error: Token not provided'));
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return next(new Error('Authentication error: Invalid token'));
        }
        socket.userId = decoded.id; // Adiciona o userId ao objeto socket
        next();
    });
});

io.on('connection', (socket) => {
    console.log(`Usuário conectado via WebSocket: ${socket.userId}`);
    // Fazer o socket entrar em uma sala com o ID do usuário
    socket.join(socket.userId);

    socket.on('disconnect', () => {
        console.log(`Usuário desconectado via WebSocket: ${socket.userId}`);
    });

    // Opcional: Se você quiser que o frontend possa explicitamente "entrar" em salas
    socket.on('join_room', (data) => {
        if (data.userId && data.userId === socket.userId) { // Garante que o usuário só pode entrar na sua própria sala
            socket.join(data.userId);
            console.log(`Socket ${socket.id} entrou na sala ${data.userId}`);
        } else {
            console.warn(`Tentativa inválida de entrar na sala: ${data.userId}`);
        }
    });
});


const { pool } = require('./config/db');

// Middlewares
app.use(express.json());
app.use(cors());

const { initializeClient, getInstanceStatus, getInstanceQrCode, disconnectClient, destroyClient, generateInstanceId, getChats, getMessages } = require('./services/whatsappManager');
const { authenticateToken } = require('./middleware/authMiddleware');

// --- Rotas da API ---
const authRoutes = require('./routes/auth');
const integrationsRoutes = require('./routes/integrations');
const whatsappRoutes = require('./routes/whatsapp'); // Importa as novas rotas do WhatsApp
app.use('/api', authRoutes);
app.use('/api/integrations', integrationsRoutes);
app.use('/api/whatsapp', whatsappRoutes); // Usa as novas rotas do WhatsApp



httpServer.listen(PORT, () => {
    console.log(`Backend rodando em http://localhost:${PORT}`);
});

module.exports = { io };
