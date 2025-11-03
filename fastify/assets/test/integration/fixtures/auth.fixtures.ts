import { FastifyInstance } from "fastify";

export type UserData = {
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

    const userId = 501 // TODO replace with a call to user service get me
    app.userService.verifyEmail(userId);

    const jwtCookie = signUpResponse.cookies?.find((c: any) => c.name === 'jwt')?.value;
    if (jwtCookie)
        return jwtCookie;
    return undefined;
}