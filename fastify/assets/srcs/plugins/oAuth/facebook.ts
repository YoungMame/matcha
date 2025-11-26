import fp from 'fastify-plugin'
import oauthPlugin, {  } from '@fastify/oauth2'
import { FastifyRequest, FastifyReply, FastifyPluginAsync } from 'fastify'

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
        console.log('Facebook callback called');
        const { token } = await this.facebookOAuth2.getAccessTokenFromAuthorizationCodeFlow(request)

        // Fetch profile directly from Facebook Graph API (plugin.userinfo cannot be used without discovery)
        const fields = ['id', 'name', 'email', 'birthday', 'gender'].join(',');
        const graphRes = await fetch(`https://graph.facebook.com/me?fields=${fields}&access_token=${token.access_token}`);
        if (!graphRes.ok) {
            const text = await graphRes.text();
            console.log('Failed to fetch facebook userinfo:', text);
            return reply.status(500).send({ error: 'Failed to fetch facebook userinfo' });
        }
        const userInfos = await graphRes.json();
        if (!userInfos || !userInfos.email || !userInfos.name) {
            console.log('Invalid user info received from Facebook:', userInfos);
            return reply.status(500).send({ error: 'Invalid user info received from Facebook' });
        }
        const existigUser = await this.userService.getUser(userInfos.email || '');
        if (!existigUser) {
            console.log('Creating new user from facebook infos');
            let isUsernameTaken = true;
            let baseUsername = userInfos.name;
            while (isUsernameTaken) {
                const suffix = Math.floor(Math.random() * 10000);
                const tryUsername = `${baseUsername}${suffix}`;
                const userByUsername = await this.userService.getUser(tryUsername);
                if (!userByUsername) {
                    baseUsername = tryUsername;
                    isUsernameTaken = false;
                }
            }
            const newUserId = await this.userService.createUser(
                userInfos.email,
                'NoPasswordFacebookOAuth2',
                baseUsername,
                'facebook'
            );
            if (!newUserId) {
                return reply.status(500).send();
            }
            this.userService.verifyEmail(Number(newUserId)!, undefined);
        }
        // if (!existigUser) { ...create user... }
        reply.cookie('refresh_token', token.refresh_token).send({ access_token: token.access_token });
    });

    fastify.post('/auth/login/facebook/refresh', async function (request: FastifyRequest, reply: FastifyReply) {
        const refresh_token = request.cookies.refresh_token ? reply.unsignCookie(request.cookies.refresh_token).value : { refresh_token: null };

        if (!refresh_token)
            return reply.redirect(`${request.protocol}://${request.hostname}/auth/login/facebook`);
        try {
            const { token: newToken } = await this.facebookOAuth2.getNewAccessTokenUsingRefreshToken(refresh_token);
            
            reply.send({ access_token: newToken.access_token, refresh_token: newToken.refresh_token });
        } catch (error) {
            return reply.redirect(`${request.protocol}://${request.hostname}/api/login/facebook`);
        }
    });

    fastify.decorate("revokeFacebookToken", async function(accessToken?: string, refreshToken?: string): Promise<void> {
        try {
            if (!accessToken && !refreshToken) {
                throw new Error('No token provided to revoke');
            }

            if (!accessToken && refreshToken) {
                const { token } = await this.facebookOAuth2.getNewAccessTokenUsingRefreshToken(refreshToken);
                accessToken = token.access_token;
            }
            if (accessToken)
                await this.facebookOAuth2.revokeToken(accessToken, 'access_token');
        } catch (error) {
            console.error('Error revoking Facebook token:', error);
            throw error;
        }
    });

    fastify.decorate("revokeFacebookAllTokens", async function(accessToken?: string, refreshToken?: string): Promise<void> {
        try {
            if (!accessToken && !refreshToken) {
                throw new Error('No token provided to revoke');
            }

            if (!accessToken && refreshToken) {
                const { token } = await this.facebookOAuth2.getNewAccessTokenUsingRefreshToken(refreshToken);
                accessToken = token.access_token;
            }
            if (accessToken)
                await this.facebookOAuth2.revokeAllToken(accessToken, undefined);
        } catch (error) {
            console.error('Error revoking Facebook token:', error);
            throw error;
        }
    });
});