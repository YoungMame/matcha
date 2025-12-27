import { FastifyInstance } from 'fastify';
import { getNearUsersHandler } from '../../../controllers/private/map';

const mapRoutes = async (fastify: FastifyInstance) => {
    fastify.get('/', {
        schema: {
            debug: true,
            querystring: {
                type: 'object',
                properties: {
                    level: { type: 'string' },
                    latitude: { type: 'string' },
                    longitude: { type: 'string' },
                    radius: { type: 'string' }
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
                                count: { type: 'integer' },
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
        handler: getNearUsersHandler
    });
}

export default mapRoutes;