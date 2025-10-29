import chai from 'chai';
const expect = chai.expect;
import { buildApp } from '../../../../srcs/app';
import { FastifyInstance, FastifyReply } from 'fastify';

import FormData from 'form-data'
import path from 'path'
import fs from 'fs';
// import fixtures
import { signUpAndGetToken, UserData } from '../../fixtures/auth.fixtures';

const addPicture = async(app: FastifyInstance, token: string) => {
    const form = new FormData();
    const filePath = path.join(__dirname, 'test.jpeg');
    form.append('file', fs.createReadStream(filePath), {
        filename: 'test.jpeg',
        contentType: 'image/jpeg'
    });

    const headers = form.getHeaders();
    headers['Cookie'] = `jwt=${token}`;

    const response = await app.inject({
        method: 'POST',
        url: '/private/user/me/profile-picture',
        headers,
        payload: form
    });

    return response;
}

const setPictureIndex = async(app: FastifyInstance, token: string, index: number) => {
    const response = await app.inject({
        method: 'PUT',
        url: `/private/user/me/profile-picture/${index}`,
        headers: {
            'Cookie': `jwt=${token}`
        },
    });

    return response;
}

describe('User picture integration tests', async () => {
    let app: FastifyInstance;
    let token: string;

    const userData: UserData = {
        username: 'userpicturetest',
        email: 'userpicturetest@example.com',
        password: 'ghhgdhgdF123!',
        bornAt: '2000-01-01',
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

    it('should fail to add a picture when not logged  in', async () => {
        const addPictureResponse = await addPicture(app, 'invalidtoken');
        expect(addPictureResponse.statusCode).to.equal(401);
    });

    it('should automatically set the profile picture as profilePictureIndex 0', async () => {

        // Get undefined index before adding picture
        const meResponseBefore = await app.inject({
            method: 'GET',
            url: '/private/user/me/profile',
            headers: {
                'Cookie': `jwt=${token}`
            }
        });
        expect(meResponseBefore.statusCode).to.equal(200);
        const meResponseBeforeBody = JSON.parse(meResponseBefore.body);
        console.log(meResponseBeforeBody);
        expect(meResponseBeforeBody.profilePictureIndex).to.equal(undefined);

        const addPictureResponse = await addPicture(app, token as string);
        expect(addPictureResponse.statusCode).to.equal(200);

        const meResponse = await app.inject({
            method: 'GET',
            url: '/private/user/me/profile',
            headers: {
                'Cookie': `jwt=${token}`
            }
        });
        expect(meResponse.statusCode).to.equal(200);
        const meResponseBody = JSON.parse(meResponse.body);
        console.log(meResponseBody);
        expect(meResponseBody.profilePictureIndex).to.equal(0);
    });

    it('should not set profilePictureIndex on an invalid index', async () => {
        const setPictureResponse = await setPictureIndex(app, token as string, 5);
        expect(setPictureResponse.statusCode).to.equal(404);
    });

    it('should set profilePictureIndex on a valid index', async () => {
        const setPictureResponse = await setPictureIndex(app, token as string, 0);
        expect(setPictureResponse.statusCode).to.equal(200);
        const meResponse = await app.inject({
            method: 'GET',
            url: '/private/user/me/profile',
            headers: {
                'Cookie': `jwt=${token}`
            }
        });
        expect(meResponse.statusCode).to.equal(200);
        const meResponseBody = JSON.parse(meResponse.body);
        expect(meResponseBody.profilePictureIndex).to.equal(0);
    });

    it('Should remove a user picture', async () => {
        await addPicture(app, token as string);

        const meResponseBefore = await app.inject({
            method: 'GET',
            url: '/private/user/me/profile',
            headers: {
                'Cookie': `jwt=${token}`
            }
        });
        expect(meResponseBefore.statusCode).to.equal(200);
        const meResponseBeforeBody = JSON.parse(meResponseBefore.body);

        const removePictureResponse = await app.inject({
            method: 'DELETE',
            url: `/private/user/me/profile-picture/0`,
            headers: {
                'Cookie': `jwt=${token}`
            }
        });
        expect(removePictureResponse.statusCode).to.equal(200);

        const meResponse = await app.inject({
            method: 'GET',
            url: '/private/user/me/profile',
            headers: {
                'Cookie': `jwt=${token}`
            }
        });
        expect(meResponse.statusCode).to.equal(200);
        const meResponseBody = JSON.parse(meResponse.body);
        expect(meResponseBody.profilePictures.length).to.equal(1);
        expect(meResponseBody.profilePictureIndex).to.equal(0);

        const pictureURL = meResponseBeforeBody.profilePictures[0];
        const fetchPictureResponse = await app.inject({
            method: 'GET',
            url: pictureURL
        });
        expect(fetchPictureResponse.statusCode).to.equal(404);
    });

    it('Should fail to remove a picture with an invalid index', async () => {
        const removePictureResponse = await app.inject({
            method: 'DELETE',
            url: `/private/user/me/profile-picture/5`,
            headers: {
                'Cookie': `jwt=${token}`
            }
        });
        expect(removePictureResponse.statusCode).to.equal(404);
    });

    it('Should unset profilePictureIndex when the picture is removed', async () => {
        const removePictureResponse = await app.inject({
            method: 'DELETE',
            url: `/private/user/me/profile-picture/0`,
            headers: {
                'Cookie': `jwt=${token}`
            }
        });
        expect(removePictureResponse.statusCode).to.equal(200);

        const meResponse = await app.inject({
            method: 'GET',
            url: '/private/user/me/profile',
            headers: {
                'Cookie': `jwt=${token}`
            }
        });
        expect(meResponse.statusCode).to.equal(200);
        const meResponseBody = JSON.parse(meResponse.body);
        expect(meResponseBody.profilePictures.length).to.equal(0);
        expect(meResponseBody.profilePictureIndex).to.equal(undefined);
    });
});