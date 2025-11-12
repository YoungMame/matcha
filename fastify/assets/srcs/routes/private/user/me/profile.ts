import { FastifyInstance } from "fastify";
import { setProfileHandler, getProfileHandler } from "../../../../controllers/private/me/profile";

const profileRoutes = async (fastify: FastifyInstance) => {
    fastify.put('/', {
        schema: {
            body: {
                type: 'object',
                properties: {
                    bio: { type: 'string', minLength: 2, maxLength: 100 },
                    tags: { type: 'array', items: { type: 'string' }, minItems: 1 },
                    gender: { type: 'string', enum: ['men', 'women'] },
                    orientation: { type: 'string', enum: ['heterosexual', 'homosexual', 'bisexual', 'other'] },
                    bornAt: { type: 'string', format: 'date-time' },
                    location: {
                        type: 'object',
                        properties: {
                            latitude: { type: 'number' },
                            longitude: { type: 'number' }
                        },
                        required: ['latitude', 'longitude'],
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
                        username: { type: 'string', minLength: 2, maxLength: 100 },
                        profilePictureIndex: { type: 'integer' },
                        profilePictures: { type: 'array', items: { type: 'string', format: 'uri' } },
                        bio: { type: 'string', maxLength: 100 },
                        tags: { type: 'array', items: { type: 'string' } },
                        bornAt: { type: 'string', format: 'date-time' },
                        gender: { type: 'string', enum: ['male', 'female'] },
                        orientation: { type: 'string', enum: ['heterosexual', 'homosexual', 'bisexual'] },
                        isVerified: { type: 'boolean' },
                        isProfileCompleted: { type: 'boolean' },
                        location: {
                            type: 'object',
                            properties: {
                                latitude: { type: 'number', nullable: true },
                                longitude: { type: 'number', nullable: true },
                                city: { type: 'string', nullable: true },
                                country: { type: 'string', nullable: true }
                            },
                            required: ['latitude', 'longitude', 'city', 'country']
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