import { FastifyInstance } from 'fastify';
import authRoutes from './auth';
import privateRoutes from './private';

const indexRoutes = async (fastify: FastifyInstance) => {
    fastify.get('/', async () => {
        return { message: 'Welcome to the API', routes: ['/auth', '/private', '/ws'] };
    });
    
    fastify.get('/hello', async () => {
        return { hello: 'world', status: 'ok' };
    });
    
    fastify.register(authRoutes, { prefix: '/auth' });

    fastify.register(async function(instance) {
        instance.addHook('preHandler', async (request, reply) => {
            console.log('Authenticating request to private routes: ', request.url);
            console.log('Cookies: ', request.cookies);
            console.log('Headers: ', request.headers);
            await instance.authenticate(request, reply);
        });
        instance.register(privateRoutes, { prefix: '/private' });
    });
}

export default indexRoutes;