import { FastifyInstance } from "fastify";
import { setProfileHandler, getProfileHandler } from "../../../../controllers/private/me/profile";

const profileRoutes = async (fastify: FastifyInstance) => {
    fastify.put('/', {
        schema: {
            body: {
                type: 'object',
                properties: {
                    firstName: { type: 'string', minLength: 1, maxLength: 50, pattern: '[a-zA-Z-\' ]' },
                    lastName: { type: 'string', minLength: 1, maxLength: 50, pattern: '[a-zA-Z-\' ]' },
                    email: { type: 'string', format: 'email' },
                    bio: { type: 'string', minLength: 50, maxLength: 500 },
                    tags: { type: 'array', items: { type: 'string', minLength: 1, maxLength: 30, pattern: '[a-zA-Z_]' }, minItems: 3 },
                    gender: { type: 'string', enum: ['men', 'women'] },
                    orientation: { type: 'string', enum: ['heterosexual', 'homosexual', 'bisexual', 'other'] },
                    bornAt: { type: 'string', format: 'date-time' },
                    location: {
                        type: 'object',
                        properties: {
                            latitude: { type: 'number', minimum: -90, maximum: 90 },
                            longitude: { type: 'number', minimum: -180, maximum: 180 }
                        },
                        additionalProperties: false
                    }
                },
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
                        message: { type: 'string' }
                    },
                    additionalProperties: false
                }
            }
        },
        handler: setProfileHandler
    });
    fastify.get('/', {
        schema: {
            response: {
                200: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        email: { type: 'string', format: 'email' },
						firstName: { type: 'string' },
						lastName: { type: 'string' },
                        username: { type: 'string', minLength: 2, maxLength: 100 },
                        profilePictureIndex: { type: 'integer' },
                        profilePictures: { type: 'array', items: { type: 'string', format: 'uri' } },
                        bio: { type: 'string', maxLength: 100 },
                        tags: { type: 'array', items: { type: 'string' } },
                        bornAt: { type: 'string', format: 'date-time' },
                        gender: { type: 'string', enum: ['men', 'women'] },
                        orientation: { type: 'string', enum: ['heterosexual', 'homosexual', 'bisexual'] },
                        isVerified: { type: 'boolean' },
                        isProfileCompleted: { type: 'boolean' },
                        fameRate: { type: 'number' },
                        location: {
                            type: 'object',
                            properties: {
                                latitude: { type: 'number' },
                                longitude: { type: 'number' },
                                city: { type: 'string' },
                                country: { type: 'string' }
                            },
                        },
                        createdAt: { type: 'string', format: 'date-time' }
                    },
                    required: ['id', 'email', 'username', 'profilePictures', 'bio', 'tags', 'bornAt', 'isVerified', 'location', 'createdAt'],
                    additionalProperties: false
                },
                400: {
                    type: 'object',
                    properties: {
                        error: { type: 'string' }
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
        handler: getProfileHandler
    });
}


export default profileRoutes;