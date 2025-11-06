const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendNewUserNotification = (user) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: 'ciprianoshunter@gmail.com',
    subject: '🎉 Novo Login no Site do Casal!',
    html: `
      <h3>Um novo usuário acabou de entrar no site:</h3>
      <p><strong>Nome:</strong> ${user.name}</p>
      <p><strong>Email:</strong> ${user.email}</p>
      <p><em>Data do Login:</em> ${new Date(user.created_at).toLocaleString('pt-BR')}</p>
    `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Erro ao enviar e-mail de novo usuário:', error);
    } else {
      console.log('E-mail de novo usuário enviado:', info.response);
    }
  });
};

const sendMessageNotification = (senderEmail, receiverEmail, messageContent) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: receiverEmail,
    subject: `💌 Você recebeu uma nova mensagem de ${senderEmail}!`,
    html: `
      <h3>Olá! Você tem uma nova mensagem no site.</h3>
      <blockquote>
        <p>"${messageContent}"</p>
      </blockquote>
      <p>Acesse o site para responder!</p>
    `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Erro ao enviar e-mail de notificação de mensagem:', error);
    } else {
      console.log('E-mail de notificação de mensagem enviado:', info.response);
    }
  });
};

module.exports = {
  sendNewUserNotification,
  sendMessageNotification,
};