import chai from 'chai';
const expect = chai.expect;
import { buildApp } from '../../../srcs/app';
import { FastifyInstance } from 'fastify';

// import fixtures
import { signUpAndGetToken, UserData } from '../fixtures/auth.fixtures';

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

        const userData: UserData = {
            username: 'wslikestestuser1',
            email: 'wslikestestuser1@example.com',
            password: 'ghhgdhgdF123!',
            bornAt: '2000-01-01',
            orientation: 'heterosexual',
            gender: 'men'
        };

        const token1 = await signUpAndGetToken(app, userData);
        expect(token1).to.be.a('string');

        const userData2: UserData = {
            username: 'wslikestestuser2',
            email: 'wslikestestuser2@example.com',
            password: 'ghhgdhgdF123!',
            bornAt: '2000-01-01',
            orientation: 'heterosexual',
            gender: 'men'
        };

        const token2 = await signUpAndGetToken(app, userData2);
        expect(token2).to.be.a('string');

        const ws1 = await app.injectWS('/private/ws', { headers: { cookie: `jwt=${token1}` } });
        const ws2 = await app.injectWS('/private/ws', { headers: { cookie: `jwt=${token2}` } });

        const meData2 = await app.userService.getUserPublic('wslikestestuser2@example.com');
        expect(meData2).to.be.an('object');
        const user2id = meData2.id;

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
            body: {}
        });
        expect(response.statusCode).to.equal(201);

        const value = await promise;
        const object = JSON.parse(value);
        expect(object.type).to.equal('like');
        expect(object.data).to.be.an('object');
        expect(object.data.likerId).to.equal(user2id - 1);

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

        const userData: UserData = {
            username: 'wslikestestuser11',
            email: 'wslikestestuser11@example.com',
            password: 'ghhgdhgdF123!',
            bornAt: '2000-01-01',
            orientation: 'heterosexual',
            gender: 'men'
        };

        const token = await signUpAndGetToken(app, userData);
        expect(token).to.be.a('string');

        const meData = await app.userService.getUserPublic('wslikestestuser11@example.com');
        expect(meData).to.be.an('object');
        const userId = meData.id;

        const response = await app.inject({
            method: 'POST',
            url: `/private/user/like/${userId}`,
            headers: {
                'Cookie': `jwt=${token}`
            },
            body: {}
        });
        expect(response.statusCode).to.equal(400);
    });

    it('should not be able to like a profile twice', async function (this: any) {
        this.timeout(5000);

        const userDataA: UserData = {
            username: 'wslikestestuser21',
            email: 'wslikestestuser21@example.com',
            password: 'ghhgdhgdF123!',
            bornAt: '2000-01-01',
            orientation: 'heterosexual',
            gender: 'men'
        };

        const userDataB: UserData = {
            username: 'wslikestestuser22',
            email: 'wslikestestuser22@example.com',
            password: 'ghhgdhgdF123!',
            bornAt: '2000-01-01',
            orientation: 'heterosexual',
            gender: 'men'
        };


        const tokenA = await signUpAndGetToken(app, userDataA);
        expect(tokenA).to.be.a('string');

        const meDataA = await app.userService.getUserPublic('wslikestestuser21@example.com');
        expect(meDataA).to.be.an('object');

        const tokenB = await signUpAndGetToken(app, userDataB);
        expect(tokenB).to.be.a('string');

        const meDataB = await app.userService.getUserPublic('wslikestestuser22@example.com');
        expect(meDataB).to.be.an('object');
        const userId = meDataB.id;

        const responseA = await app.inject({
            method: 'POST',
            url: `/private/user/like/${userId}`,
            headers: {
                'Cookie': `jwt=${tokenA}`
            },
            body: {}
        });
        expect(responseA.statusCode).to.equal(201);
        const responseB = await app.inject({
            method: 'POST',
            url: `/private/user/like/${userId}`,
            headers: {
                'Cookie': `jwt=${tokenA}`
            },
            body: {}
        });
        expect(responseB.statusCode).to.equal(403);
    });

    it('should send a like event when a user likes another user', async function (this: any) {
        this.timeout(5000);

        const userData: UserData = {
            username: 'wslikestestuser41',
            email: 'wslikestestuser41@example.com',
            password: 'ghhgdhgdF123!',
            bornAt: '2000-01-01',
            orientation: 'heterosexual',
            gender: 'men'
        };

        const token1 = await signUpAndGetToken(app, userData);
        expect(token1).to.be.a('string');

        const userData2: UserData = {
            username: 'wslikestestuser42',
            email: 'wslikestestuser42@example.com',
            password: 'ghhgdhgdF123!',
            bornAt: '2000-01-01',
            orientation: 'heterosexual',
            gender: 'men'
        };

        const token2 = await signUpAndGetToken(app, userData2);
        expect(token2).to.be.a('string');

        const ws1 = await app.injectWS('/private/ws', { headers: { cookie: `jwt=${token1}` } });
        const ws2 = await app.injectWS('/private/ws', { headers: { cookie: `jwt=${token2}` } });

        const meData1 = await app.userService.getUserPublic('wslikestestuser41@example.com');
        expect(meData1).to.be.an('object');
        const user1id = meData1.id;

        const meData2 = await app.userService.getUserPublic('wslikestestuser42@example.com');
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
        
        // TODO uncomment
        // const createdChatId = object.data.createdChatId;
        // const chatExists = await app.chatModel.getChatById(createdChatId);
        // expect(chatExists).to.be.an('object');
        // expect(chatExists.members).to.include.members([user1id, user2id]);

        ws1.terminate();
        ws2.terminate();
    });

    // TODO not validated or not pp user should not be able to like another user or be liked
});