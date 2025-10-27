import { snakeCase } from "text-case";
import { FastifyInstance } from "fastify";

type UserProfile = {
    [key: string]: any;
    username?: string;
    email?: string;
    bio?: string;
    tags?: string[];
    profilePictureIndex?: number;
    gender?: string;
    orientation?: string;
};

type UserLocation = {
    latitude: number;
    longitude: number;
};

export default class UserModel {
    constructor(private fastify: FastifyInstance) {}

    insert = async (email: string, password_hash: string, username: string, born_at: Date, gender: string, orientation: string) => {
        const result = await this.fastify.pg.query(
            'INSERT INTO users (email, password_hash, username, born_at, gender, orientation) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
            [email, password_hash, username, born_at.toISOString(), gender, orientation]
        );
        console.log(result);
        return result.rows[0].id;
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
        const location = await this.findLocationByUserId(result.rows[0].id);
        result.rows[0].location = location;
        return result.rows[0];
    };

    findByEmail = async (email: string) => {
        const result = await this.fastify.pg.query(
            'SELECT * FROM users WHERE email=$1', [email]
        );
        const location = await this.findLocationByUserId(result.rows[0].id);
        result.rows[0].location = location;
        return result.rows[0];
    }

    findByUsername = async (username: string) => {
        const result = await this.fastify.pg.query(
            'SELECT * FROM users WHERE username=$1', [username]
        );
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
            fixedObj[key] = undefined;
        }
        return fixedObj;
    }

    update = async (id: number, user: UserProfile, location?: UserLocation) => {
        user = this.fixPropertiesCase(user);
        await this.fastify.pg.query(
            `UPDATE users SET ${Object.entries(user).map(([key, value]) => `${key}=${value}`).join(', ')} WHERE id=${id}`,
        );
        if (location)
        {
            await this.fastify.pg.query(
                `UPDATE locations SET latitude=${location.latitude}, longitude=${location.longitude} WHERE user_id=${id}`,
            );
        }
    }

    remove = async (id: number) => {
        await this.fastify.pg.query(
            `DELETE FROM users WHERE id=${id}`
        );
    }   
}