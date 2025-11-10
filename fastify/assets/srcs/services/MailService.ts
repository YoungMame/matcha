import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
// @ts-ignore: module 'fastify-nodemailer' has no type declarations
import nodemailerPlugin from 'fastify-nodemailer';

const mailerOptions = {
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
};


class MailService {
    private fastify: FastifyInstance;
    constructor(fastify: FastifyInstance) {
        this.fastify = fastify;
    }

    private async sendMail(to: string, subject: string, html: string) {
        const mailOptions = {
            to,
            subject,
            html,
        };

        try {
            const info = await this.fastify.nodemailer.sendMail(mailOptions);
        } catch (error) {
            this.fastify.log.error(`Error sending email: ${error}`);
            throw error;
        }
    }

    async send2faCode(to: string, code: string) {
        const subject = 'Your 2FA Code';
        const html = `<p>Your 2FA code is: <strong>${code}</strong></p>`;

        await this.sendMail(to, subject, html);
    }

    async sendEmailVerification(to: string, userId: number, code: string) {
        const verificationLink = `${process.env.DOMAIN}/api/auth/verify-email/${userId}/${code}`;
        const subject = 'Verify Your Email Address';
        const html = `<p>Please verify your email by clicking the link below:</p>
                      <a href="${verificationLink}">Verify your Email</a>`;

        await this.sendMail(to, subject, html);
    }

    async sendPasswordResetCode(to: string, code: string) {
        const subject = 'Your Password Reset Code';
        const html = `<p>Your password reset code is: <strong>${code}</strong></p>`;

        await this.sendMail(to, subject, html);
    }
}

export default fp(async (fastify: FastifyInstance) => {
    fastify.register(nodemailerPlugin, mailerOptions);
    const mailService = new MailService(fastify);
    fastify.decorate('mailService', mailService);
});