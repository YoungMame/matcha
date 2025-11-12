import { FastifyInstance } from 'fastify';
import { reportUserHandler } from '../../../controllers/private/report'

export default async function reportRoutes(fastify: FastifyInstance) {
    fastify.post('/:reportedId', {
        schema: {
            params: {
                type: 'object',
                properties: {
                    reportedId: { type: 'number' },
                },
                required: ['reportedId'],
                additionalProperties: false
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        message: { type: 'string' }
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
        handler: reportUserHandler
    });
}