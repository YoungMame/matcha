import chai from 'chai';
const expect = chai.expect;
import { buildApp } from '../../../srcs/app';
import { FastifyInstance } from 'fastify';

// import fixtures
import { quickUser } from '../fixtures/auth.fixtures';

describe('Websocket chat event test', () => {
    let app: FastifyInstance;

    beforeEach(async () => {
        app = buildApp();
        await app.ready();
    });
    
    afterEach(async () => {
        await app.close();
    });

    it('should get connected to ws and create an event and send it to the users', async function (this: any) {
        this.timeout(5000);

        const { userData: data1, token: token1 } = await quickUser(app);
        const { userData: data2, token: token2 } = await quickUser(app);
        const { userData: data3, token: token3 } = await quickUser(app);


        const ws1 = await app.injectWS('/private/ws', { headers: { cookie: `jwt=${token1}` } });
        const ws2 = await app.injectWS('/private/ws', { headers: { cookie: `jwt=${token2}` } });

        const user3id = data3.id as number;
        const user2id = data2.id as number;
        const user1id = data1.id as number;

        let resolveMsg: (value: any) => void = () => {};
        const promise = new Promise<string>(r => { resolveMsg = r; });

        let resolveMsg2: (value: any) => void = () => {};
        const promise2 = new Promise<string>(r => { resolveMsg2 = r; });

        ws2.on('message', (data: Buffer) => {
            resolveMsg(data.toString());
        });

        ws1.on('message', (data: Buffer) => {
            resolveMsg2(data.toString());
        });

        const chatId = await app.chatService.createChat([user1id, user2id, user3id]);

        const response = await app.inject({
            method: 'POST',
            url: `/private/chat/event`,
            headers: {
                'Cookie': `jwt=${token3}`
            },
            body: {
                chatId: chatId,
                title: 'Test Event',
                latitude: 40.7128,
                longitude: -74.0060,
                date: new Date(Date.now() + 3600000).toISOString(),
            }
        });
        expect(response.statusCode).to.equal(201);

        const value = await promise;
        const object = JSON.parse(value);

        const value2 = await promise2;
        const object2 = JSON.parse(value2);

        expect(object.type).to.equal('chat_event');
        expect(object.data).to.be.an('object');
        expect(object.data.chatId).to.equal(chatId);
        expect(object2.type).to.equal('chat_event');
        expect(object2.data).to.be.an('object');
        expect(object2.data.chatId).to.equal(chatId);

        ws1.terminate();
        ws2.terminate();
    });

    it("should not be able to create 2 events on the same chat", async () => {
        const { userData: data1, token: token1 } = await quickUser(app);
        const { userData: data2, token: token2 } = await quickUser(app);
        const { userData: data3, token: token3 } = await quickUser(app);
        
        const user3id = data3.id as number;
        const user2id = data2.id as number;
        const user1id = data1.id as number;

        const chatId = await app.chatService.createChat([user1id, user2id, user3id]);

        const response1 = await app.inject({
            method: 'POST',
            url: `/private/chat/event`,
            headers: {
                'Cookie': `jwt=${token3}`
            },
            body: {
                chatId: chatId,
                title: 'Test Event',
                latitude: 40.7128,
                longitude: -74.0060,
                date: new Date(Date.now() + 3600000).toISOString(),
            }
        });
        expect(response1.statusCode).to.equal(201);

        const response2 = await app.inject({
            method: 'POST',
            url: `/private/chat/event`,
            headers: {
                'Cookie': `jwt=${token3}`
            },
            body: {
                chatId: chatId,
                title: 'Test Event 2',
                latitude: 40.7128,
                longitude: -74.0060,
                date: new Date(Date.now() + 3600000).toISOString(),
            }
        });
        expect(response2.statusCode).to.equal(409);
    });

    it("should not be able to create an event if not in the chat", async () => {
        const { userData: data1, token: token1 } = await quickUser(app);
        const { userData: data2, token: token2 } = await quickUser(app);
        const { userData: data3, token: token3 } = await quickUser(app);
        
        const user2id = data2.id as number;
        const user1id = data1.id as number;

        const chatId = await app.chatService.createChat([user1id, user2id]);
        
        const response = await app.inject({
            method: 'POST',
            url: `/private/chat/event`,
            headers: {
                'Cookie': `jwt=${token3}`
            },
            body: {
                chatId: chatId,
                title: 'Test Event',
                latitude: 40.7128,
                longitude: -74.0060,
                date: new Date(Date.now() + 3600000).toISOString(),
            }
        });
        expect(response.statusCode).to.equal(404);
    });

    it("should not be able to create an event if the date is passed", async () => {
        const { userData: data1, token: token1 } = await quickUser(app);
        const { userData: data2, token: token2 } = await quickUser(app);
        const user2id = data2.id as number;
        const user1id = data1.id as number;

        const chatId = await app.chatService.createChat([user1id, user2id]);
        
        const response = await app.inject({
            method: 'POST',
            url: `/private/chat/event`,
            headers: {
                'Cookie': `jwt=${token2}`
            },
            body: {
                chatId: chatId,
                title: 'Test Event',
                latitude: 40.7128,
                longitude: -74.0060,
                date: new Date(Date.now() - 3600000).toISOString(),
            }
        });
        expect(response.statusCode).to.equal(400);
    });

    it("should be able to get delete the event if in the chat", async () => {
        const { userData: data1, token: token1 } = await quickUser(app);
        const { userData: data2, token: token2 } = await quickUser(app);
        const { userData: data3, token: token3 } = await quickUser(app);
        
        const user2id = data2.id as number;
        const user1id = data1.id as number;

        const chatId = await app.chatService.createChat([user1id, user2id]);
        
        // Create event
        const response = await app.inject({
            method: 'POST',
            url: `/private/chat/event`,
            headers: {
                'Cookie': `jwt=${token2}`
            },
            body: {
                chatId: chatId,
                title: 'Test Event',
                latitude: 40.7128,
                longitude: -74.0060,
                date: new Date(Date.now() + 3600000).toISOString(),
            }
        });
        expect(response.statusCode).to.equal(201);

        const nInChatResponse = await app.inject({
            method: 'DELETE',
            url: `/private/chat/event/${chatId}`,
            headers: {
                'Cookie': `jwt=${token3}`
            }
        });
        expect(nInChatResponse.statusCode).to.equal(404);
        const existingEvent = await app.chatService.getChat(undefined, chatId);
        expect(existingEvent.event).to.be.an('object');

        const deleteResponse = await app.inject({
            method: 'DELETE',
            url: `/private/chat/event/${chatId}`,
            headers: {
                'Cookie': `jwt=${token2}`
            }
        });
        expect(deleteResponse.statusCode).to.equal(200);
        // await expect(app.chatService.getChat(undefined, chatId)).to.throw(NotFoundError);
    });
});