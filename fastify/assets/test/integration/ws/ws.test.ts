import chai from 'chai';
import { expect } from 'chai';
import { app } from '../../setup';
import { FastifyInstance } from 'fastify';

// import fixtures
import { signUpAndGetToken, UserData } from '../fixtures/auth.fixtures';

describe('Websocket connection main test', () => {

    it('should allow multiple ws clients to connect and be able to send', async function (this: any) {
        this.timeout(15000);

        const userA: UserData = {
            username: 'wstestmulti1',
            email: 'wstestmulti1@example.com',
            password: 'ghhgdhgdF123!',
            firstName: 'Test',
            lastName: 'User',
            bornAt: '2000-01-01',
            bio: 'This is a test user. lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
            tags: ['test', 'user', 'forty_two'],
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
            bio: 'This is a test user. lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
            tags: ['test', 'user', 'forty_two'],
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

        await new Promise((resolve) => setTimeout(resolve, 2000)); // wait for connections to be fully established

        const meDataResponse = await app.inject({
            method: 'GET',
            url: '/private/user/me/profile',
            headers: { 'Cookie': `jwt=${tokenA}` }
        });

        const meData = await meDataResponse.json();

        expect(meData.location.latitude).to.be.a('number');
        expect(meData.location.longitude).to.be.a('number');
        expect(meData.location.city).to.be.a('string');
        expect(meData.location.country).to.be.a('string');

        wsA.terminate();
        wsB.terminate();
    });
});
