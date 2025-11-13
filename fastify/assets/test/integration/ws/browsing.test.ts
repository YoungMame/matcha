import chai from 'chai';
import { expect } from 'chai';
import { buildApp } from '../../../srcs/app';
import { FastifyInstance } from 'fastify';

// import fixtures
import { quickUser } from '../fixtures/auth.fixtures';

const setLocalisation = async (app: FastifyInstance, token: string, lat: number, lgn: number) => {
    await app.inject({
        method: 'PUT',
        url: `/private/user/me/profile`,
        headers: {
            'Cookie': `jwt=${token}`
        },
        payload: {
            location: {
                latitude: lat,
                longitude: lgn
            }
        }
    });
};

describe('Block users test', () => {
    let app: FastifyInstance;

    beforeEach(async () => {
        app = buildApp();
        await app.ready();
    });

    it('should be able get near users', async function (this: any) {
        this.timeout(5000);

        const { userData: data1, token: token1 } = await quickUser(app);
        const { userData: data2, token: token2 } = await quickUser(app);

        await setLocalisation(app, token1, 48.8566, 2.3522);

        await setLocalisation(app, token2, 48.94705, 2.3522);

        const rows = await app.browsingService.browseUsers(data1.id as number, 10, 0, 50);
        console.log('Browsed users:', rows);
    });

    it('should be able to sort users by distance', async function (this: any) {
        this.timeout(5000);

        const { userData: data1, token: token1 } = await quickUser(app);
        const { userData: data2, token: token2 } = await quickUser(app);
        const { userData: data3, token: token3 } = await quickUser(app);
        const { userData: data4, token: token4 } = await quickUser(app);
        const { userData: data5, token: token5 } = await quickUser(app);

        await setLocalisation(app, token1, 48.8566, 2.3522);

        await setLocalisation(app, token2, 48.94705, 2.3522);

        await setLocalisation(app, token3, 48.8516, 2.4525);

        await setLocalisation(app, token4, 48.8566, 2.3622);

        await setLocalisation(app, token5, 48.8566, 2.5522);

        const rows = await app.browsingService.browseUsers(data1.id as number, 10, 0, 50, undefined, 'distance');

        for (let i = 0; i < rows.length - 1; i++) {
            expect(rows[i].distance).to.be.greaterThan(rows[i + 1].distance);
        }
    });
});