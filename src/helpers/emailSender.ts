import nodemailer from 'nodemailer';
import config from '../config';

const emailSender = async (email: string, html: string) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: config.emailSender.email,
      pass: config.emailSender.app_pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  await transporter.sendMail({
    from: '"Revalto" <sazzad.hossain882@gmail.com>', // sender address
    to: email, // list of receivers
    subject: 'Reset Password Link', // Subject line
    //text: "Hello world?", // plain text body
    html, // html body
  });
};

export default emailSender;
