import { FastifyInstance } from 'fastify';
import profilePictureRoutes from './profilePicture';
import profileRoutes from './profile';

const meRoutes = async (fastify: FastifyInstance) => {
    fastify.get('/', async () => {
        return { message: 'Available routes', routes: [
            'PUT /profile-picture', 'POST /profile-picture', 'DELETE /profile-picture',
            'GET /profile', 'PUT /profile', 'DELETE /profile',
        ]};
    });
    fastify.register(profilePictureRoutes, { prefix: '/profile-picture' });
    fastify.register(profileRoutes, { prefix: '/profile' });
}

export default meRoutes;