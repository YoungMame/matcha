import { FastifyInstance } from "fastify";
import { InternalServerError } from "../../utils/error";

export interface ChatEvent {
    id: number;
    title: string;
    location: {
        latitude: number;
        longitude: number;
    }
    date: Date;
    createdAt: Date;
}

export interface Chat {
    id: number;
    event: ChatEvent | undefined;
    users: number[];
    createdAt: Date;
};

export interface ChatMessage {
    id: number;
    chatId: number;
    senderId: number;
    content: string;
    createdAt: Date;
}

export default class ChatModel {
    constructor(private fastify: FastifyInstance) {}

    insert = async (userIds: number[]): Promise<Chat> => {
        try {
            let chatUsersResult: any[] = [];
            const result = await this.fastify.pg.query(
                'INSERT INTO chats DEFAULT VALUES RETURNING *',
            );
            await Promise.all(userIds.map(async id => {
                const chatUserResult = await this.fastify.pg.query(
                    'INSERT INTO chats_users (chat_id, user_id) VALUES ($1, $2) RETURNING *',
                    [result.rows[0].id, id]
                );
                chatUsersResult.push(chatUserResult.rows[0].id);
            }));

            return {
                id: result.rows[0].id,
                event: undefined,
                users: chatUsersResult,
                createdAt: result.rows[0].created_at
            };
        } catch (error) {
            this.fastify.log.error((error as Error).message || undefined);
            throw new InternalServerError('Error inserting view');
        }
    }

    remove = async (id: number): Promise<void> => {
        await this.fastify.pg.query(
            `DELETE FROM chats WHERE id=${id}`
        );
    }

    removeEvent = async (eventId: number): Promise<void> => {
        await this.fastify.pg.query(
            `DELETE FROM events WHERE id=${eventId}`
        );
    }

    insertEvent = async (chatId: number, title: string, latitude: number, longitude: number, date: Date): Promise<ChatEvent> => {
        try {
            const locationResult = await this.fastify.pg.query(
                'INSERT INTO locations (latitude, longitude) VALUES ($1, $2) RETURNING *',
                [latitude, longitude]
            );
            const results = await this.fastify.pg.query(
                'INSERT INTO events (chat_id, title, location_id, date) VALUES ($1, $2, $3, $4) RETURNING *',
                [chatId, title, locationResult.rows[0].id, date.toISOString()]
            );
            const result = results.rows[0];
            const chatResults = await this.fastify.pg.query(
                `UPDATE chats SET event_id=$1 WHERE id=$2 RETURNING *`,
                [result.id, chatId]
            );
            await this.fastify.pg.query(
                `UPDATE locations SET event_id=$1 WHERE id=$2 RETURNING *`,
                [result.id, locationResult.rows[0].id]
            );
            if (chatResults.rows.length === 0)
            {
                await this.fastify.pg.query(`DELETE FROM events WHERE id=${result.id}`);
                throw new InternalServerError('Error linking event to chat');
            }
            return {
                id: result.id,
                title: result.title,
                location: {
                    latitude: result.latitude,
                    longitude: result.longitude
                },
                date: result.date,
                createdAt: result.created_at
            };
        } catch (error) {
            this.fastify.log.error((error as Error).message || undefined);
            throw new InternalServerError('Error inserting event');
        }
    
    }

    insertMessage = async (chatId: number, senderId: number, content: string): Promise<ChatMessage> => {
        try {
            const results = await this.fastify.pg.query(
                'INSERT INTO messages (chat_id, sender_id, content) VALUES ($1, $2, $3) RETURNING *',
                [chatId, senderId, content]
            );
            const result = results.rows[0];
            return {
                id: result.id,
                chatId: result.chat_id,
                senderId: result.sender_id,
                content: result.content,
                createdAt: result.created_at
            };
        } catch (error) {
            this.fastify.log.error((error as Error).message || undefined);
            throw new InternalServerError('Error inserting message');
        }
    }



    get = async (id: number): Promise<Chat | null> => {
        try {
            const result = await this.fastify.pg.query(
                'SELECT * FROM chats WHERE id = $1',
                [id]
            );
            const usersResult = await this.fastify.pg.query(
                'SELECT user_id FROM chats_users WHERE chat_id = $1',
                [id]
            );
            if (usersResult.rows.length === 0)
                return null;
            if (result.rows.length === 0)
                return null;

            const chat = result.rows[0];
            let chatUsersResult: any[] = [];
            await Promise.all(usersResult.rows.map(async (user: any) => {
                const userResult = await this.fastify.pg.query(
                    'SELECT id FROM users WHERE id = $1',
                    [user.user_id]
                );
                chatUsersResult.push(userResult.rows[0].id);
            }));
            let event: ChatEvent | undefined = undefined;
            if (chat.event_id) {
                const eventResult = await this.fastify.pg.query(
                    'SELECT * FROM events WHERE id = $1',
                    [chat.event_id]
                );
                const eventRow = eventResult.rows[0];
                if (eventRow) {
                    event = {
                        id: eventRow.id as number,
                        title: eventRow.title as string,
                        location: {
                            latitude: eventRow.latitude as number,
                            longitude: eventRow.longitude as number
                        },
                        date: eventRow.date as Date,
                        createdAt: eventRow.created_at as Date
                    };
                }
            }
            return {
                id: chat.id,
                event: event,
                users: chatUsersResult,
                createdAt: chat.created_at,
            };
        } catch (error) {
            this.fastify.log.error((error as Error).message || undefined);
            throw new InternalServerError('Error fetching view');
        }
    }

    getBeetweenUsers = async (userIds: number[]): Promise<Chat | null> => {
        try {
            const result = await this.fastify.pg.query(
                'SELECT * FROM chats WHERE id IN (SELECT chat_id FROM chats_users WHERE user_id = ANY($1))',
                [userIds]
            );
            if (result.rows.length === 0)
                return null;
            const eventId = result.rows[0].event_id || undefined;
            let event: ChatEvent | undefined = undefined;
            if (!eventId)
            {
                const eventResult = await this.fastify.pg.query(
                    'SELECT * FROM events WHERE id = $1',
                    [eventId]
                );
                const eventRow = eventResult.rows[0];
                if (eventRow) {
                    event = {
                        id: eventRow.id as number,
                        title: eventRow.title as string,
                        location: {
                            latitude: eventRow.latitude as number,
                            longitude: eventRow.longitude as number
                        },
                        date: eventRow.date as Date,
                        createdAt: eventRow.created_at as Date
                    };
                }
            }
            return {
                id: result.rows[0].id,
                event: event,
                users: userIds,
                createdAt: result.rows[0].created_at
            };
        } catch (error) {
            this.fastify.log.error((error as Error).message || undefined);
            throw new InternalServerError();
        }
    }

    getMessages = async (chatId: number, fromLast: number, toLast: number): Promise<ChatMessage[]> => {
        try {
            const result = await this.fastify.pg.query(
                'SELECT * FROM messages WHERE chat_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
                [chatId, toLast - fromLast + 1, fromLast]
            );
            return result.rows.map(row => ({
                id: row.id,
                chatId: row.chat_id,
                senderId: row.sender_id,
                content: row.content,
                createdAt: row.created_at
            }));
        } catch (error) {
            this.fastify.log.error((error as Error).message || undefined);
            throw new InternalServerError('Error fetching messages');
        }
    }
} 