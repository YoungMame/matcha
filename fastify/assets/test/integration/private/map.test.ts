import { expect } from 'chai';
import { app } from '../../setup';
import { FastifyInstance } from 'fastify';

// import fixtures
import { quickUser } from '../fixtures/auth.fixtures';

// import utils
import { setLocalisation } from '../utils/browsing';

describe('Map integration tests', async () => {

    it('should be able to fetch user on level 0', async () => {
        const { userData: data1, token: token1 } = await quickUser(app);
        const { userData: data2, token: token2 } = await quickUser(app);
        const { userData: data3, token: token3 } = await quickUser(app);

        await setLocalisation(app, token1, 48.8566, 2.3522);
        await setLocalisation(app, token2, 48.8570, 2.3530);
        await setLocalisation(app, token3, 40.7128, -74.0060); // New York

        const response = await app.inject({
            method: 'GET',
            url: `/private/map?level=0&latitude=48.8566&longitude=2.3522&radius=0.5`, // Paris coordinates
            headers: {
                'Cookie': `jwt=${token3}`
            }
        });
        expect(response.statusCode).to.equal(200);
        const data = JSON.parse(response.body);
        expect(data).to.have.property('users');
        expect(data).to.have.property('clusters');
        expect(data.users).to.be.an('array').and.have.lengthOf(2);
        expect(data.clusters).to.be.an('array').and.have.lengthOf(0);
    });

    it('should be able to fetch user on level 1', async () => {
        const { userData: data1, token: token1 } = await quickUser(app);
        const { userData: data2, token: token2 } = await quickUser(app);
        const { userData: data3, token: token3 } = await quickUser(app);

        await setLocalisation(app, token1, 48.8566, 2.3522);
        await setLocalisation(app, token2, 48.8570, 2.3530);
        await setLocalisation(app, token3, 40.7128, -74.0060); // New York

        const response = await app.inject({
            method: 'GET',
            url: `/private/map?level=1&latitude=48.8566&longitude=2.3522&radius=0.5`, // Paris coordinates
            headers: {
                'Cookie': `jwt=${token3}`
            }
        });
        expect(response.statusCode).to.equal(200);
        const data = JSON.parse(response.body);
        expect(data).to.have.property('users');
        expect(data).to.have.property('clusters');
        expect(data.users).to.be.an('array').and.have.lengthOf(0);
        expect(data.clusters).to.be.an('array').and.have.length.that.is.above(0);
        expect(data.clusters[0]).to.have.property('count').that.is.above(1);
    });

    it('should be able to fetch user on level 2', async () => {
        const { userData: data1, token: token1 } = await quickUser(app);
        const { userData: data2, token: token2 } = await quickUser(app);
        const { userData: data3, token: token3 } = await quickUser(app);

        await setLocalisation(app, token1, 48.8566, 2.3522);
        await setLocalisation(app, token2, 45.7640, 4.8357);
        await setLocalisation(app, token3, 40.7128, -74.0060); // New York

        const response = await app.inject({
            method: 'GET',
            url: `/private/map?level=2&latitude=48.8566&longitude=2.3522&radius=0.5`, // Paris coordinates
            headers: {
                'Cookie': `jwt=${token3}`
            }
        });
        expect(response.statusCode).to.equal(200);
        const data = JSON.parse(response.body);
        expect(data).to.have.property('users');
        expect(data).to.have.property('clusters');
        expect(data.users).to.be.an('array').and.have.lengthOf(0);
        expect(data.clusters).to.be.an('array').and.have.length.that.is.above(0);
        expect(data.clusters[0]).to.have.property('count').that.is.above(0)
        expect(data.clusters[0]).to.have.property('latitude').that.is.a('number')
        expect(data.clusters[0]).to.have.property('longitude').that.is.a('number');

        const moreLargeResponse = await app.inject({
            method: 'GET',
            url: `/private/map?level=2&latitude=48.8566&longitude=2.3522&radius=15000`, // Paris coordinates
            headers: {
                'Cookie': `jwt=${token3}`
            }
        });
        expect(moreLargeResponse.statusCode).to.equal(200);
        const moreLargeData = JSON.parse(moreLargeResponse.body);
        expect(moreLargeData).to.have.property('users');
        expect(moreLargeData).to.have.property('clusters');
        expect(moreLargeData.users).to.be.an('array').and.have.lengthOf(0);
        expect(moreLargeData.clusters).to.be.an('array').and.have.length.that.is.above(1);
    });
});