import chai from 'chai';
import { expect } from 'chai';
import { buildApp } from '../../../srcs/app';
import { FastifyInstance } from 'fastify';

// import fixtures
import { quickUser } from '../fixtures/auth.fixtures';

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

        await app.inject({
            method: 'PUT',
            url: `/private/user/me/profile`,
            headers: {
                'Cookie': `jwt=${token1}`
            },
            payload: {
                location: {
                    latitude: 48.8566,
                    longitude: 2.3522
                }
            }
        });

        await app.inject({
            method: 'PUT',
            url: `/private/user/me/profile`,
            headers: {
                'Cookie': `jwt=${token2}`
            },
            payload: {
                location: {
                    latitude: 48.8566,
                    longitude: 2.3522
                }
            }
        });

        const rows = await app.browsingService.browseUsers(data1.id as number, 10, 0, 50);
        console.log('Browsed users:', rows);
    });
});