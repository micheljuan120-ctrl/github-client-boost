const crypto = require('crypto');

// Verifica se a chave de criptografia foi carregada
if (!process.env.ENCRYPTION_KEY) {
    console.error('\nERRO CRÍTICO: ENCRYPTION_KEY não encontrada no arquivo .env.\n');
    console.error('Por favor, verifique se o arquivo .env existe na pasta backend e contém a linha:');
    console.error('ENCRYPTION_KEY=sua_chave_gerada_aqui');
    console.error("Certifique-se de que não há espaços antes ou depois do '=' e que a chave foi gerada corretamente.\n");
    process.exit(1); // Sai do processo com erro
}

const algorithm = 'aes-256-cbc';
const encryptionKey = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
const ivLength = 16;

function encrypt(text) {
    if (!text) return text;
    const iv = crypto.randomBytes(ivLength);
    const cipher = crypto.createCipheriv(algorithm, encryptionKey, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
}

function decrypt(text) {
    if (!text) return text;
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = textParts.join(':');
    const decipher = crypto.createDecipheriv(algorithm, encryptionKey, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

module.exports = { encrypt, decrypt };
