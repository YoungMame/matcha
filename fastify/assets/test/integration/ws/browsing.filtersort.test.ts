import chai from 'chai';
import { expect } from 'chai';
import { buildApp } from '../../../srcs/app';
import { FastifyInstance } from 'fastify';

// import fixtures
import { quickUser } from '../fixtures/auth.fixtures';

// import utils
import { setTags, setLocalisation, setBirthDate, likeUser, viewUser, getAgeDifference } from '../utils/browsing';
import { BrowsingUser } from '../../../srcs/services/BrowsingService';

describe('Browsing filters and sorting', () => {
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
            expect((rows[i] as BrowsingUser).distance).to.be.lessThanOrEqual((rows[i + 1] as BrowsingUser).distance);
        }
    });

    it('should be able to sort users by age', async function (this: any) {
        this.timeout(5000);

        const userBirthdate = '1992-06-15';
        const { userData: data1, token: token1 } = await quickUser(app);
        const { userData: data2, token: token2 } = await quickUser(app);
        const { userData: data3, token: token3 } = await quickUser(app);
        const { userData: data4, token: token4 } = await quickUser(app);
        const { userData: data5, token: token5 } = await quickUser(app);

        await setLocalisation(app, token1, 48.8566, 2.3522);
        await setLocalisation(app, token2, 48.94705, 2.3522);
        await setLocalisation(app, token3, 48.8566, 2.3525);
        await setLocalisation(app, token4, 48.8566, 2.3622);
        await setLocalisation(app, token5, 48.8566, 2.5522);

        await setBirthDate(app, token1, userBirthdate);
        await setBirthDate(app, token2, '1987-02-02');
        await setBirthDate(app, token3, '1994-03-03');
        await setBirthDate(app, token4, '1996-04-04');
        await setBirthDate(app, token5, '1980-05-05');

        const rows = await app.browsingService.browseUsers(data1.id as number, 10, 0, 50, undefined, 'age');

        for (let i = 0; i < rows.length - 1; i++) {
            expect(getAgeDifference(userBirthdate, (rows[i] as BrowsingUser).bornAt)).to.be.lessThanOrEqual(getAgeDifference(userBirthdate, (rows[i + 1] as BrowsingUser).bornAt));
        }
    });

    it('should be able to sort users by fame rate', async function (this: any) {
        this.timeout(5000);

        const { userData: data1, token: token1 } = await quickUser(app);
        const { userData: data2, token: token2 } = await quickUser(app);
        const { userData: data3, token: token3 } = await quickUser(app);
        const { userData: data4, token: token4 } = await quickUser(app);
        const { userData: data5, token: token5 } = await quickUser(app);

        await setLocalisation(app, token1, 34.3453, 2.325);
        await setLocalisation(app, token2, 34.3453, 2.323);
        await setLocalisation(app, token3, 34.3453, 2.3212);
        await setLocalisation(app, token4, 34.3453, 2.3232);
        await setLocalisation(app, token5, 34.3453, 2.321);

        await viewUser(app, token1, data2.id as number);
        await viewUser(app, token1, data3.id as number);
        await viewUser(app, token1, data4.id as number);
        await viewUser(app, token1, data5.id as number);
        await viewUser(app, token2, data3.id as number);
        await viewUser(app, token2, data4.id as number);
        await viewUser(app, token2, data5.id as number);
        await viewUser(app, token3, data2.id as number);
        await viewUser(app, token3, data4.id as number);
        await viewUser(app, token3, data5.id as number);
        await viewUser(app, token4, data2.id as number);
        await viewUser(app, token4, data3.id as number);
        await viewUser(app, token4, data5.id as number);
        await viewUser(app, token5, data2.id as number);
        await viewUser(app, token5, data3.id as number);
        await viewUser(app, token5, data4.id as number);

        await likeUser(app, token1, data2.id as number);
        await likeUser(app, token1, data3.id as number);
        await likeUser(app, token2, data4.id as number);
        await likeUser(app, token3, data4.id as number);
        await likeUser(app, token3, data5.id as number);
        await likeUser(app, token4, data5.id as number);

        const rows = await app.browsingService.browseUsers(data1.id as number, 10, 0, 50, undefined, 'fameRate');
        
        expect(rows).to.not.be.undefined;
        if (!rows) return;

        for (let i = 0; i < rows.length - 1; i++) {
            expect((rows[i] as BrowsingUser).fameRate).to.be.greaterThanOrEqual((rows[i + 1] as BrowsingUser).fameRate);
        }
    });

    it('should be able to sort users by fame rate', async function (this: any) {
        this.timeout(5000);

        const { userData: data1, token: token1 } = await quickUser(app);
        const { userData: data2, token: token2 } = await quickUser(app);
        const { userData: data3, token: token3 } = await quickUser(app);
        const { userData: data4, token: token4 } = await quickUser(app);
        const { userData: data5, token: token5 } = await quickUser(app);

        await setLocalisation(app, token1, 34.3453, 2.325);
        await setLocalisation(app, token2, 34.3453, 2.323);
        await setLocalisation(app, token3, 34.3453, 2.3212);
        await setLocalisation(app, token4, 34.3453, 2.3232);
        await setLocalisation(app, token5, 34.3453, 2.321);

        await setTags(app, token1, ['music', 'sports', 'art']);
        await setTags(app, token2, ['music', 'sports', 'art']);
        await setTags(app, token3, ['music', 'sports', 'reading']);
        await setTags(app, token4, ['gambling', 'cooking', 'gaming']);
        await setTags(app, token5, ['gaming', 'photography', 'art']);

        const rows = await app.browsingService.browseUsers(data1.id as number, 10, 0, 50, undefined, 'tags');
        
        for (let i = 0; i < rows.length - 1; i++) {
            const countCurrent = (rows[i] as BrowsingUser).tags.filter((tag: string) => ['music', 'sports', 'art'].includes(tag)).length;
            const countNext = (rows[i + 1] as BrowsingUser).tags.filter((tag: string) => ['music', 'sports', 'art'].includes(tag)).length;
            expect(countCurrent).to.be.greaterThanOrEqual(countNext);
        }
    });

    it('should be able to filter users by tags', async function (this: any) {
        this.timeout(5000);

        const { userData: data1, token: token1 } = await quickUser(app);
        const { userData: data2, token: token2 } = await quickUser(app);
        const { userData: data3, token: token3 } = await quickUser(app);
        const { userData: data4, token: token4 } = await quickUser(app);
        const { userData: data5, token: token5 } = await quickUser(app);

        await setLocalisation(app, token1, 34.3453, 2.325);
        await setLocalisation(app, token2, 34.3453, 2.323);
        await setLocalisation(app, token3, 34.3453, 2.3212);
        await setLocalisation(app, token4, 34.3453, 2.3232);
        await setLocalisation(app, token5, 34.3453, 2.321);

        await setTags(app, token1, ['music', 'sports', 'art']);
        await setTags(app, token2, ['music', 'sports', 'art']);
        await setTags(app, token3, ['music', 'sports', 'reading']);
        await setTags(app, token4, ['music', 'cooking', 'gaming']);
        await setTags(app, token5, ['gaming', 'photography', 'gambling']);

        const rows = await app.browsingService.browseUsers(data1.id as number, 10, 0, 50, { tags: ['music'] });
        
        for (let i = 0; i < rows.length - 1; i++) {
            expect((rows[i] as BrowsingUser).tags).to.include('music');
        }
    });

    it('should be able to filter users by age', async function (this: any) {
        this.timeout(5000);

        const { userData: data1, token: token1 } = await quickUser(app);
        const { userData: data2, token: token2 } = await quickUser(app);
        const { userData: data3, token: token3 } = await quickUser(app);
        const { userData: data4, token: token4 } = await quickUser(app);
        const { userData: data5, token: token5 } = await quickUser(app);

        await setLocalisation(app, token1, 38.3853, 2.325);
        await setLocalisation(app, token2, 38.3853, 2.323);
        await setLocalisation(app, token3, 38.3853, 2.3212);
        await setLocalisation(app, token4, 38.3853, 2.3232);
        await setLocalisation(app, token5, 38.3853, 2.321);

        const less40YearsAgo = new Date();
        less40YearsAgo.setFullYear(less40YearsAgo.getFullYear() - 40);
        await setBirthDate(app, token2, less40YearsAgo.toISOString());

        const less37YearsAgo = new Date();
        less37YearsAgo.setFullYear(less37YearsAgo.getFullYear() - 37);
        await setBirthDate(app, token3, less37YearsAgo.toISOString());

        const less35YearsAgo = new Date();
        less35YearsAgo.setFullYear(less35YearsAgo.getFullYear() - 35);
        await setBirthDate(app, token4, less35YearsAgo.toISOString());

        const less33YearsAgo = new Date();
        less33YearsAgo.setFullYear(less33YearsAgo.getFullYear() - 33);
        await setBirthDate(app, token5, less33YearsAgo.toISOString());

        const rows = await app.browsingService.browseUsers(data1.id as number, 10, 0, 50, { age: { min: 34, max: 39 } });

        for (let i = 0; i < rows.length - 1; i++) {
            const age = new Date().getFullYear() - new Date((rows[i] as BrowsingUser).bornAt).getFullYear();
            expect(age).to.be.at.least(34);
            expect(age).to.be.at.most(39);
        }
    });

    it('should be able to filter users by age', async function (this: any) {
        this.timeout(5000);

        const { userData: data1, token: token1 } = await quickUser(app);
        const { userData: data2, token: token2 } = await quickUser(app);
        const { userData: data3, token: token3 } = await quickUser(app);
        const { userData: data4, token: token4 } = await quickUser(app);
        const { userData: data5, token: token5 } = await quickUser(app);

        await setLocalisation(app, token1, 38.3853, 2.325);
        await setLocalisation(app, token2, 38.3853, 2.323);
        await setLocalisation(app, token3, 38.3853, 2.3212);
        await setLocalisation(app, token4, 38.3853, 2.3232);
        await setLocalisation(app, token5, 38.3853, 2.321);

        const less40YearsAgo = new Date();
        less40YearsAgo.setFullYear(less40YearsAgo.getFullYear() - 40);
        await setBirthDate(app, token2, less40YearsAgo.toISOString());

        const less37YearsAgo = new Date();
        less37YearsAgo.setFullYear(less37YearsAgo.getFullYear() - 37);
        await setBirthDate(app, token3, less37YearsAgo.toISOString());

        const less35YearsAgo = new Date();
        less35YearsAgo.setFullYear(less35YearsAgo.getFullYear() - 35);
        await setBirthDate(app, token4, less35YearsAgo.toISOString());

        const less33YearsAgo = new Date();
        less33YearsAgo.setFullYear(less33YearsAgo.getFullYear() - 33);
        await setBirthDate(app, token5, less33YearsAgo.toISOString());

        const rows = await app.browsingService.browseUsers(data1.id as number, 10, 0, 50, { age: { min: 34, max: 39 } });

        for (let i = 0; i < rows.length - 1; i++) {
            const age = new Date().getFullYear() - new Date((rows[i] as BrowsingUser).bornAt).getFullYear();
            expect(age).to.be.at.least(34);
            expect(age).to.be.at.most(39);
        }
    });

    it('should be able to filter users by fame rate', async function (this: any) {
        this.timeout(5000);

        const { userData: data1, token: token1 } = await quickUser(app);
        const { userData: data2, token: token2 } = await quickUser(app);
        const { userData: data3, token: token3 } = await quickUser(app);
        const { userData: data4, token: token4 } = await quickUser(app);
        const { userData: data5, token: token5 } = await quickUser(app);

        await setLocalisation(app, token1, 40.4053, 2.325);
        await setLocalisation(app, token2, 40.4053, 2.323);
        await setLocalisation(app, token3, 40.4053, 2.3212);
        await setLocalisation(app, token4, 40.4053, 2.3232);
        await setLocalisation(app, token5, 40.4053, 2.321);

        await viewUser(app, token1, data2.id as number);
        await viewUser(app, token1, data3.id as number);
        await viewUser(app, token1, data4.id as number);
        await viewUser(app, token1, data5.id as number);
        await viewUser(app, token2, data3.id as number);
        await viewUser(app, token2, data4.id as number);
        await viewUser(app, token2, data5.id as number);
        await viewUser(app, token3, data2.id as number);
        await viewUser(app, token3, data4.id as number);
        await viewUser(app, token3, data5.id as number);
        await viewUser(app, token4, data2.id as number);
        await viewUser(app, token4, data3.id as number);
        await viewUser(app, token4, data5.id as number);
        await viewUser(app, token5, data2.id as number);
        await viewUser(app, token5, data3.id as number);
        await viewUser(app, token5, data4.id as number);

        await likeUser(app, token1, data2.id as number);
        await likeUser(app, token1, data3.id as number);
        await likeUser(app, token2, data4.id as number);
        await likeUser(app, token3, data4.id as number);
        await likeUser(app, token3, data5.id as number);
        await likeUser(app, token4, data5.id as number);

        const rows = await app.browsingService.browseUsers(data1.id as number, 10, 0, 50, { fameRate: { min: 300, max: 800 } });

        for (let i = 0; i < rows.length - 1; i++) {
            expect((rows[i] as BrowsingUser).fameRate).to.be.at.least(300);
            expect((rows[i] as BrowsingUser).fameRate).to.be.at.most(800);
        }

        const rows1 = await app.browsingService.browseUsers(data1.id as number, 10, 0, 50, { fameRate: { min: 600, max: 1000 } });
        for (let i = 0; i < rows1.length - 1; i++) {
            expect((rows1[i] as BrowsingUser).fameRate).to.be.at.least(600);
            expect((rows1[i] as BrowsingUser).fameRate).to.be.at.most(1000);
        }

        const rows2 = await app.browsingService.browseUsers(data1.id as number, 10, 0, 50, { fameRate: { min: 0, max: 0 } });
        for (let i = 0; i < rows2.length - 1; i++) {
            expect((rows2[i] as BrowsingUser).fameRate).to.be.at.least(0);
            expect((rows2[i] as BrowsingUser).fameRate).to.be.at.most(0);
        }
    });

    it('should be able to filter users by location', async function (this: any) {
        this.timeout(5000);

        const { userData: data1, token: token1 } = await quickUser(app);
        const { userData: data2, token: token2 } = await quickUser(app);
        const { userData: data3, token: token3 } = await quickUser(app);
        const { userData: data4, token: token4 } = await quickUser(app);
        const { userData: data5, token: token5 } = await quickUser(app);

        await setLocalisation(app, token1, 1.4053, 1.325);
        await setLocalisation(app, token2, 40.4053, 2.323);
        await setLocalisation(app, token3, 40.4053, 2.3212);
        await setLocalisation(app, token4, 40.4053, 2.3232);
        await setLocalisation(app, token5, 40.4053, 2.321);

        const rows = await app.browsingService.browseUsers(data1.id as number, 10, 0, 50, { 
            location: {
                latitude: 40.4053,
                longitude: 2.325
            }
        , }, 'distance');
        expect(rows.length).to.be.greaterThan(0);

        for (let i = 0; i < rows.length - 1; i++) {
            expect((rows[i] as BrowsingUser).distance).to.be.at.most(50);
        }

        const rows1 = await app.browsingService.browseUsers(data1.id as number, 10, 0, 25, { 
            location: {
                latitude: 40.4053,
                longitude: 2.325
            }
        , }, 'distance');
        expect(rows1.length).to.be.greaterThan(0);

        for (let i = 0; i < rows1.length - 1; i++) {
            expect((rows1[i] as BrowsingUser).distance).to.be.at.most(25);
        }
    });
});