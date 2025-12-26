import chai from 'chai';
import { expect } from 'chai';
import { app } from '../../setup';
import { FastifyInstance } from 'fastify';

// import fixtures
import { quickUser } from '../fixtures/auth.fixtures';

// import utils
import { wait } from '../utils/wait';

describe('Websocket view test', () => {
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
        let isFirstNotificationDelivered = false;
        ws1.on('message', (data: Buffer) => {
            if (!isFirstNotificationDelivered)
                resolveMsg2(data.toString());
            else
                resolveMsg3(false);
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

        await app.inject({
            method: 'GET',
            url: `/private/user/view/${data1.id}`,
            headers: {
                'Cookie': `jwt=${token2}`
            },
        });

        const timer = setTimeout(() => {
            resolveMsg3(true);
        }, 2000);

        const value3 = await promise3;
        expect(value3).to.equal(true); // if no second notification is delivered, the promise resolves to true

        clearTimeout(timer);

        ws1.terminate();
        ws2.terminate();
    });

    it('Should not see someone i blocked or who blocked me', async function (this: any) {
        this.timeout(5000);

        const { userData: data1, token: token1 } = await quickUser(app);
        const { userData: data2, token: token2 } = await quickUser(app);

        const blockResponse = await app.inject({
            method: 'POST',
            url: `/private/user/block/${data2.id}`,
            headers: {
                'Cookie': `jwt=${token1}`
            }
        });
        expect(blockResponse.statusCode).to.equal(201);

        const response = await app.inject({
            method: 'GET',
            url: `/private/user/view/${data2.id}`,
            headers: {
                'Cookie': `jwt=${token1}`
            },
            body: {}
        });
        expect(response.statusCode).to.equal(404);

        const response2 = await app.inject({
            method: 'GET',
            url: `/private/user/view/${data1.id}`,
            headers: {
                'Cookie': `jwt=${token2}`
            },
            body: {}
        });
        expect(response2.statusCode).to.equal(404);

        const unblockResponse = await app.inject({
            method: 'DELETE',
            url: `/private/user/block/${data2.id}`,
            headers: {
                'Cookie': `jwt=${token1}`
            },
        });
        expect(unblockResponse.statusCode).to.equal(200);

        const response3 = await app.inject({
            method: 'GET',
            url: `/private/user/view/${data2.id}`,
            headers: {
                'Cookie': `jwt=${token1}`
            },
        });
        expect(response3.statusCode).to.equal(200);

        const response4 = await app.inject({
            method: 'GET',
            url: `/private/user/view/${data1.id}`,
            headers: {
                'Cookie': `jwt=${token2}`
            },
        });
        expect(response4.statusCode).to.equal(200);
    });

    it('Should be able to see social infos with the user', async function (this: any) {
        this.timeout(5000);

        const { userData: data1, token: token1 } = await quickUser(app);
        const { userData: data2, token: token2 } = await quickUser(app);

        const response = await app.inject({
            method: 'GET',
            url: `/private/user/view/${data2.id}`,
            headers: {
                'Cookie': `jwt=${token1}`
            },
        });

        expect(response.statusCode).to.equal(200);
        const body = response.json();
        expect(body).to.have.property('isConnectedWithMe').that.equals(false);
        expect(body).to.not.have.property('chatIdWithMe');
        expect(body).to.have.property('haveILiked').that.equals(false);
        expect(body).to.have.property('hasLikedMe').that.equals(false);

        const likeResponse = await app.inject({
            method: 'POST',
            url: `/private/user/like/${data2.id}`,
            headers: {
                'Cookie': `jwt=${token1}`
            }
        });
        expect(likeResponse.statusCode).to.equal(201);

        const response2 = await app.inject({
            method: 'GET',
            url: `/private/user/view/${data2.id}`,
            headers: {
                'Cookie': `jwt=${token1}`
            },
        });
        expect(response2.statusCode).to.equal(200);
        const body2 = response2.json();
        expect(body2).to.have.property('isConnectedWithMe').that.equals(false);
        expect(body2).to.not.have.property('chatIdWithMe');
        expect(body2).to.have.property('haveILiked').that.equals(true);
        expect(body2).to.have.property('hasLikedMe').that.equals(false);

        const likeResponse2 = await app.inject({
            method: 'POST',
            url: `/private/user/like/${data1.id}`,
            headers: {
                'Cookie': `jwt=${token2}`
            }
        });
        expect(likeResponse2.statusCode).to.equal(201);

        await wait(300);

        const response3 = await app.inject({
            method: 'GET',
            url: `/private/user/view/${data2.id}`,
            headers: {
                'Cookie': `jwt=${token1}`
            },
        });
        expect(response3.statusCode).to.equal(200);
        const body3 = response3.json();
        expect(body3).to.have.property('isConnectedWithMe').that.equals(true);
        expect(body3).to.have.property('chatIdWithMe').that.is.a('number');
        expect(body3).to.have.property('haveILiked').that.equals(true);
        expect(body3).to.have.property('hasLikedMe').that.equals(true);
    });
});