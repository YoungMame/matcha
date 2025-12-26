import { FastifyInstance } from "fastify";
import path from "path";
import fs from "fs";
import FormData from "form-data";

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
        console.log('Sign up response:', signUpResponse);
        throw new Error(`Failed to sign up user: ${signUpResponse.body}, code: ${signUpResponse.statusCode}`);
    }

    const createdUser = await app.userService.debugGetUser(userData.email);
    const userId = createdUser.id;
    const emailCode: string = await app.userService.debugGetUserEmailCode(userId, "emailValidation") as string; // User should receive this code by email in real life
    const verifyEmailResponse = await app.inject({
        method: 'GET',
        url: `/auth/verify-email/${userId}/${emailCode}`
    });
    if (verifyEmailResponse.statusCode !== 200) {
        console.log('Verify email response:', verifyEmailResponse);
        throw new Error(`Failed to verify email: ${verifyEmailResponse.body}`);
    }

    const verifiedJwtResponse = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: {
            email: userData.email,
            password: userData.password
        }
    });
    if (verifiedJwtResponse.statusCode !== 203) {
        console.log('Verified JWT response:', verifiedJwtResponse);
        throw new Error(`Failed to login user: ${verifiedJwtResponse.body}`);
    }
    const verifiedJwt = verifiedJwtResponse.cookies?.find((c: any) => c.name === 'jwt')?.value;

    const completeProfilePayload = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        bio: userData.bio,
        tags: userData.tags,
        gender: userData.gender,
        orientation: userData.orientation,
        bornAt: new Date(userData.bornAt)
    }
    const completedProfileResponse = await app.inject({
        method: 'POST',
        url: '/private/user/me/complete-profile',
        headers: {
            'Cookie': `jwt=${verifiedJwt}`
        },
        payload: completeProfilePayload
    });
    if (completedProfileResponse.statusCode !== 201) {
        console.log('userData:', completeProfilePayload);
        throw new Error(`Failed to complete profile: ${completedProfileResponse.body}`);
    }
    const jwtCookie2 = completedProfileResponse.cookies?.find((c: any) => c.name === 'jwt')?.value;

    if (jwtCookie2)
        return jwtCookie2;
    console.log('No JWT cookie found after login');
    return undefined;
}

let userCounter = 0; // static

export const quickUser = async (app: FastifyInstance): Promise<{ userData: UserData, token: string }> => {
    let userCounterCopy = userCounter;
    let concat = '';
    const alphabets = 'abcdefghijklmnopqrstuvwxyz';
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
        bio: `Nice description for quick user ${concat}, lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`,
        tags: ['quick', 'test', 'user'],
        bornAt: '2000-01-01',
        orientation: 'bisexual',
        gender: 'men'
    };
    const token = await signUpAndGetToken(app, userData);
    if (!token) throw new Error('Failed to create quick user');

    const response2 = await app.inject({
        method: 'GET',
        url: '/private/user/me/profile',
        headers: {
            'Cookie': `jwt=${token}`
        }
    });
    if (response2.statusCode !== 200)
        throw new Error(`Failed to get user data for quick user: ${response2.body}`);
    const form = new FormData();
    const filePath = path.join(__dirname, '../../files/test.jpg');
    form.append('file', fs.createReadStream(filePath), {
        filename: 'test.jpg',
        contentType: 'image/jpeg'
    });

    const headers = form.getHeaders();
    headers['Cookie'] = `jwt=${token}`;

    await app.inject({
        method: 'POST',
        url: '/private/user/me/profile-picture',
        headers,
        payload: form
    });

    const data = JSON.parse(response2.body) as UserData;
    return { userData: data, token };
}
