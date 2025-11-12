import { FastifyInstance } from 'fastify';
import { viewProfileHandler } from '../../../../controllers/private/view';

const viewRoutes = async (fastify: FastifyInstance) => {
    fastify.get('/:id', {
        schema: {
            params: {
                type: 'object',
                properties: {
                    id: { type: 'integer', minimum: 0 }
                },
                required: ['id'],
                additionalProperties: false
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        username: { type: 'string', minLength: 2, maxLength: 100 },
                        profilePictureIndex: { type: 'integer' },
                        profilePictures: { type: 'array', items: { type: 'string', format: 'uri' } },
                        bio: { type: 'string', maxLength: 100 },
                        tags: { type: 'array', items: { type: 'string' } },
                        bornAt: { type: 'string', format: 'date-time' },
                        gender: { type: 'string', enum: ['male', 'female'] },
                        orientation: { type: 'string', enum: ['heterosexual', 'homosexual', 'bisexual'] },
                        location: {
                            type: 'object',
                            properties: {
                                latitude: { type: 'number', nullable: true },
                                longitude: { type: 'number', nullable: true },
                                city: { type: 'string', nullable: true },
                                country: { type: 'string', nullable: true }
                            },
                            required: ['latitude', 'longitude', 'city', 'country'],
                        },
                    },
                    required: ['id', 'username', 'profilePictures', 'bio', 'tags', 'bornAt', 'location'],
                    additionalProperties: false,
                },
                400: {
                    type: 'object',
                    properties: {
                        error: { type: 'string', }
                    },
                    additionalProperties: false
                },
                500: {
                    type: 'object',
                    properties: {
                        error: { type: 'string' }
                    },
                    additionalProperties: false
                }
            }
        },
        handler: viewProfileHandler
    });
}

export default viewRoutes;