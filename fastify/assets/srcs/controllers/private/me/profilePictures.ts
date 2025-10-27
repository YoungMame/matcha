import { FastifyRequest, FastifyReply } from 'fastify';

export const setProfilePictureIndexHandler = async (
    request: FastifyRequest,
    reply: FastifyReply
) => {
    const {
        index
    } = request.params as any

    const user = request.user;

    if (!user)
        return reply.status(401).send({ error: 'Unauthorized' });
    const userId: number = (user as any).id; // TODO manage jwt in prehandler
    const success: boolean = await request.server.userService.updateUserProfilePicture(userId, index);

    if (!success)
        return reply.status(500).send({ error: 'User profile picture update failed' });
    return reply.code(200).send({ message: 'User profile picture updated successfully' });
}