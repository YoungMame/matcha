import { FastifyInstance } from 'fastify';
import { likeProfileHandler, unlikeProfile, getLikesHandler } from '../../../../controllers/private/like';

const likeRoutes = async (fastify: FastifyInstance) => {
    fastify.post('/:userId', {
        schema: {
            params: {
                type: 'object',
                properties: {
                    userId: { type: 'integer' }
                },
                required: ['userId'],
                additionalProperties: false
            },
            response: {
                201: {
                    type: 'object',
                    properties: {
                        message: { type: 'string' },
                    },
                    additionalProperties: false
                },
                400: {
                    type: 'object',
                    properties: {
                        message: { type: 'string', }
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
        handler: likeProfileHandler
    });

    fastify.delete('/:userId', {
        schema: {
            params: {
                type: 'object',
                properties: {
                    userId: { type: 'integer' }
                },
                required: ['userId'],
                additionalProperties: false
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        message: { type: 'string' },
                    },
                    additionalProperties: false
                },
                400: {
                    type: 'object',
                    properties: {
                        message: { type: 'string', }
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
        handler: unlikeProfile
    });

    fastify.get('/', {
        schema: {
            response: {
                200: {
                    type: 'object',
                    properties: {
                        likes: { type: 'array', items: { 
                            type: 'object',
                            properties: {
                                id: { type: 'integer' },
                                likerId: { type: 'integer' },
                                likedId: { type: 'integer' },
                                createdAt: { type: 'string', format: 'date-time' }
                            }
                        }}
                    },
                    additionalProperties: false
                },
                400: {
                    type: 'object',
                    properties: {
                        message: { type: 'string', }
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
        handler: getLikesHandler
    });
}

export default likeRoutes;