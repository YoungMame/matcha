import { FastifyInstance } from 'fastify';
import { getMatchesHandler } from '../../../controllers/private/match';

const matchRoutes = async (fastify: FastifyInstance) => {
    fastify.get('/:offset/:limit', {
        schema: {
            params: {
                type: 'object',
                properties: {
                    offset: { type: 'string', format: 'int32' },
                    limit: { type: 'string', format: 'int32' }
                },
                required: ['offset', 'limit'],
                additionalProperties: false
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        matches: { type: 'array', items: { 
                            type: 'object',
                            properties: {
                                id: { type: 'integer' },
                                firstName: { type: 'string' },
                                profilePicture: { type: 'string', nullable: true },
                                age: { type: 'integer' },
                                commonInterests: { type: 'integer' },
                                distance: { type: 'number' },
                                chatId: { type: 'integer', nullable: true }
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
        handler: getMatchesHandler
    });
}

export default matchRoutes;