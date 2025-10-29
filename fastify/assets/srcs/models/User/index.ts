import { snakeCase } from "text-case";
import { FastifyInstance } from "fastify";
import { ForbiddenError, InternalServerError, UnauthorizedError } from "../../utils/error";

type UserProfile = {
    [key: string]: any;
    username?: string;
    email?: string;
    bio?: string;
    tags?: string[];
    profilePictureIndex?: number | null;
    profilePictures?: string[];
    string?: string[];
    gender?: string;
    orientation?: string;
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

    insert = async (email: string, password_hash: string, username: string, born_at: Date, gender: string, orientation: string) => {
        try {
            const result = await this.fastify.pg.query(
                'INSERT INTO users (email, password_hash, username, born_at, gender, orientation) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
                [email, password_hash, username, born_at.toISOString(), gender, orientation]
            );
            return result.rows[0].id;
        } catch (error: Error | any) {
            if (error.code && error.code === '23505') { // Unique violation
                throw new ForbiddenError('Email or username already exists');
            }
            throw new InternalServerError('Database error');
        }

    }

    findLocationByUserId = async (userId: number): Promise<Object> => {
        const result = await this.fastify.pg.query(
            'SELECT * FROM locations WHERE user_id=$1', [userId]
        );
        return ({
            latitude: result.rows[0]?.latitude || undefined,
            longitude: result.rows[0]?.longitude || undefined,
            updatedAt: result.rows[0] ? new Date(result.rows[0].updated_at) : undefined 
        });
    }

    findById = async (id: number) => {
        const result = await this.fastify.pg.query(
            'SELECT * FROM users WHERE id=$1', [id]
        );
        if (result.rows.length === 0) {
            throw new UnauthorizedError;
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
            throw new UnauthorizedError;
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
            throw new UnauthorizedError;
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
            fixedObj[snakeCase(key as string)] = value;
            delete obj[key];
        }
        return fixedObj;
    }

    update = async (id: number, user: UserProfile, location?: UserLocation) => {
        user = this.fixPropertiesCase(user);
        await this.fastify.pg.query(
            `UPDATE users SET ${Object.entries(user).map(([key, _], index) => `${key}=$${index + 1}`).join(', ')} WHERE id=${id};`,
            Object.values(user)
        );
        if (location)
        {
            await this.fastify.pg.query(
                `UPDATE locations SET latitude=${location.latitude}, longitude=${location.longitude} WHERE user_id=${id};`,
            );
        }
    }

    remove = async (id: number) => {
        await this.fastify.pg.query(
            `DELETE FROM users WHERE id=${id}`
        );
    }   
}