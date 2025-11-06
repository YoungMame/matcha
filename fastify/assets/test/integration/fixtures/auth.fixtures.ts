import { FastifyInstance } from "fastify";

export type UserData = {
    id?: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    bornAt: string;
    orientation: string;
    gender: string;
    bio?: string;
    tags?: string[];
}

export const signUpAndGetToken = async (app: FastifyInstance, userData: UserData): Promise<string | undefined> => {
    try {
        return await _signUpAndGetToken(app, userData);
    } catch (error) {
        console.error('Error during sign up:', error);
    }
}

const _signUpAndGetToken = async (app: FastifyInstance, userData: UserData): Promise<string | undefined> => {
    const signUpResponse = await app.inject({
        method: 'POST',
        url: '/auth/signup',
        payload: {
            username: userData.username,
            email: userData.email,
            password: userData.password,
        }
    });

    if (signUpResponse.statusCode !== 201) {
        throw new Error(`Failed to sign up user: ${signUpResponse.body}, code: ${signUpResponse.statusCode}`);
    }

    const createdUser = await app.userService.debugGetUser(userData.email);
    const userId = createdUser.id;
    const verifiedJwt = await app.userService.verifyEmail(userId);
    console.log(`Verified JWT: ${verifiedJwt}`);

    const completedProfileResponse = await app.inject({
        method: 'POST',
        url: '/private/user/me/complete-profile',
        headers: {
            'Cookie': `jwt=${verifiedJwt}`
        },
        payload: {
            firstName: userData.firstName,
            lastName: userData.lastName,
            bio: userData.bio,
            tags: userData.tags,
            gender: userData.gender,
            orientation: userData.orientation,
            bornAt: new Date(userData.bornAt)
        }
    });
    console.log(`Completed profile response: ${completedProfileResponse.statusCode} - ${completedProfileResponse.body}`);
    const jwtCookie2 = completedProfileResponse.cookies?.find((c: any) => c.name === 'jwt')?.value;

    if (jwtCookie2)
        return jwtCookie2;
    return undefined;
}

let userCounter = 0; // static

export const quickUser = async (app: FastifyInstance): Promise<{ userData: UserData, token: string }> => {
    let userCounterCopy = userCounter;
    let concat = '';
    const alphabets = 'abcdefghijklmnopqrstuvwxyz';
    console.log('userCounterCopy', userCounterCopy);
    while (userCounterCopy >= 0) {
        concat = alphabets[userCounterCopy % alphabets.length] + concat;
        userCounterCopy -= alphabets.length;
    }
    userCounter += 1;

    const userData: UserData = {
        username: `qtuser${concat}`,
        email: `quicktestuser${concat}@example.com`,
        password: 'fsdaf!ADAasf2321!!!!',
        firstName: `Quick${concat}`,
        lastName: 'TestUser',
        bio: `Nice description for quick user ${concat}`,
        tags: ['quick', 'test', 'user'],
        bornAt: '2000-01-01',
        orientation: 'heterosexual',
        gender: 'men'
    };
    const token = await signUpAndGetToken(app, userData);
    console.log(`Created quick user: ${token}`);
    if (!token) throw new Error('Failed to create quick user');

    const response = await app.inject({
        method: 'GET',
        url: '/private/user/me/profile',
        headers: {
            'Cookie': `jwt=${token}`
        }
    });
    console.log(response);
    if (response.statusCode !== 200)
        throw new Error(`Failed to get user data for quick user: ${response.body}`);
    const data = JSON.parse(response.body) as UserData;
    return { userData: data, token };
}
