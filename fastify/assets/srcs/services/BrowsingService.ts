import PasswordManager from "../utils/password";
import User from "../classes/User";
import UserModel from "../models/User";
import LikeModel from "../models/Like";
import ViewModel from "../models/View"
// import ChatModel from "../models/Chat";
import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import { UnauthorizedError, NotFoundError, BadRequestError, InternalServerError, ForbiddenError, ConflictError } from "../utils/error";

class BrowsingService {
    private fastify: FastifyInstance;
    private userModel: UserModel;
    private likeModel: LikeModel;
    private viewModel: ViewModel
    // private chatModel: ChatModel;
    UsersCache: Map<number, User>;

    constructor(fastify: FastifyInstance) {
        this.fastify = fastify;
        this.userModel = new UserModel(fastify);
        this.likeModel = new LikeModel(fastify);
        this.viewModel = new ViewModel(fastify);
        // this.chatModel = new ChatModel(fastify);
        this.UsersCache = new Map<number, User>();
    }

    private async getUsersFromCoordsAndRadius(userId: number, lat: number, lgn: number, limit: number, offset: number, radius: number) {
        const rows = await this.fastify.pg.query(
            `
            SELECT u.id, u.first_name, u.gender, u.profile_pictures, u.profile_picture_index, distances.distance
            FROM users u
            JOIN
            (
                SELECT user_id, 6371 * acos(least(1, greatest(-1, cos(radians(latitude)) * cos(radians($1)) * cos(radians($2) - radians(longitude)) + sin(radians(latitude)) * sin(radians($1))))) AS distance
                FROM locations
                WHERE 6371 * acos(least(1, greatest(-1, cos(radians(latitude)) * cos(radians($1)) * cos(radians($2) - radians(longitude)) + sin(radians(latitude)) * sin(radians($1))))) < $3
                AND user_id != $4
                ORDER BY distance
                LIMIT $5 OFFSET $6
            ) AS distances ON u.id = distances.user_id
            WHERE u.is_profile_completed = TRUE
            `,
            [lat, lgn, radius, userId, limit, offset]
        );
        // console.log(rows.rows);
        return rows.rows;
    }

    public async browseUsers(userId: number, limit: number = 5, offset: number = 0, radius: number = 25): Promise<Array<any>> {
        const user = await this.fastify.userService.getMe(userId);
        const lat = user.location?.latitude;
        const lgn = user.location?.longitude;
        
        if (lat === undefined || lgn === undefined)
            throw new BadRequestError();
        const userRows = await this.getUsersFromCoordsAndRadius(userId,lat, lgn, limit, offset, radius);
        return userRows;
    }
}

export default fp(async (fastify: FastifyInstance) => {
    const browsingService = new BrowsingService(fastify);
    fastify.decorate('browsingService', browsingService);
});