import { FastifyInstance } from 'fastify';
import { blockUserHandler, unblockUserHandler, getBlockedUsersHandler } from '../../../../controllers/private/block';

const blockRoutes = async (fastify: FastifyInstance) => {
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
        handler: blockUserHandler
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
        handler: unblockUserHandler
    });

    fastify.get('/', {
        schema: {
            response: {
                200: {
                    type: 'object',
                    properties: {
                        users: { 
                            type: 'array', 
                            items: { 
                                type: 'object', 
                                properties: {
                                    id: { type: 'integer' },
                                    username: { type: 'string' },
                                    createdAt: { type: 'string', format: 'date-time' },
                                }
                            }
                        }
                    },
                    additionalProperties: false
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
        handler: getBlockedUsersHandler
    });
}

export default blockRoutes;