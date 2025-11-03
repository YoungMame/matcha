import chai from 'chai';
const expect = chai.expect;
import { buildApp } from '../../../srcs/app';
import { FastifyInstance } from 'fastify';

// import fixtures
import { signUpAndGetToken, UserData } from '../fixtures/auth.fixtures';

describe('Websocket view test', () => {
    let app: FastifyInstance;

    beforeEach(async () => {
        app = buildApp();
        await app.ready();
    });
    
    afterEach(async () => {
        await app.close();
    });

    it('should get connected to ws and deliver a view to the target user', async function (this: any) {
        this.timeout(5000);

        const userData: UserData = {
            username: 'wsviewstestuser1',
            email: 'wsviewstestuser1@example.com',
            password: 'ghhgdhgdF123!',
            bornAt: '2000-01-01',
            orientation: 'heterosexual',
            gender: 'men'
        };

        const token1 = await signUpAndGetToken(app, userData);
        expect(token1).to.be.a('string');

        const userData2: UserData = {
            username: 'wsviewstestuser2',
            email: 'wsviewstestuser2@example.com',
            password: 'ghhgdhgdF123!',
            bornAt: '2000-01-01',
            orientation: 'heterosexual',
            gender: 'men'
        };

        const token2 = await signUpAndGetToken(app, userData2);
        expect(token2).to.be.a('string');

        const ws1 = await app.injectWS('/private/ws', { headers: { cookie: `jwt=${token1}` } });
        const ws2 = await app.injectWS('/private/ws', { headers: { cookie: `jwt=${token2}` } });

        const meData2 = await app.userService.getUserPublic(undefined, 'wsviewstestuser2@example.com');
        expect(meData2).to.be.an('object');
        const user2id = meData2.id;

        const meData1 = await app.userService.getUserPublic(undefined, 'wsviewstestuser1@example.com');
        expect(meData1).to.be.an('object');
        const user1id = meData1.id;

        let resolveMsg: (value: any) => void = () => {};
        const promise = new Promise<string>(r => { resolveMsg = r; });

        ws2.on('message', (data: Buffer) => {
            resolveMsg(data.toString());
        });

        const response = await app.inject({
            method: 'GET',
            url: `/private/user/view/${user2id}`,
            headers: {
                'Cookie': `jwt=${token1}`
            },
            body: {}
        });
        expect(response.statusCode).to.equal(200);
        expect(response.json()).to.be.an('object');

        const value = await promise;
        const object = JSON.parse(value);
        expect(object.type).to.equal('view');
        expect(object.data).to.be.an('object');
        expect(object.data.viewerId).to.equal(user2id - 1);

        let resolveMsg2: (value: any) => void = () => {};
        const promise2 = new Promise<string>(r => { resolveMsg2 = r; });

        ws1.on('message', (data: Buffer) => {
            resolveMsg2(data.toString());
        });

        const response2 = await app.inject({
            method: 'GET',
            url: `/private/user/view/${user1id}`,
            headers: {
                'Cookie': `jwt=${token2}`
            },
            body: {}
        });
        expect(response2.statusCode).to.equal(200);
        const value2 = await promise2;
        const object2 = JSON.parse(value2);
        expect(object2.type).to.equal('view');
        expect(object2.data).to.be.an('object');
        expect(object2.data.viewerId).to.equal(user2id);

        ws1.terminate();
        ws2.terminate();
    });
});