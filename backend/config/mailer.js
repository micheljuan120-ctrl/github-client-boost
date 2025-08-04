const nodemailer = require('nodemailer');

// Configuração para usar o Ethereal, um serviço de teste de e-mail gratuito.
// Em produção, você substituiria isso pelas suas credenciais de SMTP (ex: SendGrid, Mailgun, Gmail).
const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: 'j3xeevolyclne7ie@ethereal.email', // Usuário de teste gerado pelo Ethereal
    pass: '4Jk7AAGXsywht7e7G2', // Senha de teste gerada pelo Ethereal
  },
});

const sendVerificationEmail = async (to, code) => {
  const mailOptions = {
    from: '"Seu App" <no-reply@yourapp.com>',
    to: to,
    subject: 'Seu Código de Verificação',
    html: `
      <div style="font-family: sans-serif; text-align: center; padding: 20px;">
        <h2>Verificação de E-mail</h2>
        <p>Obrigado por se registrar. Use o código abaixo para verificar seu e-mail:</p>
        <p style="font-size: 24px; font-weight: bold; letter-spacing: 5px; background: #f0f0f0; padding: 10px; border-radius: 5px;">
          ${code}
        </p>
        <p>Este código expira em 10 minutos.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('E-mail de verificação enviado: %s', info.messageId);
    // URL para visualizar o e-mail de teste no Ethereal:
    console.log('URL de Pré-visualização: %s', nodemailer.getTestMessageUrl(info));
    return { success: true, previewUrl: nodemailer.getTestMessageUrl(info) };
  } catch (error) {
    console.error('Erro ao enviar e-mail de verificação:', error);
    return { success: false, error };
  }
};

module.exports = { sendVerificationEmail };
