import { FastifyInstance } from "fastify";
import { InternalServerError, NotFoundError } from "../../utils/error";

export interface Like {
    id: number;
    likerId: number;
    likedId: number;
    createdAt: Date;
};

export default class LikeModel {
    constructor(private fastify: FastifyInstance) {}

    insert = async (likerId: number, likedId: number): Promise<Like> => {
        try {
            const result = await this.fastify.pg.query(
                'INSERT INTO likes (liker_id, liked_id) VALUES ($1, $2) RETURNING id',
                [likerId, likedId]
            );
            return {
                id: result.rows[0].id,
                likerId: result.rows[0].likerId,
                likedId: result.rows[0].likedId,
                createdAt: result.rows[0].createdAt
            };
        } catch (error) {
            this.fastify.log.error((error as Error).message || undefined);
            throw new InternalServerError('Error inserting like');
        }
    }

    get = async (id: number): Promise<Like> => {
        try {
            const result = await this.fastify.pg.query(
                'SELECT * FROM likes WHERE id = $1',
                [id]
            );
            if (result.rows.length === 0)
                throw new NotFoundError();
            return {
                id: result.rows[0].id,
                likerId: result.rows[0].likerId,
                likedId: result.rows[0].likedId,
                createdAt: result.rows[0].createdAt
            };
        } catch (error) {
            this.fastify.log.error((error as Error).message || undefined);
            throw new InternalServerError('Error fetching like');
        }
    }

    remove = async (id: number): Promise<number> => {
        try {
            const result = await this.fastify.pg.query(
                'DELETE FROM likes WHERE id = $1 RETURNING id',
                [id]
            );
            if (result.rows.length === 0)
                throw new NotFoundError();
            return result.rows[0].id;
        } catch (error) {
            this.fastify.log.error((error as Error).message || undefined);
            throw new InternalServerError('Error deleting like');
        }
    }

    getAllByLikerId = async (likerId: number): Promise<Like[]> => {
        try {
            const result = await this.fastify.pg.query(
                'SELECT * FROM likes WHERE liker_id = $1',
                [likerId]
            );
            return result.rows.map((row: { id: number, liker_id: number, liked_id: number, created_at: Date}) => ({
                id: row.id,
                likerId: row.liker_id,
                likedId: row.liked_id,
                createdAt: row.created_at
            }));
        } catch (error) {
            this.fastify.log.error((error as Error).message || undefined);
            throw new InternalServerError();
        }
    }

    getAllByLikedId = async (likerId: number): Promise<Like[]> => {
        try {
            const result = await this.fastify.pg.query(
                'SELECT * FROM likes WHERE liked_id = $1',
                [likerId]
            );
            return result.rows.map((row: { id: number, liker_id: number, liked_id: number, created_at: Date}) => ({
                id: row.id,
                likerId: row.liker_id,
                likedId: row.liked_id,
                createdAt: row.created_at
            }));
        } catch (error) {
            this.fastify.log.error((error as Error).message || undefined);
            throw new InternalServerError();
        }
    }
} 