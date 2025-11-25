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
        scope: ['email', 'user_location', 'user_gender', 'user_birthday', 'public_profile'],
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
        callbackUri: req => `${req.protocol}://${req.hostname}/auth/login/facebook/callback`,
    })

    // The service provider redirect the user here after successful login
    fastify.get('/auth/login/facebook/callback', async function (request, reply) {
        const { token } = await this.facebookOAuth2.getAccessTokenFromAuthorizationCodeFlow(request)

        console.log('access token', token.access_token)
        const userInfos = await this.facebookOAuth2.userinfo(token.access_token);
        console.log('user infos', userInfos);
        const existigUser = await this.userService.debugGetUser(userInfos.email);
        // if (!existigUser) {
            // const createdUser = await this.userService.createUser()
        reply.cookie('refresh_token', token.refresh_token).send({ access_token: token.access_token })
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