import chai from 'chai';
const expect = chai.expect;
import { buildApp } from '../../../srcs/app';
import { FastifyInstance } from 'fastify';

// import fixtures
import { signUpAndGetToken, quickUser, UserData } from '../fixtures/auth.fixtures';

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

        const { userData: data1, token: token1 } = await quickUser(app);
        const { userData: data2, token: token2 } = await quickUser(app);

        const ws1 = await app.injectWS('/private/ws', { headers: { cookie: `jwt=${token1}` } });
        const ws2 = await app.injectWS('/private/ws', { headers: { cookie: `jwt=${token2}` } });

        let resolveMsg: (value: any) => void = () => {};
        const promise = new Promise<string>(r => { resolveMsg = r; });

        ws2.on('message', (data: Buffer) => {
            resolveMsg(data.toString());
        });

        const response = await app.inject({
            method: 'GET',
            url: `/private/user/view/${data2.id}`,
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
        expect(object.data.viewerId).to.equal(data1.id);

        let resolveMsg2: (value: any) => void = () => {};
        const promise2 = new Promise<string>(r => { resolveMsg2 = r; });

        ws1.on('message', (data: Buffer) => {
            resolveMsg2(data.toString());
        });

        const response2 = await app.inject({
            method: 'GET',
            url: `/private/user/view/${data1.id}`,
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
        expect(object2.data.viewerId).to.equal(data2.id);

        ws1.terminate();
        ws2.terminate();
    });

    it('Should not notify user twice', async function (this: any) {
        this.timeout(5000);

        const { userData: data1, token: token1 } = await quickUser(app);
        const { userData: data2, token: token2 } = await quickUser(app);

        const ws1 = await app.injectWS('/private/ws', { headers: { cookie: `jwt=${token1}` } });
        const ws2 = await app.injectWS('/private/ws', { headers: { cookie: `jwt=${token2}` } });

        let resolveMsg: (value: any) => void = () => {};
        const promise = new Promise<string>(r => { resolveMsg = r; });

        ws2.on('message', (data: Buffer) => {
            resolveMsg(data.toString());
        });

        const response = await app.inject({
            method: 'GET',
            url: `/private/user/view/${data2.id}`,
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
        expect(object.data.viewerId).to.equal(data1.id);

        let resolveMsg2: (value: any) => void = () => {};
        let resolveMsg3: (value: any) => void = () => {};
        const promise2 = new Promise<string>(r => { resolveMsg2 = r; });
        const promise3 = new Promise<boolean>(r => { resolveMsg3 = r; });
        let isFirstNotificationDelivered = true;
        ws1.on('message', (data: Buffer) => {
            if (!isFirstNotificationDelivered)
                resolveMsg2(data.toString());
            else
                resolveMsg3(false);
        });

        setTimeout(() => {
            resolveMsg3(true);
        }, 4000);

        const response2 = await app.inject({
            method: 'GET',
            url: `/private/user/view/${data1.id}`,
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
        expect(object2.data.viewerId).to.equal(data2.id);

        await app.inject({
            method: 'GET',
            url: `/private/user/view/${data1.id}`,
            headers: {
                'Cookie': `jwt=${token2}`
            },
        });
        const value3 = await promise3;
        expect(value3).to.equal(true); // if no second notification is delivered, the promise resolves to true

        ws1.terminate();
        ws2.terminate();
    });
});