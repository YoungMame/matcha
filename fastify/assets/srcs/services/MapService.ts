import UserModel from "../models/User";
import { MapUser, MapUserCluster } from "../models/User";
import { FastifyInstance } from 'fastify';
import { BadRequestError } from "../utils/error";

class MapService {
    private fastify: FastifyInstance;
    private userModel: UserModel;

    constructor(fastify: FastifyInstance) {
        this.fastify = fastify;
        this.userModel = new UserModel(fastify);
    }

    async getNearUsers(level: number, latitude: number, longitude: number, radius: number) {
        if (isNaN(level) || isNaN(latitude) || isNaN(longitude) || isNaN(radius))
            throw new BadRequestError();
        if (level != 0 && level != 1 && level != 2)
            throw new BadRequestError();
        if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180 || radius < 0)
            throw new BadRequestError();
        if (radius > 90)
            radius = 90;

        if (level = 0)
        {
            const users = await this.userModel.getUsersFromLocation(latitude, longitude, radius);
            return users;
        }
        else
        {
            const users = await this.userModel.getUsersCountByLocation(level, latitude, longitude, radius);
            return users;
        }
    }
}