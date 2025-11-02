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

    it('should get connected to ws and deliver a message to the target user', async function (this: any) {
        this.timeout(5000);

        const userData: UserData = {
            username: 'wstestuser1',
            email: 'wstestuser1@example.com',
            password: 'ghhgdhgdF123!',
            bornAt: '2000-01-01',
            orientation: 'heterosexual',
            gender: 'men'
        };

        const token1 = await signUpAndGetToken(app, userData);
        expect(token1).to.be.a('string');

        const userData2: UserData = {
            username: 'wstestuser2',
            email: 'wstestuser2@example.com',
            password: 'ghhgdhgdF123!',
            bornAt: '2000-01-01',
            orientation: 'heterosexual',
            gender: 'men'
        };

        const token2 = await signUpAndGetToken(app, userData2);
        expect(token2).to.be.a('string');

        const ws1 = await app.injectWS('/private/ws', { headers: { cookie: `jwt=${token1}` } });
        const ws2 = await app.injectWS('/private/ws', { headers: { cookie: `jwt=${token2}` } });

        const meData2 = await app.userService.getUserPublic('wstestuser2@example.com');
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
        expect(response.statusCode).to.equal(200);

        const value = await promise;
        const object = JSON.parse(value);
        expect(object.type).to.equal('like');
        expect(object.data).to.be.an('object');
        expect(object.data.likerId).to.be.a('number');

        ws1.terminate();
        ws2.terminate();
    });
});