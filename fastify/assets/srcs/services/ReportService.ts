import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import ReportModel from "../models/Report";
import { Report } from "../models/Report";
import { ConflictError, NotFoundError } from '../utils/error';
import { report } from 'process';

class ReportService {
    private fastify: FastifyInstance;
    private reportModel: ReportModel;

    constructor(fastify: FastifyInstance) {
        this.fastify = fastify;
        this.reportModel = new ReportModel(fastify);
    }

    async reportUser(reportedId: number, reporterId: number): Promise<void> {
        const existingReport = await this.reportModel.getByReporterAndReportedId(reporterId, reportedId);
        if (existingReport)
            throw new ConflictError();
        if (reportedId === reporterId)
            throw new ConflictError();
        // check if the reported user is visible to the reporter
        await this.fastify.userService.getUserPublic(reporterId, reportedId);

        await this.reportModel.insert(reportedId, reporterId);
        console.log(`User #${reporterId} reported user #${reportedId}`);
    }
}

export default fp(async (fastify: FastifyInstance) => {
    const reportService = new ReportService(fastify);
    fastify.decorate('reportService', reportService);
});