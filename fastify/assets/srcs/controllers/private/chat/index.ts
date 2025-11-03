import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { AppError, UnauthorizedError, BadRequestError } from "../../../utils/error";
import path from "path";
import fs from "fs";
import pump from "pump";

export const sendChatFileHandler = async (
    request: FastifyRequest,
    reply: FastifyReply
) => {
    try {
        const { chatId } = request.params as { chatId: number };
        const user = request.user;
        const userId: number = (user as any)?.id;
        if (!userId)
            throw new UnauthorizedError();

        const file = await request.file();
        if (!file)
            throw (new BadRequestError());

        const picturesDir = path.join(__dirname, '..', '..', '..', '..', 'uploads', userId.toString());
        if (!fs.existsSync(picturesDir)) {
            fs.mkdirSync(picturesDir, { recursive: true });
        }

        const newFileName = `cf_${new Date(Date.now()).valueOf()}_${(Math.random() * 100000).toFixed(0)}.${file.mimetype.split('/')[1]}`;
        const newFilePath = path.join(picturesDir, newFileName);
        const newFileURL = `https://${process.env.DOMAIN || 'localhost'}/api/private/uploads/${userId}/${newFileName}`;
        const dest = fs.createWriteStream(newFilePath);
        pump(file.file, dest);
        await request.server.chatService.addChatFile(userId, newFileURL, chatId);
        return reply.code(200).send({ message: 'Chat file sent successfully', url: newFileURL });
    } catch (error) {
        if (error instanceof AppError)
            return reply.status(error.statusCode).send({ error: error.message });
        return reply.status(500).send({ error: 'Internal server error' });
    } 
}