import { FastifyInstance } from "fastify";
import { InternalServerError } from "../../utils/error";

export type Report = {
    id: number;
    reportedId: number;
    reporterId: number;
    createdAt: Date;
};

export default class ReportModel {
    constructor(private fastify: FastifyInstance) {}

    insert = async (reportedId: number, reporterId: number): Promise<number> => {
        try {
            const result = await this.fastify.pg.query(
                'INSERT INTO reported_users (reported_id, reporter_id) VALUES ($1, $2) RETURNING id',
                [reportedId, reporterId]
            );
            return result.rows[0].id;
        } catch (error) {
            this.fastify.log.error((error as Error).message || undefined);
            throw new InternalServerError('Error inserting report');
        }
    }

    getByReportedId = async (reportedId: number): Promise<Report[]> => {
        try {
            const result = await this.fastify.pg.query(
                'SELECT * FROM reported_users WHERE reported_id = $1 ORDER BY created_at DESC',
                [reportedId]
            );
            return result.rows.map((row: any) => ({
                id: row.id,
                reportedId: row.reported_id,
                reporterId: row.reporter_id,
                createdAt: row.created_at
            }));
        } catch (error) {
            this.fastify.log.error((error as Error).message || undefined);
            throw new InternalServerError('Error fetching reports');
        }
    }

    getByReporterId = async (reporterId: number): Promise<Report[]> => {
        try {
            const result = await this.fastify.pg.query(
                'SELECT * FROM reported_users WHERE reporter_id = $1 ORDER BY created_at DESC',
                [reporterId]
            );
            return result.rows.map((row: any) => ({
                id: row.id,
                reportedId: row.reported_id,
                reporterId: row.reporter_id,
                createdAt: row.created_at
            }));
        } catch (error) {
            this.fastify.log.error((error as Error).message || undefined);
            throw new InternalServerError('Error fetching reports');
        }
    }

    getByReporterAndReportedId = async (reporterId: number, reportedId: number): Promise<Report | null> => {
        try {
            const result = await this.fastify.pg.query(
                'SELECT * FROM reported_users WHERE reporter_id = $1 AND reported_id = $2',
                [reporterId, reportedId]
            );
            if (result.rows.length === 0)
                return null;
            return {
                id: result.rows[0].id,
                reportedId: result.rows[0].reported_id,
                reporterId: result.rows[0].reporter_id,
                createdAt: result.rows[0].created_at
            };
        } catch (error) {
            this.fastify.log.error((error as Error).message || undefined);
            throw new InternalServerError('Error fetching reports');
        }
    }
}