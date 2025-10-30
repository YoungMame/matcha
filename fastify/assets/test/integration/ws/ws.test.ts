import chai from 'chai';
const expect = chai.expect;
import { buildApp } from '../../../srcs/app';
import { FastifyInstance } from 'fastify';

// import fixtures
import { signUpAndGetToken, UserData } from '../fixtures/auth.fixtures';

describe('Websocket connection main test', () => {
    let app: FastifyInstance;

    beforeEach(async () => {
        app = buildApp();
        await app.ready();
    });
    
    afterEach(async () => {
        await app.close();
    });

    it('should get connected to ws', async () => {
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

        const ws1 = await app.injectWS('/private/ws', { headers: { "cookie" : `jwt=${token1}` } });
        const ws2 = await app.injectWS('/private/ws', { headers: { "cookie" : `jwt=${token2}` } });

        let resolve: (value: any) => void;
        const promise = new Promise(r => { resolve = r })

        setTimeout(() => {
            resolve("TIMEOUT");
        }, 10000);

        ws2.on('message', (data: string) => {
            resolve(data.toString());
        })

        ws1.send(JSON.stringify({ content: 'hello user2' }));

        const value = await promise;
        const object = JSON.parse(value as string);
        expect(object.type).to.be.equal('message');
        expect(object.targetId).to.be.a('number');
        expect(object.content).to.be.equal('hello user2');
        ws1.terminate();
        ws2.terminate();
    });
});