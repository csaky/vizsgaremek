const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST || 'smtp.mailtrap.io',
    port: parseInt(process.env.MAIL_PORT) || 2525,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    }
});

async function sendWelcomeEmail(email, name) {
    const mailOptions = {
        from: process.env.MAIL_FROM || 'noreply@bladerunner.com',
        to: email,
        subject: 'Üdvözlünk a BladeRunnerben!',
        text: `Szia ${name}!\n\nKöszönjük, hogy regisztráltál a BladeRunner borbélyszalon foglalási rendszerébe.\n\nMostantól bejelentkezhetsz és időpontot foglalhatsz.\n\nÜdvözlettel,\nA BladeRunner csapata`
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (err) {
        console.error('Email küldési hiba:', err.message);
    }
}

module.exports = { sendWelcomeEmail };
