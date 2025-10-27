import { FastifyInstance } from "fastify";
import { setProfilePictureIndexHandler, addProfilePictureHandler, removeProfilePictureHandler } from "../../../../controllers/private/me/profilePictures";

const profilePictureRoutes = async (fastify: FastifyInstance) => {
    fastify.put('/:index', {
        schema: {
            params: {
                type: 'object',
                properties: {
                    index: { type: 'integer', minimum: 0 }
                },
                required: ['index'],
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
                        message: { type: 'string' }
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
        handler: setProfilePictureIndexHandler
    });
    fastify.delete('/:index', {
        schema: {
            params: {
                type: 'object',
                properties: {
                    index: { type: 'integer', minimum: 0 }
                },
                required: ['index'],
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
                        message: { type: 'string' }
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
        handler: removeProfilePictureHandler
    });
    fastify.post('/', {
        schema: {
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
                        message: { type: 'string' }
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
        handler: addProfilePictureHandler
    });
}


export default profilePictureRoutes;