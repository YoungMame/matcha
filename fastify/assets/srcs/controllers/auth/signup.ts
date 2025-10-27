import { FastifyRequest, FastifyReply } from 'fastify';

export const signUpHandler = async (
    request: FastifyRequest,
    reply: FastifyReply
) => {
    const {
        email,
        password,
        username,
        bornAt,
        gender,
        orientation
    } = request.body as any;

    console.log('📝 Signup request received:', { email, username, bornAt });
    const bornAtDate = new Date(bornAt);

    try {
        console.log('🔍 Available on request.server:', Object.keys(request.server));
        console.log('🔍 userService exists?', !!request.server.userService);
        
        if (!request.server.userService) {
            throw new Error('UserService not available on server instance');
        }
        
        const jwt: string | undefined = await request.server.userService.createUser(
            email,
            password,
            username,
            bornAtDate,
            gender,
            orientation
        );

        if (jwt == undefined) {
            return reply.code(400).send({ error: 'User creation failed' });
        }

        return reply.code(201).cookie('jwt', jwt, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
        }).send({ message: 'User created successfully' });
    } catch (error) {
        console.error('❌ Error in signup:', error);
        return reply.code(500).send({ error: 'Internal server error' });
    }
}