import User from "../classes/User";
import UserModel from "../models/User";
import ChatModel from "../models/Chat";
import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import { BadRequestError, NotFoundError, ConflictError } from "../utils/error";
import { Chat, ChatMessage, ChatEvent } from "../models/Chat";
import { WebSocketMessageTypes, WebSocketMessageDataTypes } from "./WebSocketService";

class ChatService {
    private fastify: FastifyInstance;
    private userModel: UserModel;
    private chatModel: ChatModel;
    UsersCache: Map<number, User>;

    constructor(fastify: FastifyInstance) {
        this.fastify = fastify;
        this.userModel = new UserModel(fastify);
        this.chatModel = new ChatModel(fastify);

        this.UsersCache = new Map<number, User>();
    }

    async createChat(userIds: number[]): Promise<number> {
        if (userIds.length < 2)
            throw new BadRequestError();
        const chat: Chat = await this.chatModel.insert(userIds);
        return chat.id;
    }

    async deleteChat(id: number): Promise<void> {
        await this.chatModel.remove(id);
    }

    async getChat(userId: number | undefined ,id: number): Promise<Chat | null> {
        const chat: Chat | null = await this.chatModel.get(id);
        if (!chat)
            throw new NotFoundError();
        if (userId !== undefined) {
            if (!chat.users.includes(userId))
                throw new NotFoundError();
        }
        return chat;
    }

    async sendMessage(senderId: number, chatId: number, content: string): Promise<void> {
        const result: Chat | null = await this.chatModel.get(chatId);
        if (!result)
            throw new NotFoundError();
        if (!result.users.includes(senderId))
            throw new NotFoundError();
        const message = await this.chatModel.insertMessage(chatId, senderId, content);
        result.users.forEach(userId => {
            if (userId !== senderId) {
                const data: WebSocketMessageDataTypes[WebSocketMessageTypes.MESSAGE] = {
                    id: message.id,
                    senderId: message.senderId,
                    chatId: message.chatId,
                    content: message.content,
                    createdAt: message.createdAt
                };
                this.fastify.webSocketService.sendMessage(userId, data);
            }
        });
    }

    public async addChatFile(senderId: number, fileURL: string, chatId: number): Promise<void> {
        const result: Chat | null = await this.chatModel.get(chatId);
        if (!result)
            throw new NotFoundError();
        if (!result.users.includes(senderId))
            throw new NotFoundError();
        await this.chatModel.insertMessage(chatId, senderId, `fileURL:${fileURL}`);
    }

    public async getChatBetweenUsers(userId1s: number[]): Promise<Chat | null> {
        if (userId1s.length < 2)
            return (null);
        const result: Chat | null = await this.chatModel.getBeetweenUsers(userId1s);
        return (result);
    }

    public async getChatMessages(userId: number, chatId: number, fromLast: number, toLast: number): Promise<ChatMessage[]> {
        const result: Chat | null = await this.chatModel.get(chatId);
        if (!result)
            throw new NotFoundError();
        if (!result.users.includes(userId))
            throw new NotFoundError();

        const messages = await this.chatModel.getMessages(chatId, fromLast, toLast);
        // const blockedUsers: number[] = this.fastify.userService.getBlockedUsers(userId); // TODO implement blocked users
        const blockedUsers: Map<number, Date> = new Map();
        const filteredMessages = messages.filter(message => {
            if (blockedUsers.has(message.senderId) && (blockedUsers.get(message.senderId) as Date) < message.createdAt)
                return false;
            return true;
        });
        return (filteredMessages);
    }

    public async createChatEvent(userId: number, chatId: number, title: string, latitude: number, longitude: number, date: Date): Promise<ChatEvent> {
        const result: Chat | null = await this.chatModel.get(chatId);
        if (!result)
            throw new NotFoundError();
        if (!result.users.includes(userId))
            throw new NotFoundError();
        if (result.event)
            throw new ConflictError(); // Chat already has an event
        if (date < new Date(Date.now()))
            throw new BadRequestError(); // Event date is in the past
        const event: ChatEvent = await this.chatModel.insertEvent(chatId, title, latitude, longitude, date);
        for (const user of result.users) {
            await this.fastify.webSocketService.sendChatEvent(user, {
                id: event.id,
                chatId: chatId,
                title: event.title,
                createdAt: event.createdAt
            });
        }
        return (event);
    }

    public async deleteChatEvent(userId: number, chatId: number): Promise<void> {
        const chat: Chat | null = await this.chatModel.get(chatId);
        if (!chat)
            throw new NotFoundError();
        if (!chat.users.includes(userId))
            throw new NotFoundError();
        if (!chat.event)
            throw new NotFoundError();
        const eventId = chat.event.id;
        await this.chatModel.removeEvent(eventId);
    }
}

export default fp(async (fastify: FastifyInstance) => {
    const chatService = new ChatService(fastify);
    fastify.decorate('chatService', chatService);
});