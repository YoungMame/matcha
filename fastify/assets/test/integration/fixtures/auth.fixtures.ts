import { FastifyInstance } from "fastify";
import User from "../../../srcs/classes/User";

export type UserData = {
    id?: number;
    username: string;
    email: string;
    password: string;
    bornAt: string;
    orientation: string;
    gender: string;
}

export const signUpAndGetToken = async (app: FastifyInstance, userData: UserData): Promise<string | undefined> => {
    const signUpResponse = await app.inject({
        method: 'POST',
        url: '/auth/signup',
        payload: userData
    });

    if (signUpResponse.statusCode !== 201) {
        throw new Error(`Failed to sign up user: ${signUpResponse.body}, code: ${signUpResponse.statusCode}`);
    }

    const createdUser = await app.userService.getUserPublic(undefined, userData.email);
    const userId = createdUser.id;
    app.userService.verifyEmail(userId);

    const jwtCookie = signUpResponse.cookies?.find((c: any) => c.name === 'jwt')?.value;
    if (jwtCookie)
        return jwtCookie;
    return undefined;
}

let userCounter = 0; // static

export const quickUser = async (app: FastifyInstance): Promise<{ userData: UserData, token: string }> => {
    userCounter += 1;
    const alphabets = 'abcdefghijklmnopqrstuvwxyz';
    const letter = alphabets[userCounter % alphabets.length];
    const userData: UserData = {
        username: `qtuser${letter}`,
        email: `quicktestuser${letter}@example.com`,
        password: 'fsdaf!ADAasf2321!!!!',
        bornAt: '2000-01-01',
        orientation: 'heterosexual',
        gender: (userCounter % 2 === 0 ? 'men' : 'women')
    };
    const token = await signUpAndGetToken(app, userData);
    if (!token) throw new Error('Failed to create quick user');

    const response = await app.inject({
        method: 'GET',
        url: '/private/user/me',
        headers: {
            'Cookie': `jwt=${token}`
        }
    });
    if (response.statusCode !== 200)
        throw new Error(`Failed to get user data for quick user: ${response.body}`);
    const data = JSON.parse(response.body) as UserData;
    return { userData: data, token };
}
