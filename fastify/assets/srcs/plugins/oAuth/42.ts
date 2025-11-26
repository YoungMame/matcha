import fp from 'fastify-plugin'
import oauthPlugin, {  } from '@fastify/oauth2'
import { FastifyRequest } from 'fastify';
import { FastifyReply } from 'fastify/types/reply';

export default fp(async function(fastify, opts) {
    const CLIENT_ID = process.env['FT_CLIENT_ID'];
    const CLIENT_SECRET = process.env['FT_CLIENT_SECRET'];
    if (!CLIENT_ID || !CLIENT_SECRET)
        throw new Error('Missing FT_CLIENT_ID or FT_CLIENT_SECRET environment variable');

    fastify.get('/auth/login/42', async function (request, reply) {
        const url = `https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-164069d052052d412516d442f502a23c7662d19adb38400ed23e2f5a841eac37&redirect_uri=https%3A%2F%2Fmatcha.fr%2Fapi%2Fauth%2Flogin%2F42%2Fcallback%2F&response_type=code`;
        reply.status(302).redirect(url);
    });

    // The service provider redirect the user here after successful login
    fastify.get('/auth/login/42/callback/', async function (request: FastifyRequest, reply: FastifyReply) {
        const q = request.query as { code?: string };
        const code = q.code;

        const res = await fetch('https://api.intra.42.fr/oauth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                grant_type: 'authorization_code',
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                code: code,
                redirect_uri: 'https://matcha.fr/api/auth/login/42/callback/',
            }),
        });

        const tokenData = await res.json();
        if (!tokenData.access_token) {
            return reply.status(502).send({ error: 'Failed to obtain access token from 42' });
        }

        const userRes = await fetch('https://api.intra.42.fr/v2/me', {
            headers: {
                'Authorization': `Bearer ${tokenData.access_token}`,
            },
        });

        const userInfo = await userRes.json();
        if (!userInfo || !userInfo.login) {
            return reply.status(502).send({ error: 'Failed to obtain user infos from 42' });
        }

        if (!userInfo || !userInfo.email || !userInfo.login) {
            return reply.status(400).send({ error: 'Invalid user info received from 42' });
        }

        const existigUser = await this.userService.getUser(userInfo.email || '');
        if (existigUser && existigUser.provider !== '42') {
            return reply.status(400).send({ error: 'Email already used with another provider' });
        } else if (existigUser && existigUser.provider === '42') {
            const jwt = await fastify.jwt.sign({ id: existigUser.id, email: existigUser.email, username: existigUser.username, isVerified: existigUser.isVerified, isCompleted: existigUser.isProfileCompleted });

            reply.setCookie('jwt', jwt, { 
                domain: process.env.DOMAIN || 'localhost',
                path: '/',
                signed: true,
                maxAge: 3600 * 24 * 7
            });
            reply.status(201).send({ message: 'User logged in successfully' });
        } else {
            let isUsernameTaken = true;
            let baseUsername = userInfo.login;

            while (isUsernameTaken) {
                const suffix = Math.floor(Math.random() * 10000);
                const tryUsername = `${baseUsername}${suffix}`;
                const userByUsername = await this.userService.getUserByUsername(tryUsername);
                if (!userByUsername) {
                    baseUsername = tryUsername;
                    isUsernameTaken = false;
                }
            }
            await this.userService.createUser(
                userInfo.email,
                'NoPassword42OAuth2',
                baseUsername,
                '42'
            );

            const existigUser = await this.userService.getUser(userInfo.email);
            await this.userService.verifyEmail(Number(existigUser.id)!, undefined);
            const jwt = await fastify.jwt.sign({ id: existigUser.id, email: existigUser.email, username: existigUser.username, isVerified: true, isCompleted: existigUser.isProfileCompleted });
    
            reply.setCookie('jwt', jwt, { 
                domain: process.env.DOMAIN || 'localhost',
                path: '/',
                signed: true,
                maxAge: 3600 * 24 * 7
            });
            reply.status(202).send({ message: 'User created and logged in successfully' });
        }
    });
});