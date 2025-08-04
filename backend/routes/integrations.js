const express = require('express');
const router = express.Router();
const { encrypt, decrypt } = require('../config/encryption'); // Importa as funções de criptografia do novo arquivo
const { pool } = require('../config/db'); // Importa o pool do novo arquivo
const { authenticateToken } = require('../middleware/authMiddleware'); // Importa o middleware de autenticação

// Rota para adicionar uma nova integração (protegida)
router.post('/', authenticateToken, async (req, res) => {
    const { name, type, config } = req.body;
    const userId = req.user.id; // Obtém o ID do usuário do token

    if (!name || !type || !config || !config.apiKey) {
        return res.status(400).json({ message: 'Name, type, and config.apiKey are required' });
    }

    try {
        const encryptedApiKey = encrypt(config.apiKey); // Criptografa a API Key

        const result = await pool.query(
            'INSERT INTO integrations (user_id, name, type, api_key, model, temperature, prompt) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;',
            [userId, name, type, encryptedApiKey, config.model || null, parseFloat(config.temperature) || null, config.prompt || null]
        );

        const newIntegration = result.rows[0];
        // Descriptografa a API Key antes de enviar a resposta para o frontend (opcional, mas bom para consistência)
        newIntegration.api_key = decrypt(newIntegration.api_key);
        res.status(201).json(newIntegration);
    } catch (error) {
        console.error('Erro ao adicionar integração:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao adicionar integração.' });
    }
});

// Rota para listar todas as integrações do usuário (protegida)
router.get('/', authenticateToken, async (req, res) => {
    const userId = req.user.id; // Obtém o ID do usuário do token

    try {
        const result = await pool.query(
            'SELECT id, name, type, api_key, model, temperature, prompt, created_at, updated_at FROM integrations WHERE user_id = $1;',
            [userId]
        );

        const integrations = result.rows.map(integration => ({
            id: integration.id,
            name: integration.name,
            type: integration.type,
            createdAt: integration.created_at,
            updatedAt: integration.updated_at,
            config: {
                apiKey: decrypt(integration.api_key), // Descriptografa e coloca em config
                model: integration.model,
                temperature: parseFloat(integration.temperature), // Garante que seja um número
                prompt: integration.prompt,
            },
        }));

        res.status(200).json(integrations);
    } catch (error) {
        console.error('Erro ao listar integrações:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao listar integrações.' });
    }
});

// Rota para obter uma integração por ID (protegida)
router.get('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id; // Obtém o ID do usuário do token

    try {
        const result = await pool.query(
            'SELECT id, name, type, api_key, model, temperature, prompt, created_at, updated_at FROM integrations WHERE id = $1 AND user_id = $2;',
            [id, userId]
        );

        const integration = result.rows[0];
        if (integration) {
            const formattedIntegration = {
                id: integration.id,
                name: integration.name,
                type: integration.type,
                createdAt: integration.created_at,
                updatedAt: integration.updated_at,
                config: {
                    apiKey: decrypt(integration.api_key), // Descriptografa e coloca em config
                    model: integration.model,
                    temperature: parseFloat(integration.temperature), // Garante que seja um número
                    prompt: integration.prompt,
                },
            };
            res.status(200).json(formattedIntegration);
        } else {
            res.status(404).json({ message: 'Integration not found or not authorized' });
        }
    } catch (error) {
        console.error('Erro ao obter integração por ID:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao obter integração.' });
    }
});

// Rota para atualizar uma integração (protegida)
router.put('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id; // Obtém o ID do usuário do token
    const { name, type, config } = req.body;

    if (!name || !type || !config) {
        return res.status(400).json({ message: 'Name, type, and config are required' });
    }

    try {
        let encryptedApiKey = null;
        if (config.apiKey) {
            encryptedApiKey = encrypt(config.apiKey); // Criptografa a API Key se fornecida
        }

        const result = await pool.query(
            'UPDATE integrations SET name = $1, type = $2, api_key = COALESCE($3, api_key), model = $4, temperature = $5, prompt = $6, updated_at = CURRENT_TIMESTAMP WHERE id = $7 AND user_id = $8 RETURNING *;',
            [name, type, encryptedApiKey, config.model || null, parseFloat(config.temperature) || null, config.prompt || null, id, userId]
        );

        const updatedIntegration = result.rows[0];
        if (updatedIntegration) {
            updatedIntegration.api_key = decrypt(updatedIntegration.api_key); // Descriptografa a API Key
            res.status(200).json(updatedIntegration);
        } else {
            res.status(404).json({ message: 'Integration not found or not authorized' });
        }
    } catch (error) {
        console.error('Erro ao atualizar integração:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao atualizar integração.' });
    }
});

// Rota para deletar uma integração (protegida)
router.delete('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id; // Obtém o ID do usuário do token

    try {
        const result = await pool.query(
            'DELETE FROM integrations WHERE id = $1 AND user_id = $2 RETURNING id;',
            [id, userId]
        );

        if (result.rows.length > 0) {
            res.status(204).send(); // No Content
        } else {
            res.status(404).json({ message: 'Integration not found or not authorized' });
        }
    } catch (error) {
        console.error('Erro ao deletar integração:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao deletar integração.' });
    }
});

module.exports = router;