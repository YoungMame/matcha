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
    
    

    // TODO adapt this test to the real chat system
    // it('should get connected to ws and deliver a message to the target user', async function (this: any) {
    //     this.timeout(5000);

    //     const userData: UserData = {
    //         username: 'wstestuser1',
    //         email: 'wstestuser1@example.com',
    //         password: 'ghhgdhgdF123!',
    //         bornAt: '2000-01-01',
    //         orientation: 'heterosexual',
    //         gender: 'men'
    //     };

    //     const token1 = await signUpAndGetToken(app, userData);
    //     expect(token1).to.be.a('string');

    //     const userData2: UserData = {
    //         username: 'wstestuser2',
    //         email: 'wstestuser2@example.com',
    //         password: 'ghhgdhgdF123!',
    //         bornAt: '2000-01-01',
    //         orientation: 'heterosexual',
    //         gender: 'men'
    //     };

    //     const token2 = await signUpAndGetToken(app, userData2);
    //     expect(token2).to.be.a('string');

    //     const ws1 = await app.injectWS('/private/ws', { headers: { cookie: `jwt=${token1}` } });
    //     const ws2 = await app.injectWS('/private/ws', { headers: { cookie: `jwt=${token2}` } });

    //     const meData2 = await app.userService.getUserPublic(undefined, 'wstestuser2@example.com');
    //     expect(meData2).to.be.an('object');
    //     const user2id = meData2.id;

    //     let resolveMsg: (value: any) => void = () => {};
    //     const promise = new Promise<string>(r => { resolveMsg = r; });

    //     ws2.on('message', (data: Buffer) => {
    //         resolveMsg(data.toString());
    //     });

    //     ws1.send(JSON.stringify({ type: 'message', targetId: user2id, content: 'hello user2' }));

    //     const value = await promise;
    //     const object = JSON.parse(value);
    //     expect(object.type).to.equal('message');
    //     expect(object.data).to.be.an('object');
    //     expect(object.data.content).to.equal('hello user2');

    //     ws1.terminate();
    //     ws2.terminate();
    // });

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

        wsA.terminate();
        wsB.terminate();
    });

    // TODO adapt this test to the real chat system
    // it('should deliver multiple messages in the same order they were sent', async function (this: any) {
    //     this.timeout(5000);

    //     const user1: UserData = {
    //         username: 'wstestorder1',
    //         email: 'wstestorder1@example.com',
    //         password: 'ghhgdhgdF123!',
    //         bornAt: '2000-01-01',
    //         orientation: 'heterosexual',
    //         gender: 'men'
    //     };
    //     const user2: UserData = {
    //         username: 'wstestorder2',
    //         email: 'wstestorder2@example.com',
    //         password: 'ghhgdhgdF123!',
    //         bornAt: '2000-01-01',
    //         orientation: 'heterosexual',
    //         gender: 'men'
    //     };

    //     const token1 = await signUpAndGetToken(app, user1);
    //     const token2 = await signUpAndGetToken(app, user2);
    //     expect(token1).to.be.a('string');
    //     expect(token2).to.be.a('string');

    //     const ws1 = await app.injectWS('/private/ws', { headers: { cookie: `jwt=${token1}` } });
    //     const ws2 = await app.injectWS('/private/ws', { headers: { cookie: `jwt=${token2}` } });

    //     const messages = ['first', 'second', 'third'];
    //     const received: string[] = [];

    //     let resolveAll: (value: string[]) => void = () => {};
    //     const allReceived = new Promise<string[]>(r => { resolveAll = r; });

    //     ws2.on('message', (data: Buffer) => {
    //         const parsed = JSON.parse(data.toString());
    //         if (parsed && parsed.data && typeof parsed.data.content === 'string') {
    //             received.push(parsed.data.content);
    //             if (received.length === messages.length) resolveAll(received);
    //         }
    //     });

    //     const meData2 = await app.userService.getUserPublic(undefined, 'wstestorder2@example.com');
    //     const user2id = meData2.id;

    //     for (const message of messages) {
    //         ws1.send(JSON.stringify({ type: 'message', targetId: user2id, content: message }));
    //     }

    //     const result = await allReceived;
    //     expect(result).to.deep.equal(messages);

    //     ws1.terminate();
    //     ws2.terminate();
    // });
});
