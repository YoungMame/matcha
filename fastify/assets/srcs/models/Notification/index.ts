import { FastifyInstance } from "fastify";
import { ForbiddenError, InternalServerError, NotFoundError } from "../../utils/error";

export type Notification = {
    id: number;
    userId: number;
    authorId: number;
    authorUsername: string;
    notificationType: string;
    targetId: number;
    createdAt: Date;
};

export type NotificationType = 'like' | 'like_back' | 'unlike' | 'view' | 'message' | 'chat_event';

export default class NotificationModel {
    constructor(private fastify: FastifyInstance) {}

    insert = async (userId: number, authorId: number, notificationType: NotificationType, targetId: number): Promise<number> => {
        try {
            const result = await this.fastify.pg.query(
                'INSERT INTO notifications (user_id, author_id, notification_type, target_id) VALUES ($1, $2, $3, $4) RETURNING id',
                [userId, authorId, notificationType, targetId]
            );
            return result.rows[0].id;
        } catch (error) {
            this.fastify.log.error((error as Error).message || undefined);
            throw new InternalServerError('Error inserting notification');
        }
    }

    get = async (id: number): Promise<Notification> => {
        try {
            const result = await this.fastify.pg.query(
                'SELECT * FROM notifications_details WHERE id = $1',
                [id]
            );
            if (result.rows.length === 0)
                throw new NotFoundError();
            return {
                id: result.rows[0].id,
                userId: result.rows[0].user_id,
                authorId: result.rows[0].author_id,
                notificationType: result.rows[0].notification_type,
                targetId: result.rows[0].target_id,
                authorUsername: result.rows[0].author_username,
                createdAt: result.rows[0].created_at
            };
        } catch (error) {
            this.fastify.log.error((error as Error).message || undefined);
            throw new InternalServerError('Error fetching notification');
        }
    }

    getByUserId = async (userId: number): Promise<Notification[]> => {
        try {
            const result = await this.fastify.pg.query(
                'SELECT * FROM notifications_details WHERE user_id = $1 ORDER BY created_at DESC',
                [userId]
            );
            return result.rows.map((row: any) => ({
                id: row.id,
                userId: row.user_id,
                authorId: row.author_id,
                notificationType: row.notification_type,
                targetId: row.target_id,
                authorUsername: row.author_username,
                createdAt: row.created_at
            }));
        } catch (error) {
            this.fastify.log.error((error as Error).message || undefined);
            throw new InternalServerError('Error fetching notifications');
        }
    }
}