import chai from 'chai';
import { expect } from 'chai';
import { buildApp } from '../../../srcs/app';
import { FastifyInstance } from 'fastify';

// import fixtures
import { quickUser } from '../fixtures/auth.fixtures';

describe('Chat test', () => {
    let app: FastifyInstance;

    beforeEach(async () => {
        app = buildApp();
        await app.ready();
    });
    
    

    it('should not get connected if not in chat', async function (this: any) {
        this.timeout(5000);

        const { userData: data1, token: token1 } = await quickUser(app);
        const { userData: data2, token: token2 } = await quickUser(app);
        const { userData: data3, token: token3 } = await quickUser(app);

        const ws1 = await app.injectWS('/private/ws', { headers: { cookie: `jwt=${token1}` } });
        const ws2 = await app.injectWS('/private/ws', { headers: { cookie: `jwt=${token2}` } });
        const ws3 = await app.injectWS('/private/ws', { headers: { cookie: `jwt=${token3}` } });

        const user1id = data1.id as number;
        const user2id = data2.id as number;

        let resolveMsg: (value: any) => void = () => {};
        const promise = new Promise<string>(r => { resolveMsg = r; });

        let resolveMsg2: (value: boolean) => void = () => {};
        const promise2 = new Promise<boolean>(r => { resolveMsg2 = r; });
        let isFirstMsg = true;
        ws2.on('message', (data: Buffer) => {
            if (isFirstMsg) {
                resolveMsg(data.toString());
                isFirstMsg = false;
                return;
            }
            resolveMsg2(false);
        });

        const tmOut = setTimeout(() => {
            resolveMsg2(true);
        }, 2000);

        const chatId = await app.chatService.createChat([user1id, user2id]);

        ws1.send(JSON.stringify({
            type: 'message',
            targetId: chatId,
            content: 'Hello'
        }));

        ws3.send(JSON.stringify({
            type: 'message',
            targetId: chatId,
            content: '!!!'
        }));

        const value = await promise;
        const object = JSON.parse(value);

        const value2 = await promise2;
        clearTimeout(tmOut);
        expect(value2).to.equal(true);
        expect(object.type).to.equal('message');
        expect(object.data).to.be.an('object');
        expect(object.data.content).to.equal('Hello');

        ws1.terminate();
        ws2.terminate();
    });

    it('should be able to send and receive messages', async function (this: any) {
        this.timeout(5000);

        const { userData: data1, token: token1 } = await quickUser(app);
        const { userData: data2, token: token2 } = await quickUser(app);

        const ws1 = await app.injectWS('/private/ws', { headers: { cookie: `jwt=${token1}` } });
        const ws2 = await app.injectWS('/private/ws', { headers: { cookie: `jwt=${token2}` } });

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
    
        const chatId = await app.chatService.createChat([user1id, user2id]);

        ws1.send(JSON.stringify({
            type: 'message',
            targetId: chatId,
            content: 'Hello'
        }));

        ws2.send(JSON.stringify({
            type: 'message',
            targetId: chatId,
            content: 'World'
        }));

        const value = await promise;
        const object = JSON.parse(value);

        const value2 = await promise2;
        const object2 = JSON.parse(value2);

        expect(object.type).to.equal('message');
        expect(object.data).to.be.an('object');
        expect(object.data.content).to.equal('Hello');
        expect(object2.type).to.equal('message');
        expect(object2.data).to.be.an('object');
        expect(object2.data.content).to.equal('World');

        ws1.terminate();
        ws2.terminate();
    });

    it('should not send message to someone who disliked', async function (this: any) {
        this.timeout(5000);

        const { userData: data1, token: token1 } = await quickUser(app);
        const { userData: data2, token: token2 } = await quickUser(app);


        const ws1 = await app.injectWS('/private/ws', { headers: { cookie: `jwt=${token1}` } });
        const ws2 = await app.injectWS('/private/ws', { headers: { cookie: `jwt=${token2}` } });

        const user2id = data2.id as number;
        const user1id = data1.id as number;

        let resolveMsg: (value: boolean) => void = () => {};
        const promise = new Promise<boolean>(r => { resolveMsg = r; });

        ws2.on('message', (data: Buffer) => {
            const object = JSON.parse(data.toString());
            if (object.type === 'message')
                resolveMsg(false);
        });

        await app.userService.sendLike(user1id, user2id); // make user1 like user2
        await app.userService.sendLike(user2id, user1id); // make user2 like user1

        const chat = await app.chatService.getChatBetweenUsers([user1id, user2id]);
        const chatId = chat.id;

        await app.userService.sendUnlike(user1id, user2id); // make user1 dislike user2

        const newChat = await app.chatService.getChatBetweenUsers([user1id, user2id]);
        expect(newChat).to.equal(null); // chat should be deleted

        ws1.send(JSON.stringify({
            type: 'message',
            targetId: chatId,
            content: 'Hello'
        }));
        const tmOut = setTimeout(() => {
            resolveMsg(true);
        }, 2000);

        const value = await promise;

        clearTimeout(tmOut);
        expect(value).to.equal(true);

        ws1.terminate();
        ws2.terminate();
    });
});