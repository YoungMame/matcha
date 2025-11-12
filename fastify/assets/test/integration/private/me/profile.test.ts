import chai from 'chai';
import { expect } from 'chai';
import { buildApp } from '../../../../srcs/app';
import { FastifyInstance } from 'fastify';

// import fixtures
import { signUpAndGetToken, UserData } from '../../fixtures/auth.fixtures';

const editProperty = async(app: FastifyInstance, token: string, key: string, value: any) => {
    const editResponse = await app.inject({
        method: 'PUT',
        url: `/private/user/me/profile`,
        headers: {
            'Cookie': `jwt=${token}`
        },
        payload: {
            [key]: value
        }
    });

    const meResponse = await app.inject({
        method: 'GET',
        url: '/private/user/me/profile',
        headers: {
            'Cookie': `jwt=${token}`
        }
    });
    const body = meResponse.json();
    return body;
};

const editProperties = async(app: FastifyInstance, token: string, properties: Object) => {
    await app.inject({
        method: 'PUT',
        url: `/private/user/me/profile`,
        headers: {
            'Cookie': `jwt=${token}`
        },
        payload: {
            ...properties
        }
    });

    const meResponse = await app.inject({
        method: 'GET',
        url: '/private/user/me/profile',
        headers: {
            'Cookie': `jwt=${token}`
        }
    });
    const body = meResponse.json();
    return body;
};

describe('User me profile integration tests', async () => {
    let app: FastifyInstance;
    let token: string;

    const userData: UserData = {
        username: 'usermeprofiletest',
        email: 'usermeprofiletest@example.com',
        password: 'ghhgdhgdF123!',
        firstName: 'Test',
        lastName: 'User',
        bornAt: '2000-01-01',
        bio: 'Nice user bio',
        tags: ['test', 'user'],
        orientation: 'heterosexual',
        gender: 'men'
    };

    beforeEach(async () => {
        if (!app) {
            app = buildApp();
            await app.ready();
        }
    });

    it('Should create the app and user', async () => {
        app = buildApp();
        await app.ready();
        expect(app).to.exist;
        token = await signUpAndGetToken(app, userData) as string;
        expect(token).to.be.a('string');
    });

    it('Should fail to get profile when not logged  in', async () => {
        const meResponse = await app.inject({
            method: 'GET',
            url: '/private/user/me/profile',
            headers: {
                'Cookie': `jwt=invalidtoken`
            }
        });
        expect(meResponse.statusCode).to.equal(401);
    });

    it('Should fail to get profile when logged  in', async () => {
        const meResponse = await app.inject({
            method: 'GET',
            url: '/private/user/me/profile',
            headers: {
                'Cookie': `jwt=${token}`
            }
        });
        expect(meResponse.statusCode).to.equal(200);
        const meData = meResponse.json();
        expect(meData).to.have.property('id');
        expect(meData).to.have.property('email', userData.email);
        expect(meData).to.have.property('username', userData.username);
        expect(meData).to.have.property('profilePictures').that.is.an('array').that.is.empty;
        expect(meData).to.have.property('bio', 'Nice user bio');
        expect(meData).to.have.property('tags').that.is.an('array');
        expect(meData).to.have.property('bornAt');
        expect(new Date(meData.bornAt).toISOString().split('T')[0]).to.equal(userData.bornAt);
        expect(meData).to.have.property('isVerified', true);
        expect(meData).to.have.property('isProfileCompleted', true);
        expect(meData).to.have.property('location').that.is.an('object');
        expect(meData.location).to.have.property('latitude', null);
        expect(meData.location).to.have.property('longitude', null);
        expect(meData).to.have.property('createdAt');
    });

    it('Should edit bio property', async () => {
        const newBio = 'This is my new bio';
        const meData = await editProperty(app, token, 'bio', newBio);
        expect(meData).to.have.property('bio', newBio);
    });

    it('Should not edit bio property with invalid data', async () => {
        let newBio = 12345;
        let meData = await editProperty(app, token, 'bio', newBio);
        expect(meData).to.have.property('bio', '12345');

        const newBio1 = {};
        const meData1 = await editProperty(app, token, 'bio', newBio1);
        expect(meData1).to.have.property('bio', '12345');

        const newBio2 = "dshghdsohdfgggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg"; // Invalid bio
        const meData2 = await editProperty(app, token, 'bio', newBio2);
        expect(meData2).to.have.property('bio', '12345');
    });

    it('Should edit tags property', async () => {
        const newTags = ['tag1', 'tag2', 'tag3'];
        const meData = await editProperty(app, token, 'tags', newTags);
        expect(meData).to.have.property('tags').that.is.an('array').that.includes.members(newTags);
    });

    it('Should edit gender property', async () => {
        const newGender = 'women';
        const meData = await editProperty(app, token, 'gender', newGender);
        expect(meData).to.have.property('gender', newGender);
    });

    it('Should not edit gender property with invalid data', async () => {
        const invalidGender = 'invalidgender';
        const meData = await editProperty(app, token, 'gender', invalidGender);
        expect(meData).to.have.property('gender', 'women');
    });

    it('Should edit bornAt property', async () => {
        const newBornAt = new Date('1995-05-15:00:00:00.000Z');
        const meData = await editProperty(app, token, 'bornAt', newBornAt);
        expect(new Date(meData.bornAt).toISOString()).to.equal(newBornAt.toISOString());
    });

    it('Should not edit bornAt property with invalid data', async () => {
        const invalidBornAt = 'invalid-date';
        const meData = await editProperty(app, token, 'bornAt', invalidBornAt);
        expect(new Date(meData.bornAt).toISOString()).to.equal(new Date('1995-05-15:00:00:00.000Z').toISOString());
    });

    it('Should edit orientation property', async () => {
        const newOrientation = 'homosexual';
        const meData = await editProperty(app, token, 'orientation', newOrientation);
        expect(meData).to.have.property('orientation', newOrientation);
    });

    it('Should not edit orientation property with invalid data', async () => {
        const invalidOrientation = 'invalidorientation';
        const meData = await editProperty(app, token, 'orientation', invalidOrientation);
        expect(meData).to.have.property('orientation', 'homosexual');
    });

    it('Should edit multiple properties at once', async () => {
        const newProperties = {
            bio: 'Updated bio',
            tags: ['newtag1', 'newtag2'],
            gender: 'women',
            bornAt: new Date('1990-01-01:00:00:00.000Z'),
            orientation: 'homosexual',
            location: { latitude: 40.7128, longitude: -74.0060 }
        };
        const meData = await editProperties(app, token, newProperties);
        expect(meData).to.have.property('bio', newProperties.bio);
        expect(meData).to.have.property('tags').that.includes.members(newProperties.tags);
        expect(meData).to.have.property('gender', newProperties.gender);
        expect(meData).to.have.property('orientation', newProperties.orientation);
        expect(meData).to.have.property('location').that.deep.equals({
            latitude: newProperties.location.latitude,
            longitude: newProperties.location.longitude,
            city: 'New York',
            country: 'United States'
        });
        expect(meData).to.have.property('bornAt');
        expect(new Date(meData.bornAt).toISOString()).to.be.equal(new Date(newProperties.bornAt).toISOString());
    });

    it('Should edit location a second time', async () => {
        const newLocation = { latitude: 34.0522, longitude: -118.2437 };
        const meData = await editProperties(app, token, { location: newLocation });
        expect(meData).to.have.property('location').that.deep.equals({
            latitude: newLocation.latitude,
            longitude: newLocation.longitude,
            city: 'Los Angeles',
            country: 'United States'
        });
    });

    it('Should not edit any property with full invalid data', async () => {
        const invalidProperties = {
            bio: {},
            tags: 'not-an-array',
        };
        const meData = await editProperties(app, token, invalidProperties);
        expect(meData).to.have.property('bio', 'Updated bio');
        expect(meData).to.have.property('tags').that.includes.members(['newtag1', 'newtag2']);
    });

    it('Should not edit immutable properties', async () => {
        const meResponseBefore = await app.inject({
            method: 'GET',
            url: '/private/user/me/profile',
            headers: {
                'Cookie': `jwt=${token}`
            }
        });
        const meDataBefore = meResponseBefore.json();

        const invalidProperties = {
            id: 42,
            email: 'newemail@email.com',
            username: 'newusername'
        };
        const meData = await editProperties(app, token, invalidProperties);

        expect(meData).to.have.property('id').that.is.a('number').that.is.not.equal(9999);
        expect(meData).to.have.property('email', meDataBefore.email);
        expect(meData).to.have.property('username', meDataBefore.username);
    });
});