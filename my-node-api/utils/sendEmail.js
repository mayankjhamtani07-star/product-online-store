const nodemailer = require("nodemailer");

const sendEmail = async (email, subject, html) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASS,
        },
    });

    await transporter.sendMail({ to: email, subject, html });
};

module.exports = sendEmail;
