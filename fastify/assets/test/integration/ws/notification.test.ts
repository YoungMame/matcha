import chai from 'chai';
import { expect } from 'chai';
import { buildApp } from '../../../srcs/app';
import { FastifyInstance } from 'fastify';

// import fixtures
import { quickUser } from '../fixtures/auth.fixtures';

import { wait } from '../utils/wait';

describe('Notification', () => {
    let app: FastifyInstance;

    beforeEach(async () => {
        app = buildApp();
        await app.ready();
    });

    it('should be able to get notifications on like and like back and unlike', async function (this: any) {
        this.timeout(5000);

        const { userData: data1, token: token1 } = await quickUser(app);
        const { userData: data2, token: token2 } = await quickUser(app);

        let response = await app.inject({
            method: 'POST',
            url: `/private/user/like/${data2.id}`,
            headers: {
                'Cookie': `jwt=${token1}`
            }
        });
        expect(response.statusCode).to.equal(201);

        let getNotificationResponse = await app.inject({
            method: 'GET',
            url: `/private/notifications`,
            headers: {
                'Cookie': `jwt=${token2}`
            }
        });
        expect(getNotificationResponse.statusCode).to.equal(200);
        let getNotificationData = JSON.parse(getNotificationResponse.body);
        expect(getNotificationData.notifications[0].notificationType).to.equal('like');
        expect(getNotificationData.notifications[0].authorId).to.equal(data1.id);
        expect(getNotificationData.notifications[0].authorUsername).to.equal(data1.username);

        response = await app.inject({
            method: 'POST',
            url: `/private/user/like/${data1.id}`,
            headers: {
                'Cookie': `jwt=${token2}`
            }
        });
        getNotificationResponse = await app.inject({
            method: 'GET',
            url: `/private/notifications`,
            headers: {
                'Cookie': `jwt=${token1}`
            }
        });

        expect(getNotificationResponse.statusCode).to.equal(200);
        getNotificationData = JSON.parse(getNotificationResponse.body);
        expect(getNotificationData.notifications[0].notificationType).to.equal('like');
        expect(getNotificationData.notifications[0].authorId).to.equal(data2.id);
        expect(getNotificationData.notifications[0].authorUsername).to.equal(data2.username);
        expect(getNotificationData.notifications[1].notificationType).to.equal('like_back');
        expect(getNotificationData.notifications[1].authorId).to.equal(data2.id);
        expect(getNotificationData.notifications[1].authorUsername).to.equal(data2.username);

        response = await app.inject({
            method: 'DELETE',
            url: `/private/user/like/${data1.id}`,
            headers: {
                'Cookie': `jwt=${token2}`
            }
        });
        getNotificationResponse = await app.inject({
            method: 'GET',
            url: `/private/notifications`,
            headers: {
                'Cookie': `jwt=${token1}`
            }
        });

        expect(getNotificationResponse.statusCode).to.equal(200);
        getNotificationData = JSON.parse(getNotificationResponse.body);
        expect(getNotificationData.notifications[0].notificationType).to.equal('unlike');
        expect(getNotificationData.notifications[0].authorId).to.equal(data2.id);
        expect(getNotificationData.notifications[0].authorUsername).to.equal(data2.username);
    });

    it('should be able to get notifications on view', async function (this: any) {
        this.timeout(5000);

        const { userData: data1, token: token1 } = await quickUser(app);
        const { userData: data2, token: token2 } = await quickUser(app);

        let response = await app.inject({
            method: 'GET',
            url: `/private/user/view/${data2.id}`,
            headers: {
                'Cookie': `jwt=${token1}`
            }
        });
        expect(response.statusCode).to.equal(200);

        let response2 = await app.inject({
            method: 'GET',
            url: `/private/user/view/${data2.id}`,
            headers: {
                'Cookie': `jwt=${token1}`
            }
        });
        expect(response2.statusCode).to.equal(200);

        let getNotificationResponse = await app.inject({
            method: 'GET',
            url: `/private/notifications`,
            headers: {
                'Cookie': `jwt=${token2}`
            }
        });
        expect(getNotificationResponse.statusCode).to.equal(200);
        let getNotificationData = JSON.parse(getNotificationResponse.body);
        expect(getNotificationData.notifications[0].notificationType).to.equal('view');
        expect(getNotificationData.notifications[0].authorId).to.equal(data1.id);
        expect(getNotificationData.notifications[0].authorUsername).to.equal(data1.username);
        expect(getNotificationData.notifications.length).to.equal(1);
    });

    it('should be able to get notifications on message', async function (this: any) {
        this.timeout(5000);

        const { userData: data1, token: token1 } = await quickUser(app);
        const { userData: data2, token: token2 } = await quickUser(app);

        const ws1 = await app.injectWS('/private/ws', { headers: { cookie: `jwt=${token1}` } });

        await app.inject({
            method: 'POST',
            url: `/private/user/like/${data2.id}`,
            headers: {
                'Cookie': `jwt=${token1}`
            },
            body: {}
        });

        await app.inject({
            method: 'POST',
            url: `/private/user/like/${data1.id}`,
            headers: {
                'Cookie': `jwt=${token2}`
            },
            body: {}
        });

        await wait(300);

        const notificationResponse = await app.inject({
            method: 'GET',
            url: `/private/notifications`,
            headers: {
                'Cookie': `jwt=${token1}`
            }
        });
        const notificationData = JSON.parse(notificationResponse.body);
        const chatId = notificationData.notifications.find((n: any) => n.notificationType === 'like_back').targetId;

        ws1.send(JSON.stringify({
            type: 'message',
            targetId: chatId,
            content: 'Hello World!'
        }));

        await wait(300);

        const notificationResponse2 = await app.inject({
            method: 'GET',
            url: `/private/notifications`,
            headers: {
                'Cookie': `jwt=${token2}`
            }
        });
        const notificationData2 = JSON.parse(notificationResponse2.body);
        const messageNotification = notificationData2.notifications[0];
        expect(messageNotification.notificationType).to.equal('message');
        expect(messageNotification.authorId).to.equal(data1.id);
        expect(messageNotification.authorUsername).to.equal(data1.username);
    });
});