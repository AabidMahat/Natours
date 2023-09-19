const nodemailer = require('nodemailer');
const pug = require('pug');
const { htmlToText } = require('html-to-text');

module.exports = class Email {
    constructor(email, url) {
        this.to = email;
        // this.firstName = user.name.split(' ')[0];
        this.url = url;
        this.from = `Aabid Mahat <${process.env.EMAIL_FROM}>`;
    }
    newTransport() {
        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
    }

    // Send the actual mail
    async send(template, subject) {
        //1) Render HTML based on a pug template
        const html = pug.renderFile(
            `${__dirname}/../views/emails/${template}.pug`,
            {
                // firstName: this.firstName,
                url: this.url,
                subject,
            }
        );
        // 2) Define the email option
        const mailOption = {
            from: this.from,
            to: this.to,
            subject,
            html,
            text: htmlToText(html),
            // html
        };

        // 3) Create a transport
        // await transporter.sendMail(mailOption);
        await this.newTransport().sendMail(mailOption);
    }
    async sendWelcome() {
        await this.send('welcome', 'Welcome to the Natours Family!!');
    }

    async sendPasswordReset() {
        await this.send(
            'passwordReset',
            'Your Password Reset token (valid For 10 mins)'
        );
    }
    async signUpUser() {
        await this.send(
            'signUp',
            'Your verification mail  (valid For 10 mins)'
        );
    }
};
