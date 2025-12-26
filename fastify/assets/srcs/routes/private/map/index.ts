import { FastifyInstance } from 'fastify';
import { getMatchesHandler } from '../../../controllers/private/match';

const mapRoutes = async (fastify: FastifyInstance) => {
    fastify.get('/:level/:latitude/:longitude/:radius', {
        schema: {
            params: {
                type: 'object',
                properties: {
                    level: { type: 'string', format: 'int32' },
                    latitude: { type: 'string', format: 'int32' },
                    longitude: { type: 'string', format: 'int32' },
                    radius: { type: 'string', format: 'int32' }
                },
                required: ['level', 'latitude', 'longitude', 'radius'],
                additionalProperties: false
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        users: { type: 'array', items: { 
                            type: 'object',
                            properties: {
                                id: { type: 'integer' },
                                firstName: { type: 'string' },
                                profilePicture: { type: 'string', nullable: true },
                                latitude: { type: 'number' },
                                longitude: { type: 'number' },
                            }
                        }},
                        clusters: { type: 'array', items: { 
                            type: 'object',
                            properties: {
                                latitude: { type: 'number' },
                                longitude: { type: 'number' },
                                userCount: { type: 'integer' },
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

export default mapRoutes;