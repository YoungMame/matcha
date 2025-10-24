import fastify from "../../app";

export const insert = async (email: string, password_hash: string, username: string, born_at: Date, gender: string, orientation: string) => {
    const result = await fastify.pg.query(
        'INSERT INTO users (email, password_hash, username, born_at, gender, orientation) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
        [email, password_hash, username, born_at.toISOString(), gender, orientation]
    );
    return result.rows[0].id;
};

export const findById = async (id: number) => {
    const result = await fastify.pg.query(
        'SELECT * FROM users WHERE id=$1', [id]
    );
    return result.rows[0];
};

export const findByEmail = async (email: string) => {
    const result = await fastify.pg.query(
        'SELECT * FROM users WHERE email=$1', [email]
    );
    return result.rows[0];
};

export const findByUsername = async (username: string) => {
    const result = await fastify.pg.query(
        'SELECT * FROM users WHERE username=$1', [username]
    );
    return result.rows[0];
}

export const setVerified = async (id: number) => {
    await fastify.pg.query(
        'UPDATE users SET is_verified=true WHERE id=$1', [id]
    );
};

type UserProfile = {
    username?: string;
    email?: string;
    bio?: string;
    tags?: string[];
};

export const update = async (id: number, user: UserProfile) => {
    await fastify.pg.query(
        `UPDATE users SET ${Object.entries(user).map(([key, value]) => `${key}=${value}`).join(', ')} WHERE id=${id}`,
    );
};

