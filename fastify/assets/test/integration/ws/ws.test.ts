import chai from 'chai';
import { expect } from 'chai';
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

    it('should allow multiple ws clients to connect and be able to send', async function (this: any) {
        this.timeout(5000);

        const userA: UserData = {
            username: 'wstestmulti1',
            email: 'wstestmulti1@example.com',
            password: 'ghhgdhgdF123!',
            firstName: 'Test',
            lastName: 'User',
            bornAt: '2000-01-01',
            bio: 'Nice user bio',
            tags: ['test', 'user'],
            orientation: 'heterosexual',
            gender: 'men'
        };
        const userB: UserData = {
            username: 'wstestmulti2',
            email: 'wstestmulti2@example.com',
            password: 'ghhgdhgdF123!',
            firstName: 'Test',
            lastName: 'User',
            bornAt: '2000-01-01',
            bio: 'Nice user bio',
            tags: ['test', 'user'],
            orientation: 'heterosexual',
            gender: 'men'
        };

        const tokenA = await signUpAndGetToken(app, userA);
        const tokenB = await signUpAndGetToken(app, userB);
        expect(tokenA).to.be.a('string');
        expect(tokenB).to.be.a('string');

        const wsA = await app.injectWS('/private/ws', { headers: { cookie: `jwt=${tokenA}` } });
        const wsB = await app.injectWS('/private/ws', { headers: { cookie: `jwt=${tokenB}` } });

        expect(wsA).to.be.ok;
        expect(wsB).to.be.ok;

        it('Should give user geolocation on connect', async function () {
            this.timeout(5000);

            const meDataResponse = await app.inject({
                method: 'GET',
                url: '/private/me',
                headers: { cookie: `jwt=${tokenA}` }
            });

            const meDataJson = await meDataResponse.json();
            const meData = meDataJson.data;

            expect(meData.location.latitude).to.be.a('number');
            expect(meData.location.longitude).to.be.a('number');
            expect(meData.location.city).to.be.a('string');
            expect(meData.location.country).to.be.a('string');
        });

        wsA.terminate();
        wsB.terminate();
    });
});
