import chai from 'chai';
import { expect } from 'chai';
import { buildApp } from '../../../srcs/app';
import { FastifyInstance } from 'fastify';

// import fixtures
import { quickUser } from '../fixtures/auth.fixtures';

const viewProfile = async (app: FastifyInstance, viewerToken: string, targetUserId: number) => {
    await app.inject({
        method: 'GET',
        url: `/private/user/view/${targetUserId}`,
        headers: {
            'Cookie': `jwt=${viewerToken}`
        },
    });
}

const likeProfile = async (app: FastifyInstance, likerToken: string, targetUserId: number) => {
    await app.inject({
        method: 'POST',
        url: `/private/user/like/${targetUserId}`,
        headers: {
            'Cookie': `jwt=${likerToken}`
        },
    });
}

const getFameRate = async (app: FastifyInstance, userToken: string) => {
    const response = await app.inject({
        method: 'GET',
        url: `/private/user/me/profile`,
        headers: {
            'Cookie': `jwt=${userToken}`
        },
    });
    const userData = JSON.parse(response.body);
    return userData.fameRate;
}

const createFameRate = (likerCount: number, viewerCount: number) => {
    return (Number(((likerCount / viewerCount)).toPrecision(2)) * 1000);
}

describe('Fame rate test', () => {
    let app: FastifyInstance;

    beforeEach(async () => {
        app = buildApp();
        await app.ready();
    });

    it('It should have the correct fame rate calculation', async function (this: any) {
        this.timeout(5000);

        const { userData: data1, token: token1 } = await quickUser(app);
        const { userData: data2, token: token2 } = await quickUser(app);
        const { userData: data3, token: token3 } = await quickUser(app);
        const { userData: data4, token: token4 } = await quickUser(app);
        const { userData: data5, token: token5 } = await quickUser(app);
        const { userData: data6, token: token6 } = await quickUser(app);
        const { userData: data7, token: token7 } = await quickUser(app);
        const { userData: data8, token: token8 } = await quickUser(app);

        let fameRate = await getFameRate(app, token1);
        expect(fameRate).to.equal(0);

        // User 2 views user 1 profile

        await viewProfile(app, token2, data1.id as number);
        fameRate = await getFameRate(app, token1);
        expect(fameRate).to.equal(0);

        await likeProfile(app, token2, data1.id as number);
        fameRate = await getFameRate(app, token1);
        expect(fameRate).to.equal(1000);

        // User 3 views user 1 profile
        await viewProfile(app, token3, data1.id as number);
        fameRate = await getFameRate(app, token1);
        expect(fameRate).to.equal(500);

        await likeProfile(app, token3, data1.id as number);
        fameRate = await getFameRate(app, token1);
        expect(fameRate).to.equal(1000);
        // User 4 views user 1 profile
        await viewProfile(app, token4, data1.id as number);
        fameRate = await getFameRate(app, token1);
        expect(fameRate).to.equal(createFameRate(2, 3));

        // User 5 views user 1 profile
        await viewProfile(app, token5, data1.id as number);
        fameRate = await getFameRate(app, token1);
        expect(fameRate).to.equal(createFameRate(2, 4));
        
        // User 6 views user 1 profile
        await viewProfile(app, token6, data1.id as number);
        fameRate = await getFameRate(app, token1);
        expect(fameRate).to.equal(createFameRate(2, 5));

        // User 7 views user 1 profile
        await viewProfile(app, token7, data1.id as number);
        fameRate = await getFameRate(app, token1);
        expect(fameRate).to.equal(createFameRate(2, 6));

        // User 8 views user 1 profile
        await viewProfile(app, token8, data1.id as number);
        fameRate = await getFameRate(app, token1);
        expect(fameRate).to.equal(createFameRate(2, 7));

        // User 4 likes user 1 profile
        await likeProfile(app, token4, data1.id as number);
        fameRate = await getFameRate(app, token1);
        expect(fameRate).to.equal(createFameRate(3, 7));
    });
});