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

const setBirthDate = async (app: FastifyInstance, token: string, birthdate: string) => {
    const response = await app.inject({
        method: 'PUT',
        url: `/private/user/me/profile`,
        headers: {
            'Cookie': `jwt=${token}`
        },
        payload: {
            bornAt: new Date(birthdate).toISOString()
        }
    });
    console.log('Set birthdate response status:', response.statusCode);
}

const getAgeDifference = (birthdate1: string, birthdate2: string): number => {
    console.log('Birthdate1:', birthdate1, 'Birthdate2:', birthdate2);
    const date1 = new Date(birthdate1);
    const date2 = new Date(birthdate2);

    console.log('Date1:', date1, 'Date2:', date2);

    const age1 = new Date().getTime() - date1.getTime();
    const age2 = new Date().getTime() - date2.getTime();

    console.log('Age1:', age1, 'Age2:', age2);

    console.log('Age Difference:', Math.abs(age1 - age2));

    return Math.abs(age1 - age2);
}

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
            expect(rows[i].distance).to.be.lessThanOrEqual(rows[i + 1].distance);
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
            expect(getAgeDifference(userBirthdate, rows[i].bornAt)).to.be.lessThanOrEqual(getAgeDifference(userBirthdate, rows[i + 1].bornAt));
        }
    });
});