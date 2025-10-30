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
            username: 'wsuser1',
            email: 'wsuser1@example.com',
            password: 'password123',
            bornAt: '2000-01-01',
            orientation: 'heterosexual',
            gender: 'men'
        };

        const token = await signUpAndGetToken(app, userData);
        expect(token).to.be.a('string');

        const ws = await app.injectWS('/api/ws/', {headers: { "Cookie" : `jwt=${token}` }})

        let resolve: (value: any) => void;
        const promise = new Promise(r => { resolve = r })

        ws.on('message', (data: string) => {
            resolve(data.toString());
        })
        ws.send('hi from client')
        expect(await promise).to.be.equal('hi from client');
        ws.terminate()
    });
});