import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import NotificationModel from "../models/Notification";
import { Notification, NotificationType } from "../models/Notification";
class NotificationService {
    private fastify: FastifyInstance;
    private notificationModel: NotificationModel;

    constructor(fastify: FastifyInstance) {
        this.fastify = fastify;
        this.notificationModel = new NotificationModel(fastify);
    }

    async createNotification(userId: number, authorId: number, notificationType: NotificationType, targetId: number): Promise<void> {
        await this.notificationModel.insert(userId, authorId, notificationType, targetId);
    }

    async getNotifications(userId: number): Promise<Notification[]> {
        const notifications: Notification[] = await this.notificationModel.getByUserId(userId);
        return notifications;
    }
}

export default fp(async (fastify: FastifyInstance) => {
    const notificationService = new NotificationService(fastify);
    fastify.decorate('notificationService', notificationService);
});