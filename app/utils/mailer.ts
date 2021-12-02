import nodemailer from 'nodemailer'

const sender = '"My Simple Workout Tracker" <info@mswt.com';

function setup() {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
  });
}

function sendConfirmationEmail(user) {
  console.log('Confirmation email sending');

  const transport = setup();
  const url = user.generateConfirmationUrl();
  const email = {
    sender,
    to: user.email,
    subject: 'Welcome to Trellolike',
    text: `
      Welcome to Trellolike, ${user.nickname}! Please, confirm your email.
    
      ${url}
    `,
  };

  return transport.sendMail(email);
}

function sendResetPasswordEmail(user) {
  console.log('Reset password email sending');
  const transport = setup();
  const email = {
    sender,
    to: user.email,
    subject: 'Reset Password',
    text: `
      To reset password follow this link
    
      ${user.generateResetPasswordUrl()}
    `,
  };

  return transport.sendMail(email);
}

export {
  sendConfirmationEmail,
  sendResetPasswordEmail,
}