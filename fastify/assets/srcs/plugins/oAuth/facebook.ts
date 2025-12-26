import fp from 'fastify-plugin'
import oauthPlugin, {  } from '@fastify/oauth2'

const MAX_USERNAME_RETRIES = 10;

export default fp(async function(fastify, opts) {
    const CLIENT_ID = process.env.FACEBOOK_CLIENT_ID;
    const CLIENT_SECRET = process.env.FACEBOOK_CLIENT_SECRET;
    if (!CLIENT_ID || !CLIENT_SECRET)
        throw new Error('Missing FACEBOOK_CLIENT_ID or FACEBOOK_CLIENT_SECRET environment variable');

    fastify.register(oauthPlugin, {
        name: 'facebookOAuth2',
        scope: ['public_profile', 'email', 'user_birthday', 'user_gender'],
        credentials: {
            client: {
                id: CLIENT_ID,
                secret: CLIENT_SECRET
            },
            auth: oauthPlugin.FACEBOOK_CONFIGURATION
        },
        // register a fastify url to start the redirect flow to the service provider's OAuth2 login
        startRedirectPath: '/auth/login/facebook',
        // service provider redirects here after user login
        callbackUri: req => `https://matcha.fr/api/auth/login/facebook/callback/`,
    })

    // The service provider redirect the user here after successful login
    fastify.get('/auth/login/facebook/callback/', async function (request, reply) {
        const { token } = await this.facebookOAuth2.getAccessTokenFromAuthorizationCodeFlow(request);
        const fields = ['id', 'name', 'email', 'birthday', 'gender'].join(',');
        const graphRes = await fetch(`https://graph.facebook.com/me?fields=${fields}&access_token=${token.access_token}`);
        if (!graphRes.ok) {
            const text = await graphRes.text();
            return reply.status(500).send({ error: 'Failed to fetch facebook userinfo' });
        }

        const userInfos = await graphRes.json();
        if (!userInfos || !userInfos.email || !userInfos.name) {
            return reply.status(400).send({ error: 'Invalid user info received from Facebook' });
        }

        const existigUser = await this.userService.getUser(userInfos.email || '');
        if (existigUser && existigUser.provider !== 'facebook') {
            return reply.status(400).send({ error: 'Email already used with another provider' });
        } else if (existigUser && existigUser.provider === 'facebook') {
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
            let baseUsername = userInfos.name;
            let retryCount = 0;

            while (isUsernameTaken) {
                if (retryCount >= MAX_USERNAME_RETRIES) {
                    return reply.status(500).send({ error: 'Failed to generate unique username after maximum retries' });
                }
                const suffix = Math.floor(Math.random() * 10000);
                const tryUsername = `${baseUsername}${suffix}`;
                const userByUsername = await this.userService.getUserByUsername(tryUsername);
                if (!userByUsername) {
                    baseUsername = tryUsername;
                    isUsernameTaken = false;
                }
                retryCount++;
            }
            await this.userService.createUser(
                userInfos.email,
                'NoPasswordFacebookOAuth2',
                baseUsername,
                'facebook'
            );

            const existigUser = await this.userService.getUser(userInfos.email);
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