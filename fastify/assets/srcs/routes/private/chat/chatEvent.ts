import { FastifyInstance } from 'fastify';
import { createChatEventHandler, deleteEventHandler } from '../../../controllers/private/chat'

export default async function chatEventRoutes(fastify: FastifyInstance) {
    fastify.post('/', {
        schema: {
            body: {
                type: 'object',
                properties: {
                    chatId: { type: 'integer' },
                    title: { type: 'string' },
                    latitude: { type: 'number' },
                    longitude: { type: 'number' },
                    date: { type: 'string', format: 'date-time' }
                },
                additionalProperties: false,
                required: ['chatId', 'title', 'latitude', 'longitude', 'date']
            },
            response: {
                201: {
                    type: 'object',
                    properties: {
                        id: { type: 'number' },
                        title: { type: 'string' },
                        location: {
                            type: 'object',
                            properties: {
                                latitude: { type: 'number' },
                                longitude: { type: 'number' }
                            },
                        },
                        createdAt: { type: 'string', format: 'date-time' }
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
        handler: createChatEventHandler
    });
    fastify.delete('/:id', {
        schema: {
            params: {
                type: 'object',
                properties: {
                    id: { type: 'integer' }
                },
                additionalProperties: false,
                required: ['id']
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
        handler: deleteEventHandler
    });
}