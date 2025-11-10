import { FastifyRequest, FastifyReply, FastifyRequestUser } from 'fastify';
import { AppError, UnauthorizedError, ForbiddenError, NotFoundError, BadRequestError } from '../../../utils/error';
import path from 'path';
import fs from 'fs';

export const setProfilePictureIndexHandler = async (
    request: FastifyRequest,
    reply: FastifyReply
) => {
    const {
        index
    } = request.params as any

    try {
        const user = request.user as FastifyRequestUser | undefined;
        const userId = user?.id;
        if (!userId)
            throw new UnauthorizedError();
        const url = await request.server.userService.updateUserProfilePicture(userId, index);
        return reply.code(200).send({ message: 'User profile picture updated successfully', url });
    } catch (error) {
        if (error instanceof AppError)
            return reply.status(error.statusCode).send({ error: error.message });
        return reply.status(500).send({ error: 'Internal server error' });
    } 
}

export const addProfilePictureHandler = async (
    request: FastifyRequest,
    reply: FastifyReply
) => {
    try {
        const user = request.user;
        const userId: number = (user as any)?.id;
        if (!userId)
            throw new UnauthorizedError();

        const file = request.fileMeta;
        if (!file)
            throw (new BadRequestError());

        const picturesDir = path.join(__dirname, '..', '..', '..', '..', 'uploads', userId.toString());
        if (!fs.existsSync(picturesDir)) {
            fs.mkdirSync(picturesDir, { recursive: true });
        }

        const newFileName = `${new Date(Date.now()).valueOf()}_${(Math.random() * 100000).toFixed(0)}.${file.mimetype.split('/')[1]}`;
        const newFilePath = path.join(picturesDir, newFileName);
        const newFileURL = `https://${process.env.DOMAIN || 'localhost'}/api/private/uploads/${userId}/${newFileName}`;
        const dest = fs.createWriteStream(newFilePath);
        dest.write(request.fileBuffer);
        dest.end();

        // dest.on('finish', () => {
        // });

        dest.on('error', (err) => {
            throw new Error('Error saving file: ' + err.message);
        });

        try {
            await request.server.userService.addUserProfilePicture(userId, newFileURL);
        } catch (error) {
            await fs.unlinkSync(newFilePath);
            throw error;
        }
        return reply.code(200).send({ message: 'User profile picture updated successfully', url: newFileURL });
    } catch (error) {
        console.error('Error in addProfilePictureHandler:', error);
        if (error instanceof AppError)
            return reply.status(error.statusCode).send({ error: error.message });
        return reply.status(500).send({ error: 'Internal server error' });
    } 
}

export const removeProfilePictureHandler = async (
    request: FastifyRequest,
    reply: FastifyReply
) => {
    const {
        index
    } = request.params as any   

    try {
        const user = request.user;
        const userId: number = (user as any)?.id;
        if (!userId)
            throw new UnauthorizedError();

        await request.server.userService.removeUserProfilePicture(userId, index);
        return reply.code(200).send({ message: 'User profile picture removed successfully' });
    } catch (error) {
        if (error instanceof AppError)
            return reply.status(error.statusCode).send({ error: error.message });
        return reply.status(500).send({ error: 'Internal server error' });
    } 
}