import chai from 'chai';
import { expect } from 'chai';
import { buildApp } from '../../../srcs/app';
import { FastifyInstance } from 'fastify';

// import fixtures
import { quickUser } from '../fixtures/auth.fixtures';

describe('Notification', () => {
    let app: FastifyInstance;

    beforeEach(async () => {
        app = buildApp();
        await app.ready();
    });

    it('should be able to get notifications', async function (this: any) {
        this.timeout(5000);

        const { userData: data1, token: token1 } = await quickUser(app);
        const { userData: data2, token: token2 } = await quickUser(app);
        const { userData: data3, token: token3 } = await quickUser(app);
        const { userData: data4, token: token4 } = await quickUser(app);

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
    });
});