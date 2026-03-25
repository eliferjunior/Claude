const nodemailer = require('nodemailer');
const Imap = require('imap');

// IMPORTANTE: Gere uma NOVA senha de app no Google
// https://myaccount.google.com/apppasswords
// A senha anterior foi exposta e deve ser revogada!
const EMAIL = 'sextafeiraa3@gmail.com';
const APP_PASSWORD = 'COLE_SUA_NOVA_SENHA_DE_APP_AQUI';

// === ENVIAR E-MAIL ===
async function enviarEmail(para, assunto, mensagem) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: EMAIL, pass: APP_PASSWORD },
  });

  const info = await transporter.sendMail({
    from: EMAIL,
    to: para,
    subject: assunto,
    html: mensagem,
  });

  console.log('E-mail enviado! ID:', info.messageId);
  return info;
}

// === EXEMPLO DE USO ===
enviarEmail(
  'eliferjunior37@gmail.com',
  'E-mail de Teste - Claude Code',
  '<h2>Teste</h2><p>E-mail enviado com sucesso pelo Claude Code!</p>',
).catch(console.error);
