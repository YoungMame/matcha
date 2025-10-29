import { FastifyInstance } from 'fastify';
import signupRoutes from './signup';
import loginRoutes from './login';

const authRoutes = async (fastify: FastifyInstance) => {
    fastify.get('/', async () => {
        return { message: 'Available routes', routes: ['POST /signup', 'POST /login'] };
    });
    fastify.register(signupRoutes, { prefix: '/signup' });
    fastify.register(loginRoutes, { prefix: '/login' });
}

export default authRoutes;