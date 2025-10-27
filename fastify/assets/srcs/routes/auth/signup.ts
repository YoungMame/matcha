import { FastifyInstance } from "fastify";
import { signUpHandler } from "../../controllers/auth/signup";

const signupRoutes = async (fastify: FastifyInstance) => {
    fastify.post('/', {
        schema: {
            body: {
                type: 'object',
                properties: {
                    email: { type: 'string', pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$' },
                    username: { type: 'string', pattern: '^[a-zA-Z0-9._\\- ]+$' },
                    password: { type: 'string', pattern: '^(?=.*?\\d)(?=.*?[a-z])(?=.*?[A-Z])(?=.*?[!@#$%^&*?\\-])[^\\s]{10,}$' },
                    bornAt: { type: 'string', format: 'date' },
                    orientation: { type: 'string', enum: ['heterosexual', 'homosexual', 'bisexual'] },
                    gender: { type: 'string', enum: ['men', 'women'] }

                },
                required: ['email', 'password', 'username', 'bornAt', 'orientation', 'gender'],
                additionalProperties: false
            },
            response: {
                201: {
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
        handler: signUpHandler
    });
}

export default signupRoutes;
