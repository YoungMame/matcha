import PasswordManager from "../utils/password";
import User from "../classes/User";
import UserModel from "../models/User";
import LikeModel from "../models/Like";
import ViewModel from "../models/View"
// import ChatModel from "../models/Chat";
import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import { UnauthorizedError, NotFoundError, BadRequestError, InternalServerError, ForbiddenError, ConflictError } from "../utils/error";

export type BrowsingFilter = {
    age?: {
        min: number;
        max: number;
    };
    location?: {
        latitude: number;
        longitude: number;
    }
    fameRate?: { // between 0 and 1000
        min: number; 
        max: number;
    }
    tags?: Array<string>;
}

export type BrowsingSort = 'distance' | 'age' | 'fameRate' | 'tags';

export type BrowsingUser = {
    id: number;
    firstName: string;
    gender: string;
    tags: Array<string>;
    fameRate: number;
    profilePicture: string;
    bornAt: string;
    distance: number;
}

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

    private async getUsersFromCoordsAndRadius(userId: number, lat: number, lgn: number, limit: number, offset: number, radius: number, filters?: BrowsingFilter): Promise<Array<BrowsingUser>> {
        let parameters: Array<string | number | Array<string>> = [lat, lgn, radius, userId, limit, offset];
        if (filters?.tags && filters.tags.length > 0) {
            parameters.push(filters.tags);
        }
        const result = await this.fastify.pg.query(
            `
            SELECT u.id, u.first_name, u.gender, u.profile_pictures, u.profile_picture_index, u.born_at, u.tags, u.fame_rate, distances.distance
            FROM users u
            JOIN
            (
                SELECT user_id, 6371 * acos(least(1, greatest(-1, cos(radians(latitude)) * cos(radians($1)) * cos(radians($2) - radians(longitude)) + sin(radians(latitude)) * sin(radians($1))))) AS distance
                FROM locations
                WHERE 6371 * acos(least(1, greatest(-1, cos(radians(latitude)) * cos(radians($1)) * cos(radians($2) - radians(longitude)) + sin(radians(latitude)) * sin(radians($1))))) < $3
                AND user_id != $4
                ORDER BY distance
            ) AS distances ON u.id = distances.user_id
            WHERE u.is_profile_completed = TRUE
            AND u.profile_picture_index IS NOT NULL
            ${filters?.age ? `AND u.age BETWEEN ${filters.age.min} AND ${filters.age.max}` : ''}
            ${filters?.fameRate ? `AND u.fame_rate BETWEEN ${filters.fameRate.min} AND ${filters.fameRate.max}` : ''}
            ${filters?.tags && filters.tags.length > 0 ? `FROM users WHERE tags @> $7::text[]` : ''}
            LIMIT $5 OFFSET $6
            `,
            parameters
        );
        return result.rows.map(row => {
            const user = {
                id: row.id as number,
                firstName: row.first_name as string,
                gender: row.gender as string,
                tags: row.tags as Array<string>,
                fameRate: row.fame_rate as number,
                profilePicture: row.profile_pictures[row.profile_picture_index] ?? '',
                bornAt: row.born_at as string,
                distance: row.distance as number
            }
            return user;
        });
    }

    private getSimilarTagsCount(userTags: Array<string>, otherUserTags: Array<string>): number {
        let count = 0;

        for (const tag of userTags) {
            if (otherUserTags.includes(tag)) {
                count++;
            }
        }
        return count;
    }

    private sortByDistance(userRows: Array<BrowsingUser>): Array<BrowsingUser> {
        return userRows.sort((a, b) => a.distance - b.distance);
    }

    private sortByAge(userRows: Array<BrowsingUser>, bornAt: Date): Array<BrowsingUser> {
        return userRows.sort((a, b) => Math.abs(bornAt.getTime() - new Date(a.bornAt).getTime()) - Math.abs(bornAt.getTime() - new Date(b.bornAt).getTime()));
    }

    private sortByFameRate(userRows: Array<BrowsingUser>): Array<BrowsingUser> {
        return userRows.sort((a, b) => a.fameRate - b.fameRate);
    }

    private sortByTags(userRows: Array<BrowsingUser>, userTags: Array<string>): Array<BrowsingUser> {
        return userRows.sort((a, b) => this.getSimilarTagsCount(userTags, b.tags || []) - this.getSimilarTagsCount(userTags, a.tags || []));
    }

    public async browseUsers(userId: number, limit: number = 5, offset: number = 0, radius: number = 25, filters?: BrowsingFilter, sort?: BrowsingSort): Promise<Array<BrowsingUser>> {
        const user = await this.fastify.userService.getMe(userId);
        const lat = filters?.location?.latitude ?? user.location?.latitude;
        const lgn = filters?.location?.longitude ?? user.location?.longitude;
        const bornAt = user.bornAt;
        const tags = user.tags;
        
        if (lat === undefined || lgn === undefined)
            throw new BadRequestError();
        const userRows = await this.getUsersFromCoordsAndRadius(userId, lat, lgn, limit, offset, radius);
        switch (sort) {
            case 'distance':
                return this.sortByDistance(userRows);
            case 'age':
                return this.sortByAge(userRows, bornAt);
            case 'fameRate':
                return this.sortByFameRate(userRows);
            case 'tags':
                return this.sortByTags(userRows, tags);
            default:
                return userRows;
        }
    }
}

export default fp(async (fastify: FastifyInstance) => {
    const browsingService = new BrowsingService(fastify);
    fastify.decorate('browsingService', browsingService);
});