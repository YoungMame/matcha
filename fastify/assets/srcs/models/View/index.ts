import { FastifyInstance } from "fastify";
import { InternalServerError, NotFoundError } from "../../utils/error";

export interface View {
    id: number;
    viewerId: number;
    createdAt: Date;
};

export default class ViewModel {
    constructor(private fastify: FastifyInstance) {}

    insert = async (viewerId: number, viewedId: number): Promise<View> => {
        try {
            const result = await this.fastify.pg.query(
                'INSERT INTO views (viewer_id, viewed_id) VALUES ($1, $2) RETURNING *',
                [viewerId, viewedId]
            );
            return {
                id: result.rows[0].id,
                viewerId: result.rows[0].viewer_id,
                createdAt: result.rows[0].created_at
            };
        } catch (error) {
            this.fastify.log.error((error as Error).message || undefined);
            throw new InternalServerError('Error inserting view');
        }
    }

    get = async (id: number): Promise<View> => {
        try {
            const result = await this.fastify.pg.query(
                'SELECT * FROM views WHERE id = $1',
                [id]
            );
            if (result.rows.length === 0)
                throw new NotFoundError();
            return {
                id: result.rows[0].id,
                viewerId: result.rows[0].viewer_id,
                createdAt: result.rows[0].created_at
            };
        } catch (error) {
            this.fastify.log.error((error as Error).message || undefined);
            throw new InternalServerError('Error fetching view');
        }
    }

    getAllByViewerId = async (viewerId: number): Promise<View[]> => {
        try {
            const result = await this.fastify.pg.query(
                'SELECT * FROM views WHERE viewer_id = $1',
                [viewerId]
            );
            return result.rows.map((row: { id: number, viewer_id: number, viewed_id: number, created_at: Date}) => ({
                id: row.id,
                viewerId: row.viewer_id,
                createdAt: row.created_at
            }));
        } catch (error) {
            this.fastify.log.error((error as Error).message || undefined);
            throw new InternalServerError();
        }
    }

    getAllByViewedId = async (viewedId: number): Promise<View[]> => {
        try {
            const result = await this.fastify.pg.query(
                'SELECT * FROM views WHERE viewed_id = $1',
                [viewedId]
            );
            return result.rows.map((row: { id: number, viewer_id: number, viewed_id: number, created_at: Date}) => ({
                id: row.id,
                viewerId: row.viewer_id,
                createdAt: row.created_at
            }));
        } catch (error) {
            this.fastify.log.error((error as Error).message || undefined);
            throw new InternalServerError();
        }
    }

    getBeetweenUsers = async (viewerId: number, viewedId: number): Promise<View | null> => {
        try {
            const result = await this.fastify.pg.query(
                'SELECT * FROM views WHERE viewed_id = $1 AND viewer_id = $2',
                [viewedId, viewerId]
            );
            if (result.rows.length === 0)
                return null;
            return {
                id: result.rows[0].id,
                viewerId: result.rows[0].viewer_id,
                createdAt: result.rows[0].created_at
            };
        } catch (error) {
            this.fastify.log.error((error as Error).message || undefined);
            throw new InternalServerError();
        }
    }
} 