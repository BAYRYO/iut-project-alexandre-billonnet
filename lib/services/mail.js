'use strict';

const { Service } = require('@hapipal/schmervice');
const Nodemailer = require('nodemailer');

module.exports = class MailService extends Service {

    constructor(server, options) {

        super(server, options);

        this.transporter = Nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: process.env.MAIL_PORT,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASSWORD
            }
        });
    }

    async sendWelcomeEmail(user) {

        const mailOptions = {
            from: process.env.MAIL_USER,
            to: user.mail,
            subject: 'Bienvenue sur notre plateforme',
            html: `
                <h1>Bienvenue ${user.firstName} !</h1>
                <p>Nous sommes ravis de vous compter parmi nos utilisateurs.</p>
                <p>Votre compte a été créé avec succès.</p>
            `
        };

        try {
            await this.transporter.sendMail(mailOptions);
        }
        catch (error) {
            this.server.log(['error', 'mail'], error);
        }
    }

    async sendCsvExport(email, csvContent) {

        const mailOptions = {
            from: process.env.MAIL_USER,
            to: email,
            subject: 'Export CSV des films',
            text: 'Veuillez trouver ci-joint l\'export CSV des films.',
            attachments: [{
                filename: 'movies_export.csv',
                content: csvContent
            }]
        };

        try {
            await this.transporter.sendMail(mailOptions);
        }
        catch (error) {
            this.server.log(['error', 'mail'], error);
        }
    }
};
