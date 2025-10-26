import { FastifyInstance } from 'fastify';
import signupRoutes from './signup';
import loginRoutes from './login';

const authRoutes = async (fastify: FastifyInstance) => {
    fastify.register(signupRoutes, { prefix: '/signup' });
    fastify.register(loginRoutes, { prefix: '/login' });
}

export default authRoutes;