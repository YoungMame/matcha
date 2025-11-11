import chai from 'chai';
import { expect } from 'chai';
import { buildApp } from '../../../srcs/app';
import { FastifyInstance } from 'fastify';

// import fixtures
import { quickUser } from '../fixtures/auth.fixtures';

describe('Block users test', () => {
    let app: FastifyInstance;

    beforeEach(async () => {
        app = buildApp();
        await app.ready();
    });

    it('should be able to get blocked users list', async function (this: any) {
        this.timeout(5000);

        const { userData: data1, token: token1 } = await quickUser(app);
        const { userData: data2, token: token2 } = await quickUser(app);
        const { userData: data3, token: token3 } = await quickUser(app);
        const { userData: data4, token: token4 } = await quickUser(app);

        let response = await app.inject({
            method: 'POST',
            url: `/private/user/block/${data2.id}`,
            headers: {
                'Cookie': `jwt=${token1}`
            }
        });
        expect(response.statusCode).to.equal(201);
        
        response = await app.inject({
            method: 'GET',
            url: `/private/user/block`,
            headers: {
                'Cookie': `jwt=${token1}`
            }
        });
        expect(response.statusCode).to.equal(200);
        const responseData = JSON.parse(response.body);
        const blockedUsersArray = responseData.users;
        expect(blockedUsersArray).to.be.an('array');
        expect(blockedUsersArray.some((user: any) => user.id === data2.id)).to.equal(true);
        expect(blockedUsersArray.some((user: any) => user.username === data2.username)).to.equal(true);
    });
});