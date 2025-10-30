import { FastifyInstance } from 'fastify';
import { UnauthorizedError, NotFoundError, BadRequestError, InternalServerError } from "../utils/error";
import fp from 'fastify-plugin';

type id = number;

export enum WebSocketMessageTypes {
    MESSAGE = "message_received",
    LIKE = "like_received",
    LIKE_BACK = "like_back_received",
    UNLIKE = "unlike_received",
    VIEWED = "profile_viewed"
}

export interface WebSocketMessageDataTypes {
    [WebSocketMessageTypes.MESSAGE]: {
        id: id,
        senderId: id,
        chatId: id,
        content: string,
        createdAt: Date
    },
    [WebSocketMessageTypes.LIKE]: {
        id: id,
        likerId: id,
        createdAt: Date
    },
    [WebSocketMessageTypes.LIKE_BACK]: {
        id: id,
        createdChatId: id,
        createdAt: Date
    },
    [WebSocketMessageTypes.UNLIKE]: {
        unlikerId: id,
        createdChatId: id,
        createdAt: Date
    },
    [WebSocketMessageTypes.VIEWED]: {
        id: id,
        viewerId: id,
        createdAt: Date
    }
}

export type WebSocketMessageDataType = WebSocketMessageDataTypes[keyof WebSocketMessageDataTypes];

class WebSocketService {
    private fastify: FastifyInstance;
    private activeConns: Map<id, WebSocket>;

    constructor(fastify: FastifyInstance) {
        this.fastify = fastify;
        this.activeConns = new Map<id, WebSocket>();
    }

    public handleClientMessage(id: id, message: string) {
        this.fastify.log.info(`Received message from ${id}: ${message}`);
        const raw: { type: string, targetId: number, content: string } = JSON.parse(message);
        if (!raw.type || !raw.targetId)
            return;
        switch (raw.type) {
            case WebSocketMessageTypes.MESSAGE:
                this.fastify.log.info(`User ${id} tried to send message to ${raw.targetId}: ${raw.content}`);
                // this.fastify.userService.sendMessage(id, targetId, raw.content);
                break;
            case WebSocketMessageTypes.LIKE:
                this.fastify.log.info(`User ${id} liked user ${raw.targetId}`);
                // this.fastify.userService.likeUser(id, targetId);
                break;
            case WebSocketMessageTypes.UNLIKE:
                this.fastify.log.info(`User ${id} unliked user ${raw.targetId}`);
                // this.fastify.userService.unlikeUser(id, targetId);
                break;
            // Other types will be sent from backend
            default:
                this.fastify.log.warn(`Unknown message type from ${id}: ${raw.type}`);
        }
    }

    public addConnection(id: id, ws: WebSocket) {
        this.activeConns.set(id, ws);
        this.fastify.log.info(`WebSocket connection ${id} added.`);
    }

    public removeConnection(id: id) {
        this.activeConns.delete(id);
    }

    public findUserBySocket(socket: WebSocket): id | undefined {
        for (const [id, ws] of this.activeConns.entries()) {
            if (ws === socket) {
                return id;
            }
        }
        return undefined;
    }

    public closeConnection(id: id) {
        const ws = this.activeConns.get(id);
        if (ws) {
            ws.close();
            this.removeConnection(id);
        }
        this.fastify.log.info(`WebSocket connection ${id} closed.`);
    }

    private sendTo(id: id, type: string, data: WebSocketMessageDataType) {
        const ws = this.activeConns.get(id);
        if (!ws || ws.readyState !== ws.OPEN) {
            return;
        }
        ws.send(JSON.stringify({ type, data }));
    }

    private broadcast(type: string, data: WebSocketMessageDataType) {
        this.activeConns.forEach((ws, _) => {
            if (ws.readyState === ws.OPEN) {
                ws.send(JSON.stringify({ type, data }));
            }
        });
    }

    public sendMessage(
        id: id,
        data: WebSocketMessageDataTypes[WebSocketMessageTypes.MESSAGE]
    ) {
        this.sendTo(id, WebSocketMessageTypes.MESSAGE, data);
    }

    public sendLike(
        id: id,
        data: WebSocketMessageDataTypes[WebSocketMessageTypes.LIKE]
    ) {
        this.sendTo(id, WebSocketMessageTypes.LIKE, data);
    }

    public sendLikeBack(
        id: id,
        data: WebSocketMessageDataTypes[WebSocketMessageTypes.LIKE_BACK]
    ) {
        this.sendTo(id, WebSocketMessageTypes.LIKE_BACK, data);
    }

    public sendUnlike(
        id: id,
        data: WebSocketMessageDataTypes[WebSocketMessageTypes.UNLIKE]
    ) {
        this.sendTo(id, WebSocketMessageTypes.UNLIKE, data);
    }

    public sendProfileViewed(
        id: id,
        data: WebSocketMessageDataTypes[WebSocketMessageTypes.VIEWED]
    ) {
        this.sendTo(id, WebSocketMessageTypes.VIEWED, data);
    }
};

export default fp(async (fastify: FastifyInstance) => {
    const webSocketService = new WebSocketService(fastify);
    fastify.decorate('webSocketService', webSocketService);
});
