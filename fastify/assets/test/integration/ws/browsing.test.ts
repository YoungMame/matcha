import chai from 'chai';
import { expect } from 'chai';
import { buildApp } from '../../../srcs/app';
import { FastifyInstance } from 'fastify';

// import fixtures
import { quickUser } from '../fixtures/auth.fixtures';

// import utils
import { setTags, setLocalisation, setBirthDate, likeUser, viewUser, getAgeDifference } from '../utils/browsing';

describe('Browsing filters and sorting', async () => {
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

        expect(rows.length).to.be.greaterThan(0);
    });

    it('should be able to give the best corresponding users', async function (this: any) {
        this.timeout(5000);
        const { userData: data1, token: token1 } = await quickUser(app);

        // Build my user profile
        await setTags(app, token1, ['music', 'sport', 'travel', 'art']);
        await setBirthDate(app, token1, '1995-06-15');
        await setLocalisation(app, token1, 69.8566, 2.3522);

        // Build corresponding users
        const { userData: data2, token: token2 } = await quickUser(app); // #1 Perfect match
        await setTags(app, token2, ['music', 'sport', 'travel']);
        await setBirthDate(app, token2, '1994-08-20');
        await setLocalisation(app, token2, 69.8566, 2.3622);
        
        const { userData: data3, token: token3 } = await quickUser(app); // #2 Almost perfect match
        await setTags(app, token3, ['music', 'art']);
        await setBirthDate(app, token3, '1994-08-20');
        await setLocalisation(app, token3, 69.854, 2.5522);

        const { userData: data4, token: token4 } = await quickUser(app); // #3 Less tags
        await setTags(app, token4, ['cooking']);
        await setBirthDate(app, token4, '1996-11-05');
        await setLocalisation(app, token4, 69.9566, 2.3522);

        const { userData: data5, token: token5 } = await quickUser(app); // #4 Too far
        await setTags(app, token5, ['music', 'sport', 'travel', 'art']);
        await setBirthDate(app, token5, '1995-05-30');
        await setLocalisation(app, token5, 68.8566, 2.355);

        const { userData: data6, token: token6 } = await quickUser(app); // #6 No matching tags
        await setTags(app, token6, ['cooking', 'reading', 'drug', 'gambling', 'alcohol']);
        await setBirthDate(app, token6, '1960-03-22');
        await setLocalisation(app, token6, 69.86, 2.3522);

        const { userData: data7, token: token7 } = await quickUser(app); // #7 Too old
        await setTags(app, token7, ['music', 'sport', 'travel', 'art']);
        await setBirthDate(app, token7, '1970-03-22');
        await setLocalisation(app, token7, 69.8577, 2.3522);

        const rows = await app.browsingService.browseUsers(data1.id as number, 10, 0, 200, undefined);
        console.log('Rows :', rows);

        expect(rows[0].id).to.equal(data2.id);
        expect(rows[1].id).to.equal(data3.id);
        expect(rows[2].id).to.equal(data4.id);
        expect(rows[3].id).to.equal(data4.id);
    });
});