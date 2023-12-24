const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'in.mailjet.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.MAILJET_API_KEY,
        pass: process.env.MAILJET_SECRET_KEY
    }
});

const sendMail = async (to, subject, htmlContent) => {
    const mailOptions = {
        from: 'ContactsHubPET@meta.ua',
        to: to,
        subject: subject,
        html: htmlContent
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Message sent: %s', info.messageId);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

module.exports = { sendMail };
