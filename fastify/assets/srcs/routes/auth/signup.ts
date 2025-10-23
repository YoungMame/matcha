import { FastifyInstance } from "fastify";
import { signUpHandler } from "../../controllers/auth/signup";

const signupRoutes = async (fastify: FastifyInstance) => {
    fastify.post('/', {
        schema: {
            body: {
                type: 'object',
                properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string', minLength: 6 }
                },
                required: ['email', 'password'],
                additionalProperties: false
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        jwt: { type: 'string' }
                    }
                },
                500: {
                    type: 'object',
                    properties: {
                        message: { type: 'string' }
                    }
                }
            }
        },
        handler: signUpHandler
    });
}

export default signupRoutes;
