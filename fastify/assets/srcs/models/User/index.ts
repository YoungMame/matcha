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
    profilePictureIndex?: number | null;
    profilePictures?: string[];
    string?: string[];
    gender?: string;
    isProfileCompleted?: boolean;
    orientation?: string;
    bornAt?: Date | string;
};

type UserLocation = {
    latitude: number;
    longitude: number;
};

export default class UserModel {
    constructor(private fastify: FastifyInstance) {}

    private nullToUndefined = (row: any) => {
        if (!row) return;
        if (row.profile_picture_index === null) row.profile_picture_index = undefined;
        if (row.profilePictureIndex === null) row.profilePictureIndex = undefined;
    }

    insert = async (email: string, password_hash: string, username: string) => {
        try {
            const result = await this.fastify.pg.query(
                'INSERT INTO users (email, password_hash, username) VALUES ($1, $2, $3) RETURNING id',
                [email, password_hash, username]
            );
            return result.rows[0].id;
        } catch (error: Error | any) {
            if (error.code && error.code === '23505') { // Unique violation
                throw new ForbiddenError('Email or username already exists');
            }
            throw new InternalServerError('Database error');
        }

    }

    findLocationByUserId = async (userId: number): Promise<{ latitude?: number | undefined; longitude?: number | undefined; updatedAt?: Date | undefined }> => {
        const result = await this.fastify.pg.query(
            'SELECT * FROM locations WHERE user_id=$1 ORDER BY updated_at DESC LIMIT 1', [userId]
        );
        const row = result.rows[0];
        return {
            latitude: row ? row.latitude : undefined,
            longitude: row ? row.longitude : undefined,
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
            throw new NotFoundError;
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
            throw new NotFoundError;
        }
        this.nullToUndefined(result.rows[0]);
        const location = await this.findLocationByUserId(result.rows[0].id);
        result.rows[0].location = location
        return result.rows[0];
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
                await this.fastify.pg.query(
                    `INSERT INTO locations (user_id, latitude, longitude) VALUES (${id}, ${location.latitude}, ${location.longitude});`,
                );
                return;
            }
            else
            {
                await this.fastify.pg.query(
                    `UPDATE locations SET latitude=${location.latitude}, longitude=${location.longitude} WHERE user_id=${id};`,
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
}