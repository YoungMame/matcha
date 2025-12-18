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
                        gender: { type: 'string', enum: ['men', 'women'] },
                        orientation: { type: 'string', enum: ['heterosexual', 'homosexual', 'bisexual'] },
                        fameRate: { type: 'number' },
                        location: {
                            type: 'object',
                            properties: {
                                latitude: { type: 'number' },
                                longitude: { type: 'number' },
                                city: { type: 'string' },
                                country: { type: 'string' }
                            },
                        },

                        // Relation infos
                        isConnectedWithMe: { type: 'boolean' },
                        chatIdWithMe: { type: ['integer'] },
                        hasLikedMe: { type: 'boolean' },
                        haveILiked: { type: 'boolean' },
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
                401: {
                    type: 'object',
                    properties: {
                        error: { type: 'string', }
                    },
                    additionalProperties: false
                },
                403: {
                    type: 'object',
                    properties: {
                        error: { type: 'string', }
                    },
                    additionalProperties: false
                },
                404: {
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