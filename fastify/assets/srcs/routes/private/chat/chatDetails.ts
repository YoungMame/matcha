import { FastifyInstance } from 'fastify';
import { getChatHandler } from '../../../controllers/private/chat'

export default async function chatDetailsRoutes(fastify: FastifyInstance) {
    fastify.get('/:id', {
        schema: {
            params: {
                type: 'object',
                properties: {
                    id: { type: 'integer' },
                },
                additionalProperties: false,
                required: ['id']
            },
            response: {
                201: {
                    type: 'object',
                    properties: {
                        chat:{
                            type: 'object',
                            properties: {
                                id: { type: 'number' },
                                users: { type: 'array', items: { type: 'number' } },
                                event: {
                                    type: ['object', 'null'],
                                    properties: {
                                        id: { type: 'number' },
                                        title: { type: 'string' },
                                        location: {
                                            type: 'object',
                                            properties: {
                                                latitude: { type: 'number' },
                                                longitude: { type: 'number' },
                                                city: { type: 'string' },
                                                country: { type: 'string' }
                                            }
                                        },
                                        date: { type: 'string', format: 'date-time' },
                                        createdAt: { type: 'string', format: 'date-time' }
                                    }
                                },
                                createdAt: { type: 'string', format: 'date-time' }
                            }
                        },
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
        handler: getChatHandler
    });
}