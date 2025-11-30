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

    private async getUsersFromCoordsAndRadius(userId: number, username: string | undefined, lat: number, lgn: number, limit: number, offset: number, radius: number, gender?: string, filters?: BrowsingFilter): Promise<Array<BrowsingUser>> {
        let parameters: Array<string | number | Array<string>> = [lat, lgn, radius, userId, limit, offset];

        let tagsIndex: number | undefined;
        let genderIndex: number | undefined;
        let usernameIndex: number | undefined;

        if (filters?.tags && filters.tags.length > 0) {
            parameters.push(filters.tags);
            tagsIndex = parameters.length;
        }

        if (gender) {
            parameters.push(gender);
            genderIndex = parameters.length;
        }

        if (username) {
            // pass wildcard in parameter to avoid concatenation in SQL
            parameters.push(`%${username}%`);
            usernameIndex = parameters.length;
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
            ${filters?.age ? `AND (CURRENT_DATE - u.born_at) / 365
BETWEEN ${filters.age.min} AND ${filters.age.max}
            ` : ''}
            ${filters?.fameRate ? `AND u.fame_rate BETWEEN ${filters.fameRate.min} AND ${filters.fameRate.max}` : ''}
            ${tagsIndex ? `AND u.tags @> $${tagsIndex}::text[]` : ''}
            ${genderIndex ? `AND u.gender = $${genderIndex}` : ''}
            ${usernameIndex ? `AND (u.first_name ILIKE $${usernameIndex} OR u.username ILIKE $${usernameIndex} OR u.last_name ILIKE $${usernameIndex})` : ''}
            LIMIT $5 OFFSET $6
            `,
            parameters
        );
        return result.rows.map((row: {
            id: number;
            first_name: string;
            gender: string;
            tags: Array<string>;
            fame_rate: number;
            profile_pictures: Array<string>;
            profile_picture_index: number;
            born_at: string;
            distance: number;
        }) => {
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
        return userRows.sort((a, b) => b.fameRate - a.fameRate);
    }

    private sortByTags(userRows: Array<BrowsingUser>, userTags: Array<string>): Array<BrowsingUser> {
        return userRows.sort((a, b) => this.getSimilarTagsCount(userTags, b.tags || []) - this.getSimilarTagsCount(userTags, a.tags || []));
    }

    private sortByAll(userRows: Array<BrowsingUser>, bornAt: Date, userTags: Array<string>, fameRate: number): Array<BrowsingUser> {
        const ageWeight = 0.3;
        const tagsWeight = 0.2;
        const fameRateWeight = 0.2;
        const distanceWeight = 0.3;
        const maxAgeDiff = 10; // years
        const maxFameDiff = 400;
        const maxDistance = 100;

        let scoreMap = new Map<number, number>(); // index to score

        userRows.forEach(user => {
            const ageDiff = Math.abs(bornAt.getFullYear() - new Date(user.bornAt).getFullYear());

            const ageScore = 100 - (Math.min(ageDiff, maxAgeDiff) / maxAgeDiff) * 100;

            const similarTagsCount = this.getSimilarTagsCount(userTags, user.tags || []);
            const tagsScore = userTags.length > 0 ? (similarTagsCount / userTags.length) * 100 : 0;

            const fameRateDiff = Math.abs(fameRate - user.fameRate);
            const fameRateScore = 100 - (fameRateDiff / maxFameDiff) * maxFameDiff;

            const distanceScore = 100 - (Math.min(user.distance, maxDistance) / maxDistance) * 100;

            const totalScore = (ageScore * ageWeight) + (tagsScore * tagsWeight) + (fameRateScore * fameRateWeight) + (distanceScore * distanceWeight);
            // console.log(`User ${user.id} - Age Score: ${ageScore.toFixed(2)}, Tags Score: ${tagsScore.toFixed(2)}, Fame Rate Score: ${fameRateScore.toFixed(2)}, Total Score: ${totalScore.toFixed(2)}, Distance Score: ${distanceScore.toFixed(2)}`);
            scoreMap.set(user.id, totalScore);
        })
        return userRows.sort((a, b) => (scoreMap.get(b.id) || 0) - (scoreMap.get(a.id) || 0));
    }

    public async browseUsers(userId: number, limit: number = 5, offset: number = 0, radius: number = 25, filters?: BrowsingFilter, sort?: BrowsingSort): Promise<Array<BrowsingUser>> {
        const user = await this.fastify.userService.getMe(userId);
        const lat = filters?.location?.latitude ?? user.location?.latitude;
        const lng = filters?.location?.longitude ?? user.location?.longitude;
        if (filters?.tags && filters.tags.length === 0) {
            delete filters.tags;
        }
        const bornAt = user.bornAt;
        const fameRate = user.fameRate;
        const tags = user.tags;

        if (lat === undefined || lng === undefined)
            throw new BadRequestError();
        let gender: string | undefined = undefined;
        if (user.orientation === 'heterosexual') {
            gender = user.gender === 'men' ? 'women' : 'men';
        } else if (user.orientation === 'homosexual') {
            gender = user.gender;
        }
        const userRows = await this.getUsersFromCoordsAndRadius(userId, undefined, lat, lng, limit, offset, radius, gender, filters);
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
                return this.sortByAll(userRows, bornAt, tags, fameRate ?? 0);
        }
    }

    public async researchUsers(userId: number, username: string, limit: number = 5, offset: number = 0, radius: number = 25, filters?: BrowsingFilter, sort?: BrowsingSort): Promise<Array<BrowsingUser>> {
        const user = await this.fastify.userService.getMe(userId);
        const lat = filters?.location?.latitude ?? user.location?.latitude;
        const lng = filters?.location?.longitude ?? user.location?.longitude;
        if (filters?.tags && filters.tags.length === 0) {
            delete filters.tags;
        }
        const bornAt = user.bornAt;
        const fameRate = user.fameRate;
        const tags = user.tags;

        if (lat === undefined || lng === undefined)
            throw new BadRequestError();
        let gender: string | undefined = undefined;
        if (user.orientation === 'heterosexual') {
            gender = user.gender === 'men' ? 'women' : 'men';
        } else if (user.orientation === 'homosexual') {
            gender = user.gender;
        }
        const userRows = await this.getUsersFromCoordsAndRadius(userId, username, lat, lng, limit, offset, radius, gender, filters);
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
                return this.sortByAll(userRows, bornAt, tags, fameRate ?? 0);
        }
    }
}

export default fp(async (fastify: FastifyInstance) => {
    const browsingService = new BrowsingService(fastify);
    fastify.decorate('browsingService', browsingService);
});