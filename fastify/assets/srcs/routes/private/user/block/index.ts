import { FastifyInstance } from 'fastify';
import { blockUserHandler, unblockUserHandler } from '../../../../controllers/private/block';

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
}

export default blockRoutes;