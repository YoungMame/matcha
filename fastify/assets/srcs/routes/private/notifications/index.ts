import { FastifyInstance } from 'fastify';
import { getNotificationsHandler } from '../../../controllers/private/notification'

export default async function notificationsRoutes(fastify: FastifyInstance) {
    fastify.get('/', {
        schema: {
            response: {
                200: {
                    type: 'object',
                    properties: {
                        notifications: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    id: { type: 'number' },
                                    userId: { type: 'number' },
                                    authorId: { type: 'number' },
                                    notificationType: { type: 'string' },
                                    targetId: { type: 'number' },
                                    authorUsername: { type: 'string' },
                                    createdAt: { type: 'string', format: 'date-time' }
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
        handler: getNotificationsHandler
    });
}