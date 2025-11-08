import { FastifyReply, FastifyRequest } from "fastify";
import { AppError, UnauthorizedError, BadRequestError } from "../../../utils/error";
import path from "path";
import fs from "fs";
import pump from "pump";

export const getChatMessagesHandler = async (
    request: FastifyRequest,
    reply: FastifyReply
) => {
    try {
        const user = request.user;
        const userId: number = (user as any)?.id;
        if (!userId)
            throw new UnauthorizedError();
        const { id, from, to } = request.params as { id: number, from: number, to: number };
        const messages = await request.server.chatService.getChatMessages(userId, id, from, to);
        return reply.status(201).send({ messages });
    } catch (error) {
        if (error instanceof AppError)
            return reply.status(error.statusCode).send({ error: error.message });
        return reply.status(500).send({ error: 'Internal server error' });
    }
}

export const getChatHandler = async (
    request: FastifyRequest,
    reply: FastifyReply
) => {
    try {
        const user = request.user;
        const userId: number = (user as any)?.id;
        if (!userId)
            throw new UnauthorizedError();
        const { id } = request.params as { id: number };
        const chat = await request.server.chatService.getChat(userId, id);
        return reply.status(200).send(chat);
    } catch (error) {
        if (error instanceof AppError)
            return reply.status(error.statusCode).send({ error: error.message });
        return reply.status(500).send({ error: 'Internal server error' });
    }
}

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

export const createChatEventHandler = async (
    request: FastifyRequest,
    reply: FastifyReply
) => {
    try {
        const user = request.user;
        const userId: number = (user as any)?.id;
        if (!userId)
            throw new UnauthorizedError();
        const { chatId, title, latitude, longitude } = request.body as {
            chatId: number,
            title: string,
            latitude: number,
            longitude: number,
        };

        const date = new Date((request.body as any).date);

        const event = await request.server.chatService.createChatEvent(userId, chatId, title, latitude, longitude, date);
        return reply.status(201).send(event);
    } catch (error) {
        if (error instanceof AppError)
            return reply.status(error.statusCode).send({ error: error.message });
        return reply.status(500).send({ error: 'Internal server error' });
    }
}

export const deleteEventHandler = async (
    request: FastifyRequest,
    reply: FastifyReply
) => {
    try {
        const user = request.user;
        const userId: number = (user as any)?.id;
        if (!userId)
            throw new UnauthorizedError();
        const { id } = request.params as { id: number };
        await request.server.chatService.deleteChatEvent(userId, id);
        return reply.status(200).send({ message: 'Chat event deleted successfully' });
    }
    catch (error) {
        if (error instanceof AppError)
            return reply.status(error.statusCode).send({ error: error.message });
        return reply.status(500).send({ error: 'Internal server error' });
    }
}