import { FastifyInstance } from 'fastify';
import signupRoutes from './signup';
import loginRoutes from './login';
import verifyEmailRoutes from './verifyEmail';

const authRoutes = async (fastify: FastifyInstance) => {
    fastify.get('/', async () => {
        return { message: 'Available routes', routes: ['POST /signup', 'POST /login', 'GET /verify-email'] };
    });
    fastify.register(signupRoutes, { prefix: '/signup' });
    fastify.register(loginRoutes, { prefix: '/login' });
    fastify.register(verifyEmailRoutes, { prefix: '/verify-email' });
}

export default authRoutes;