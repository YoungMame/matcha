import chai from 'chai';
const expect = chai.expect;
import { buildApp } from '../../../srcs/app';
import { FastifyInstance } from 'fastify';

// import fixtures
import { signUpAndGetToken, quickUser, UserData } from '../fixtures/auth.fixtures';

describe('Websocket like test', () => {
    let app: FastifyInstance;

    beforeEach(async () => {
        app = buildApp();
        await app.ready();
    });
    
    afterEach(async () => {
        await app.close();
    });

    it('should get connected to ws and deliver a like to the target user then unlike', async function (this: any) {
        this.timeout(5000);

        const { userData: data1, token: token1 } = await quickUser(app);
        const { userData: data2, token: token2 } = await quickUser(app);

        const ws1 = await app.injectWS('/private/ws', { headers: { cookie: `jwt=${token1}` } });
        const ws2 = await app.injectWS('/private/ws', { headers: { cookie: `jwt=${token2}` } });

        const user2id = data2.id;
        const user1id = data1.id;

        let resolveMsg: (value: any) => void = () => {};
        const promise = new Promise<string>(r => { resolveMsg = r; });

        ws2.on('message', (data: Buffer) => {
            resolveMsg(data.toString());
        });

        const response = await app.inject({
            method: 'POST',
            url: `/private/user/like/${user2id}`,
            headers: {
                'Cookie': `jwt=${token1}`
            },
        });
        expect(response.statusCode).to.equal(201);

        const value = await promise;
        const object = JSON.parse(value);
        expect(object.type).to.equal('like');
        expect(object.data).to.be.an('object');
        expect(object.data.likerId).to.equal(user1id);

        let resolveMsg2: (value: any) => void = () => {};
        const promise2 = new Promise<string>(r => { resolveMsg2 = r; });

        ws2.on('message', (data: Buffer) => {
            resolveMsg2(data.toString());
        });

        const response2 = await app.inject({
            method: 'DELETE',
            url: `/private/user/like/${user2id}`,
            headers: {
                'Cookie': `jwt=${token2}`
            },
            body: {}
        });
        expect(response2.statusCode).to.equal(200);
        const value2 = await promise2;
        const object2 = JSON.parse(value2);
        expect(object2.type).to.equal('unlike');

        ws1.terminate();
        ws2.terminate();
    });

    it('should not be able to like their own profile', async function (this: any) {
        this.timeout(5000);

        const { userData, token } = await quickUser(app);

        const response = await app.inject({
            method: 'POST',
            url: `/private/user/like/${userData.id}`,
            headers: {
                'Cookie': `jwt=${token}`
            },
            body: {}
        });
        expect(response.statusCode).to.equal(400);
    });

    it('should not be able to like a profile twice', async function (this: any) {
        this.timeout(5000);

        const { userData: userAData, token: tokenA } = await quickUser(app);
        const { userData: userBData, token: tokenB } = await quickUser(app);

        const responseA = await app.inject({
            method: 'POST',
            url: `/private/user/like/${userBData.id}`,
            headers: {
                'Cookie': `jwt=${tokenA}`
            },
            body: {}
        });
        expect(responseA.statusCode).to.equal(201);
        const responseB = await app.inject({
            method: 'POST',
            url: `/private/user/like/${userBData.id}`,
            headers: {
                'Cookie': `jwt=${tokenA}`
            },
            body: {}
        });
        expect(responseB.statusCode).to.equal(403);
    });

    it('should send a like event when a user likes another user', async function (this: any) {
        this.timeout(5000);

       const { userData: user1Data, token: token1 } = await quickUser(app);
       const { userData: user2Data, token: token2 } = await quickUser(app);

        const ws1 = await app.injectWS('/private/ws', { headers: { cookie: `jwt=${token1}` } });
        const ws2 = await app.injectWS('/private/ws', { headers: { cookie: `jwt=${token2}` } });
        console.log('user1Data:', user1Data);
        console.log('user2Data:', user2Data);
        const meData1 = await app.userService.getUserPublic(undefined, user1Data.email);
        expect(meData1).to.be.an('object');
        const user1id = meData1.id;

        const meData2 = await app.userService.getUserPublic(undefined, user2Data.email);
        expect(meData2).to.be.an('object');
        const user2id = meData2.id;

        let resolveMsg: (value: any) => void = () => {};
        const promise = new Promise<string>(r => { resolveMsg = r; });

        ws1.on('message', (data: Buffer) => {
            resolveMsg(data.toString());
        });

        const response1 = await app.inject({
            method: 'POST',
            url: `/private/user/like/${user2id}`,
            headers: {
                'Cookie': `jwt=${token1}`
            },
            body: {}
        });
        expect(response1.statusCode).to.equal(201);

        const response2 = await app.inject({
            method: 'POST',
            url: `/private/user/like/${user1id}`,
            headers: {
                'Cookie': `jwt=${token2}`
            },
            body: {}
        });
        expect(response2.statusCode).to.equal(201);

        const value = await promise;
        const object = JSON.parse(value);
        expect(object.type).to.equal('like_back');
        expect(object.data).to.be.an('object');
        expect(object.data.id).to.be.a('number');

        ws1.terminate();
        ws2.terminate();
    });

    // TODO not validated or not pp user should not be able to like another user or be liked
});