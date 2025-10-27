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
    console.log('jwt', jwt);
    return reply.code(203).cookie('jwt', jwt, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
    }).send({ message: 'User logged in successfully' });
}