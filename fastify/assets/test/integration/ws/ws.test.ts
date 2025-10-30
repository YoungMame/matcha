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

        const token = await signUpAndGetToken(app, userData);
        expect(token).to.be.a('string');

        const headers = { "cookie" : `jwt=${token}` };
        const ws = await app.injectWS('/private/ws', { headers });

        let resolve: (value: any) => void;
        const promise = new Promise(r => { resolve = r })

        ws.on('message', (data: string) => {
            resolve(data.toString());
        })
        ws.send(JSON.stringify({ content: 'hello server' }));
        // expect(await promise).to.be.equal('hi from server');
        ws.terminate()
    });
});