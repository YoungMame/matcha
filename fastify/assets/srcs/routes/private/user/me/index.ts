import { FastifyInstance } from 'fastify';
import profilePictureRoutes from './profilePicture';
import profileRoutes from './profile';
import completeProfileRoutes from './completeProfile';

const meRoutes = async (fastify: FastifyInstance) => {
    fastify.get('/', async () => {
        return { message: 'Available routes', routes: [
            'PUT /profile-picture', 'POST /profile-picture', 'DELETE /profile-picture',
            'GET /profile', 'PUT /profile', 'DELETE /profile',
        ]};
    });
    fastify.register(profilePictureRoutes, { prefix: '/profile-picture', preHandler: fastify.checkIsCompleted });
    fastify.register(profileRoutes, { prefix: '/profile', preHandler: fastify.checkIsCompleted });
    fastify.register(completeProfileRoutes, { prefix: '/complete-profile', preHandler: fastify.checkIsVerified });
}

export default meRoutes;