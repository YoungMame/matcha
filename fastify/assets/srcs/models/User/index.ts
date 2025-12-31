import { snakeCase } from "text-case";
import { FastifyInstance } from "fastify";
import { ForbiddenError, InternalServerError, NotFoundError, UnauthorizedError } from "../../utils/error";

type UserProfile = {
    [key: string]: any;
    username?: string;
    email?: string;
    bio?: string;
    firstName?: string;
    lastName?: string;
    tags?: string[];
    profilePictureIndex?: number | undefined;
    profilePictures?: string[];
    fameRate?: number | undefined;
    string?: string[];
    gender?: string;
    isProfileCompleted?: boolean;
    orientation?: string;
    bornAt?: Date | string;
};

type UserLocation = {
    latitude: number;
    longitude: number;
    city: string;
    country: string;
};

export type MapUserCluster = {
    latitude: number
    longitude: number
    count: number
}

export type MapUser = {
    id: number
    firstName: string
    profilePicture: string
    latitude: number
    longitude: number
}

type BlockedUser = {
    id: number;
    blockerId: number;
    blockedId: number;
}

export default class UserModel {
    constructor(private fastify: FastifyInstance) {}

    private nullToUndefined = (row: any) => {
        if (!row) return;
        if (row.profile_picture_index === null) row.profile_picture_index = undefined;
        if (row.profilePictureIndex === null) row.profilePictureIndex = undefined;
    }

    insert = async (email: string, password_hash: string, username: string, provider: string) => {
        try {
            const result = await this.fastify.pg.query(
                'INSERT INTO users (email, password_hash, username, provider_) VALUES ($1, $2, $3, $4) RETURNING id',
                [email, password_hash, username, provider]
            );
            return result.rows[0].id;
        } catch (error: Error | any) {
            if (error.code && error.code === '23505') { // Unique violation
                throw new ForbiddenError('Email or username already exists');
            }
            throw new InternalServerError('Database error');
        }

    }

    findLocationByUserId = async (userId: number): Promise<{ latitude?: number | undefined; longitude?: number | undefined; city: string | undefined, country: string | undefined, updatedAt?: Date | undefined }> => {
        const result = await this.fastify.pg.query(
            'SELECT * FROM locations WHERE user_id=$1 ORDER BY updated_at DESC LIMIT 1', [userId]
        );
        const row = result.rows[0];
        return {
            latitude: row ? row.latitude : undefined,
            longitude: row ? row.longitude : undefined,
            city: row ? row.city : undefined,
            country: row ? row.country : undefined,
            updatedAt: row && row.updated_at ? new Date(row.updated_at) : undefined
        };
    }

    findById = async (id: number) => {
        const result = await this.fastify.pg.query(
            'SELECT * FROM users WHERE id=$1', [id]
        );
        if (result.rows.length === 0) {
            throw new NotFoundError;
        }
        this.nullToUndefined(result.rows[0]);
        const location = await this.findLocationByUserId(result.rows[0].id);
        result.rows[0].location = location;
        return result.rows[0];
    };

    findByEmail = async (email: string) => {
        const result = await this.fastify.pg.query(
            'SELECT * FROM users WHERE email=$1', [email]
        );
        if (result.rows.length === 0) {
            return null;
        }
        this.nullToUndefined(result.rows[0]);
        const location = await this.findLocationByUserId(result.rows[0].id);
        result.rows[0].location = location;
        return result.rows[0];
    }

    findByUsername = async (username: string) => {
        const result = await this.fastify.pg.query(
            'SELECT * FROM users WHERE username=$1', [username]
        );
        if (result.rows.length === 0) {
            return null;
        }
        this.nullToUndefined(result.rows[0]);
        const location = await this.findLocationByUserId(result.rows[0].id);
        result.rows[0].location = location
        return result.rows[0];
    }

    getUsersFromLocation = async (lat: number, lgn: number, radius: number): Promise<MapUser[]> => {
        const result = await this.fastify.pg.query(
            `SELECT u.id, u.first_name, u.profile_pictures[u.profile_picture_index + 1] AS profile_picture, locations.latitude, locations.longitude
            FROM locations
            JOIN users AS u ON locations.user_id = u.id
            WHERE locations.user_id IS NOT NULL
            AND 6371 * acos(least(1, greatest(-1, cos(radians(locations.latitude)) * cos(radians($1)) * cos(radians($2) - radians(locations.longitude)) + sin(radians(locations.latitude)) * sin(radians($1))))) < $3`,
            [lat, lgn, radius]
        );
        console.log('getUsersFromLocation result:', result.rows);
        return result.rows.map((row: { id: number, first_name: string, profile_picture: string, latitude: number, longitude: number }) => { return { id: row.id, firstName: row.first_name, profilePicture: row.profile_picture, latitude: row.latitude, longitude: row.longitude }});
    }

    getUsersCountByLocation = async (level: number, lat: number, lgn: number, radius: number): Promise<MapUserCluster[]> => {
        const areaName = (level == 1) ? 'city' : (level == 2) ? 'country' : null;
        if (!areaName)
            return [];

        const result = await this.fastify.pg.query(
            `SELECT count(*) AS count, avg(latitude) AS latitude, avg(longitude) AS longitude
            FROM locations
            WHERE ${areaName} IS NOT NULL
            AND user_id IS NOT NULL
            AND 6371 * acos(least(1, greatest(-1, cos(radians(latitude)) * cos(radians($1)) * cos(radians($2) - radians(longitude)) + sin(radians(latitude)) * sin(radians($1))))) < $3
            GROUP BY ${areaName}`,
            [lat, lgn, radius]
        );
        return result.rows.map((row: { count: number, latitude: number, longitude: number }) => { return { count: row.count, latitude: row.latitude, longitude: row.longitude }});
    }

    setVerified = async (id: number) => {
        await this.fastify.pg.query(
            'UPDATE users SET is_verified=true WHERE id=$1', [id]
        );
    }

    private fixPropertiesCase = (obj: UserProfile): UserProfile => {
        const fixedObj: UserProfile = {};
        for (const [key, value] of Object.entries(obj)) {
            const newKey = snakeCase(key as string);
            if (newKey !== key) {
                fixedObj[newKey] = value;
                delete obj[key];
            } else {
                fixedObj[key] = value;
            }
        }
        return fixedObj;
    }

    update = async (id: number, user: UserProfile, location?: UserLocation) => {
        user = this.fixPropertiesCase(user);
        if (user.bornAt instanceof Date) {
            user.bornAt = user.bornAt.toISOString();
        }
        const userKeysCount = Object.keys(user).length;
        if (userKeysCount > 0)
        {
            await this.fastify.pg.query(
                `UPDATE users SET ${Object.entries(user).map(([key, _], index) => `${key}=$${index + 1}`).join(', ')} WHERE id=${id};`,
                Object.values(user)
            );
        }
        if (location)
        {
            const rows = await this.fastify.pg.query(
                `SELECT * FROM locations WHERE user_id=${id};`,
            );
            if (rows.rows.length === 0)
            {
                const result = await this.fastify.pg.query(
                    `INSERT INTO locations (user_id, latitude, longitude, city, country) VALUES (${id}, ${location.latitude}, ${location.longitude}, \'${location.city}\', \'${location.country}\');`,
                );
                return;
            }
            else
            {
                await this.fastify.pg.query(
                    `UPDATE locations SET latitude=${location.latitude}, longitude=${location.longitude}, city=\'${location.city}\', country=\'${location.country}\' WHERE user_id=${id};`,
                );
            }
        }
    }

    remove = async (id: number) => {
        await this.fastify.pg.query(
            `DELETE FROM users WHERE id=${id}`
        );
    }

    setUserConnection = async (id: number, isConnected: boolean, lastConnection?: Date) => {
        if (lastConnection)
        {
            await this.fastify.pg.query(
                `UPDATE users SET is_connected=$1, last_connection=$2 WHERE id=$3`,
                [isConnected, lastConnection.toISOString(), id]
            );
        }
        else
        {
            await this.fastify.pg.query(
                `UPDATE users SET is_connected=$1 WHERE id=$2`,
                [isConnected, id]
            );
        }
    }

    getUserConnection = async (id: number): Promise<{ isConnected: boolean, lastConnection: Date | undefined } | null> => {
        const result = await this.fastify.pg.query(
            'SELECT is_connected, last_connection FROM users WHERE id=$1', [id]
        );
        if (result.rows.length === 0)
            return null;
        const isConnected = result.rows[0].is_connected as boolean;
        const lastConnection = !isConnected ? new Date(result.rows[0].last_connection) : undefined;
        return {
            isConnected,
            lastConnection
        };
    }

    insertBlockedUser = async (blockerId: number, blockedId: number): Promise<number | undefined> => {
        const result = await this.fastify.pg.query(
            'INSERT INTO blocked_users (blocker_id, blocked_id) VALUES ($1, $2) RETURNING id',
            [blockerId, blockedId]
        );
        if (!(result.rows[0]))
            return undefined;
        return (result.rows[0].id as number);
    }

    getBlockedUser = async (userId: number, blockerId: number): Promise<BlockedUser | undefined> => {
        const result = await this.fastify.pg.query(
            'SELECT * FROM blocked_users WHERE blocked_id=$1 AND blocker_id=$2',
            [userId, blockerId]
        );
        if (!(result.rows[0]))
            return undefined;
        return ({
            id: result.rows[0].id as number,
            blockerId: result.rows[0].blocker_id as number,
            blockedId: result.rows[0].blocked_id as number
        });
    }

    getBlockedUsersByBlockerId = async (blockerId: number): Promise<Map<number, Date>> => {
        const result = await this.fastify.pg.query(
            'SELECT blocked_id, created_at FROM blocked_users WHERE blocker_id=$1',
            [blockerId]
        );
        let map = new Map<number, Date>();
        result.rows.forEach(row => {
            map.set(row.blocked_id as number, new Date(row.created_at as string));
        });
        return map;
    }

    getBlockedUsersByBlockerIdDetails = async (blockerId: number): Promise<{ id: number; username: string; createdAt: Date }[]> => {
        const result = await this.fastify.pg.query(
            'SELECT blocked_id, blocked_username, created_at FROM blocked_with_username WHERE blocker_id = $1',
            [blockerId]
        );
        return result.rows.map((row: { blocked_id: number; blocked_username: string; created_at: Date }) => ({
            id: row.blocked_id,
            username: row.blocked_username,
            createdAt: new Date(row.created_at)
        }));
    }

    getBlockerUsersByBlockedId = async (blockedId: number): Promise<Map<number, Date>> => {
        const result = await this.fastify.pg.query(
            'SELECT blocker_id, created_at FROM blocked_users WHERE blocked_id = $1',
            [blockedId]
        );
        let map = new Map<number, Date>();
        result.rows.forEach(row => {
            map.set(row.blocker_id as number, new Date(row.created_at as string));
        });
        return map;
    }

    removeBlockedUser = async (blockerId: number, blockedId: number) => {
        await this.fastify.pg.query(
            'DELETE FROM blocked_users WHERE blocker_id=$1 AND blocked_id=$2',
            [blockerId, blockedId]
        );
    }
}