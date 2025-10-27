import { FastifyRequest, FastifyReply } from 'fastify';

export const loginHandler = async (
    request: FastifyRequest,
    reply: FastifyReply
) => {
    const {
        email,
        password
    } = request.body as any

    const jwt:string | undefined = await request.server.userService.login(email, password);

    if (jwt == undefined)
        return reply.status(400).send({ error: 'User creation failed' });
    return reply.code(203).setCookie('jwt', jwt, {
        domain: process.env.DOMAIN || 'localhost',
        path: '/',
        signed: true,
        maxAge: 3600 * 24 * 7
    }).send({ message: 'User logged in successfully' });
}