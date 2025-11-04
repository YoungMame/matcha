import { FastifyInstance } from 'fastify';
import { getChatMessagesHandler } from '../../../controllers/private/chat'

export default async function chatMessagesRoutes(fastify: FastifyInstance) {
    fastify.get('/:id/:from/:to', {
        schema: {
            params: {
                type: 'object',
                properties: {
                    id: { type: 'integer' },
                    from: { type: 'integer' },
                    to: { type: 'integer' },
                },
                additionalProperties: false,
                required: ['id', 'from', 'to']
            },
            response: {
                201: {
                    type: 'object',
                    properties: {
                        messages: {
                            type: 'array',
                            items:{
                                type: 'object',
                                properties: {
                                    id: { type: 'number' },
                                    chatId: { type: 'number' },
                                    senderId: { type: 'number' },
                                    content: { type: 'string' },
                                    createdAt: { type: 'string', format: 'date-time' }
                                }
                            }
                        },
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
        handler: getChatMessagesHandler
    });
}