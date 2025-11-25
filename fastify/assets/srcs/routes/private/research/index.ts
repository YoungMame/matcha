import { FastifyInstance } from 'fastify';
import { researchUsersHandler } from '../../../controllers/private/research'

export default async function researchRoutes(fastify: FastifyInstance) {
    fastify.get('/:username/:minAge/:maxAge/:minFame/:maxFame/:tags/:lat/:lng/:radius/:sortBy', {
        schema: {
            params: {
                type: 'object',
                properties: {
                    username: { type: 'string', minLength: 1, maxLength: 50 },
                    minAge: { type: 'number', minimum: 18, maximum: 100 },
                    maxAge: { type: 'number', minimum: 18, maximum: 100 },
                    minFame: { type: 'number', minimum: 0, maximum: 1000 },
                    maxFame: { type: 'number', minimum: 0, maximum: 1000 },
                    tags: { type: 'string' }, // comma separated tags
                    lat: { type: 'number' },
                    lng: { type: 'number' },
                    radius: { type: 'number', minimum: 0 },
                    sortBy: { type: 'string', enum: ['distance', 'age', 'fameRate', 'tags', 'default'] },
                    offset: { type: 'number', minimum: 0 },
                    limit: { type: 'number', minimum: 1, maximum: 30 }
                },
                required: ['username', 'minAge', 'maxAge', 'minFame', 'maxFame', 'tags', 'lat', 'lng', 'radius', 'sortBy'],
                additionalProperties: false
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        users: { type: 'array', items: { 
                            type: 'object',
                            properties: {
                                id: { type: 'number' },
                                firstName: { type: 'string' },
                                gender: { type: 'string' },
                                tags: { type: 'array', items: { type: 'string' } },
                                fameRate: { type: 'number' },
                                profilePicture: { type: 'string' },
                                bornAt: { type: 'string' },
                                distance: { type: 'number' }
                            },
                            required: ['id', 'firstName', 'gender', 'tags', 'fameRate', 'profilePicture', 'bornAt', 'distance'],
                            additionalProperties: false
                         } }
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
        handler: researchUsersHandler
    });
}