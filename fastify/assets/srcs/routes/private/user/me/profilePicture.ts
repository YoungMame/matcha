import { FastifyInstance } from "fastify";
import { setProfilePictureIndexHandler, addProfilePictureHandler, removeProfilePictureHandler } from "../../../../controllers/private/me/profilePictures";

const profilePictureRoutes = async (fastify: FastifyInstance) => {
    fastify.put('/:index', {
        schema: {
            params: {
                type: 'object',
                properties: {
                    index: { type: 'string', format: 'int32' }
                },
                required: ['index'],
                additionalProperties: false
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        message: { type: 'string' },
                        url: { type: 'string' }
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
        handler: setProfilePictureIndexHandler
    });
    fastify.delete('/:index', {
        schema: {
            params: {
                type: 'object',
                properties: {
                    index: { type: 'string', format: 'int32' }
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
        handler: removeProfilePictureHandler
    });
    fastify.post('/', {
        schema: {
            consumes: ['multipart/form-data'],
            response: {
                200: {
                    type: 'object',
                    properties: {
                        message: { type: 'string' },
                        url: { type: 'string' }
                    },
                    additionalProperties: false
                },
                400: {
                    type: 'object',
                    properties: {
                        error: { type: 'string' },
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
        preValidation: fastify.checkImageConformity,
        handler: addProfilePictureHandler
    });
}


export default profilePictureRoutes;