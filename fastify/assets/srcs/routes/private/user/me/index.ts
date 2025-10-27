import { FastifyInstance } from 'fastify';
import profilePictureRoutes from './profilePicture';

const meRoutes = async (fastify: FastifyInstance) => {
    fastify.get('/', async () => {
        return { message: 'Available routes', routes: ['PUT /profile-picture', 'POST /profile-picture', 'DELETE /profile-picture'] };
    });
    fastify.register(profilePictureRoutes, { prefix: '/profile-picture' });
}

export default meRoutes;