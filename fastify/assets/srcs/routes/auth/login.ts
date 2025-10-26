import { FastifyInstance } from "fastify";
import { loginHandler } from "../../controllers/auth/login";

const loginRoutes = async (fastify: FastifyInstance) => {
    fastify.post('/', {
        schema: {
            body: {
                type: 'object',
                properties: {
                    email: { type: 'string' },
                    password: { type: 'string' }
                },
                required: ['email', 'password'],
                additionalProperties: false
            },
            response: { // TODO fix return code
                203: {
                    type: 'object',
                    cookies: {
                        jwt: { type: 'string' }
                    }
                },
                400: {
                    type: 'object',
                    properties: {
                        message: { type: 'string' }
                    }
                }
            }
        },
        handler: loginHandler
    });
}

export default loginRoutes;
