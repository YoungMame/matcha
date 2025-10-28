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

describe('User picture integration tests', () => {
    let app: FastifyInstance;

    beforeEach(async () => {
        app = buildApp();
        await app.ready();
    });
    
    afterEach(async () => {
        await app.close();
    });

    it('should add a new user picture', async () => {
        const userData: UserData = {
            username: 'userpicturetest',
            email: 'userpicturetest@example.com',
            password: 'ghhgdhgdF123!',
            bornAt: '2000-01-01',
            orientation: 'heterosexual',
            gender: 'men'
        };

        const token = await signUpAndGetToken(app, userData);
        expect(token).to.be.a('string');
        const addPictureResponse = await addPicture(app, token as string);
        const body = JSON.parse(addPictureResponse.body);
        expect(addPictureResponse.statusCode).to.equal(200);
        expect(body.url).to.be.a('string');
    });

    it('should fail to add a picture when not logged  in', async () => {
        const addPictureResponse = await addPicture(app, 'invalidtoken');
        expect(addPictureResponse.statusCode).to.equal(401);
    });

    it('should automatically set the profile picture as profilePictureIndex 0', async () => {
        const userData: UserData = {
            username: 'userpicturetest2',
            email: 'userpicturetest2@example.com',
            password: 'ghhgdhgdF123!',
            bornAt: '2000-01-01',
            orientation: 'heterosexual',
            gender: 'men'
        };
        const token = await signUpAndGetToken(app, userData);
        expect(token).to.be.a('string');
        const addPictureResponse = await addPicture(app, token as string);
        expect(addPictureResponse.statusCode).to.equal(200);

        const meResponse = await app.inject({
            method: 'GET',
            url: '/private/user/me',
            headers: {
                'Cookie': `jwt=${token}`
            }
        });
        expect(meResponse.statusCode).to.equal(200);
        const meResponseBody = JSON.parse(meResponse.body);
        console.log(meResponseBody);
        expect(meResponseBody.profilePictureIndex).to.equal(0);
    });
});