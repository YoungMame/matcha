import chai from 'chai';
import { expect } from 'chai';
import { buildApp } from '../../../srcs/app';
import { FastifyInstance } from 'fastify';

// import fixtures
import { quickUser } from '../fixtures/auth.fixtures';

describe('Websocket like test', () => {
    let app: FastifyInstance;

    beforeEach(async () => {
        app = buildApp();
        await app.ready();
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
                'Cookie': `jwt=${token1}`
            },
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

    const sendLike = async (app: FastifyInstance, fromToken: string, toUserId: number) => {
        const response = await app.inject({
            method: 'POST',
            url: `/private/user/like/${toUserId}`,
            headers: {
                'Cookie': `jwt=${fromToken}`
            },
            body: {}
        });
        return response;
    }

    it('should be able to see who liked his profile', async function (this: any) {
        this.timeout(5000);

        const { userData: userAData, token: tokenA } = await quickUser(app);
        const { userData: userBData, token: tokenB } = await quickUser(app);
        const { userData: userCData, token: tokenC } = await quickUser(app);

        const responseCempty = await app.inject({
            method: 'GET',
            url: `/private/user/like/`,
            headers: {
                'Cookie': `jwt=${tokenC}`
            }
        });
        expect(responseCempty.statusCode).to.equal(200);
        const responseEmpty = JSON.parse(responseCempty.body);
        const emptyLikes = responseEmpty.likes;
        expect(emptyLikes).to.be.an('array');
        expect(emptyLikes.length).to.equal(0);

        const responseA = await sendLike(app, tokenA, userCData?.id as number);
        const responseB = await sendLike(app, tokenB, userCData?.id as number);

        const responseC = await app.inject({
            method: 'GET',
            url: `/private/user/like/`,
            headers: {
                'Cookie': `jwt=${tokenC}`
            }
        });
        expect(responseC.statusCode).to.equal(200);
        const responseData = JSON.parse(responseC.body);
        const likes = responseData.likes;
        expect(likes).to.be.an('array');
        const likerIds = likes.map((like: any) => like.likerId);
        expect(likerIds).to.include.members([userAData.id, userBData.id]);
    });

    it('should deliver a notification on like back and create a chat', async function (this: any) {
        this.timeout(5000);

        const { userData: userAData, token: tokenA } = await quickUser(app);
        const { userData: userBData, token: tokenB } = await quickUser(app);

        const ws1 = await app.injectWS('/private/ws', { headers: { cookie: `jwt=${tokenA}` } });
        const ws2 = await app.injectWS('/private/ws', { headers: { cookie: `jwt=${tokenB}` } });

        let resolveMsg: (value: any) => void = () => {};
        const promise = new Promise<string>(r => { resolveMsg = r; });

        ws1.on('message', (data: Buffer) => {
            const dataStr = data.toString();
            const rawObject = JSON.parse(dataStr);
            if (rawObject.type === 'like_back') {
                resolveMsg(data.toString());
            }
        });

        let resolveMsg2: (value: any) => void = () => {};
        const promise2 = new Promise<string>(r => { resolveMsg2 = r; });

        ws2.on('message', (data: Buffer) => {
            resolveMsg2(data.toString());
        });

        await sendLike(app, tokenA, userBData?.id as number);
        await sendLike(app, tokenB, userAData?.id as number);

        const value = await promise;
        const object = JSON.parse(value);
        const chatId = object.data.createdChatId;
        expect(object.type).to.equal('like_back');

        const value2 = await promise2;
        const object2 = JSON.parse(value2);
        expect(object2.type).to.equal('like');
        expect(object2.data.likerId).to.be.equal(userAData.id);

        const chat = await app.chatService.getChatBetweenUsers([userAData.id as number, userBData.id as number]);
        expect(chat).to.be.an('object');
        expect(chat.id).to.be.a('number').and.equal(chatId);
    });

    it('should not be able to like a user who blocked me', async function (this: any) {
        this.timeout(5000);

        const { userData: userAData, token: tokenA } = await quickUser(app);
        const { userData: userBData, token: tokenB } = await quickUser(app);

        const blockResponse = await app.inject({
            method: 'POST',
            url: `/private/user/block/${userAData.id}`,
            headers: {
                'Cookie': `jwt=${tokenB}`
            },
        });
        expect(blockResponse.statusCode).to.equal(201);

        const likeResponse1 = await sendLike(app, tokenB, userAData?.id as number);
        expect(likeResponse1.statusCode).to.equal(404);

        const getLikesResponse = await app.inject({
            method: 'GET',
            url: `/private/user/like/`,
            headers: {
                'Cookie': `jwt=${tokenB}`
            }
        });
        const getLikesData = JSON.parse(getLikesResponse.body);
        const likes = getLikesData.likes;
        const likerIds = likes.map((like: any) => like.likerId);
        expect(likerIds).to.not.include(userAData.id);
    });

    it('should not be able to like a user i blocked', async function (this: any) {
        this.timeout(5000);

        const { userData: userAData, token: tokenA } = await quickUser(app);
        const { userData: userBData, token: tokenB } = await quickUser(app);

        const blockResponse = await app.inject({
            method: 'POST',
            url: `/private/user/block/${userBData.id}`,
            headers: {
                'Cookie': `jwt=${tokenA}`
            },
        });
        expect(blockResponse.statusCode).to.equal(201);

        const likeResponse1 = await sendLike(app, tokenA, userBData?.id as number);
        expect(likeResponse1.statusCode).to.equal(404);

        const getLikesResponse = await app.inject({
            method: 'GET',
            url: `/private/user/like/`,
            headers: {
                'Cookie': `jwt=${tokenB}`
            }
        });
        const getLikesData = JSON.parse(getLikesResponse.body);
        const likes = getLikesData.likes;
        const likerIds = likes.map((like: any) => like.likerId);
        expect(likerIds).to.not.include(userAData.id);
    });
});