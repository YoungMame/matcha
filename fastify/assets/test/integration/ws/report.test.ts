import chai from 'chai';
import { expect } from 'chai';
import { buildApp } from '../../../srcs/app';
import { FastifyInstance } from 'fastify';

// import fixtures
import { quickUser } from '../fixtures/auth.fixtures';

describe('Report users test', () => {
    let app: FastifyInstance;

    beforeEach(async () => {
        app = buildApp();
        await app.ready();
    });

    it('should be able to report a user', async function (this: any) {
        this.timeout(5000);

        const { userData: data1, token: token1 } = await quickUser(app);
        const { userData: data2, token: token2 } = await quickUser(app);

        const response = await app.inject({
            method: 'POST',
            url: `/private/report/${data2.id}`,
            headers: {
                'Cookie': `jwt=${token1}`
            }
        });
        expect(response.statusCode).to.equal(200);
    });

    it('should not be able to report the same user twice', async function (this: any) {
        this.timeout(5000);

        const { userData: data1, token: token1 } = await quickUser(app);
        const { userData: data2, token: token2 } = await quickUser(app);

        let response = await app.inject({
            method: 'POST',
            url: `/private/report/${data2.id}`,
            headers: {
                'Cookie': `jwt=${token1}`
            }
        });
        expect(response.statusCode).to.equal(200);

        response = await app.inject({
            method: 'POST',
            url: `/private/report/${data2.id}`,
            headers: {
                'Cookie': `jwt=${token1}`
            }
        });
        expect(response.statusCode).to.equal(409);
    });

    it('should not be able to report yourself', async function (this: any) {
        this.timeout(5000);

        const { userData: data1, token: token1 } = await quickUser(app);

        const response = await app.inject({
            method: 'POST',
            url: `/private/report/${data1.id}`,
            headers: {
                'Cookie': `jwt=${token1}`
            }
        });
        expect(response.statusCode).to.equal(409);
    });

    it('should not be able to report non exisiting user', async function (this: any) {
        this.timeout(5000);

        const { userData: data1, token: token1 } = await quickUser(app);

        const response = await app.inject({
            method: 'POST',
            url: `/private/report/242412`,
            headers: {
                'Cookie': `jwt=${token1}`
            }
        });
        expect(response.statusCode).to.equal(404);
    });
});