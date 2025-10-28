import chai from 'chai';
const expect = chai.expect;
import { buildApp } from '../../../../srcs/app';
import { FastifyInstance } from 'fastify';

import FormData from 'form-data'
import path from 'path'
import fs from 'fs';
// import fixtures
import { signUpAndGetToken, UserData } from '../../fixtures/auth.fixtures';

const addPicture = async(app: FastifyInstance) => {
    const form = new FormData();
    const filePath = path.join(__dirname, 'test.jpeg');
    form.append('file', fs.createReadStream(filePath), {
        filename: 'test.jpeg',
        contentType: 'image/jpeg'
    });

    const response = await app.inject({
        method: 'POST',
        url: '/private/user/me/profile-picture',
        headers: {
            'Content-Type': 'multipart/form-data'
        },
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

        const addPictureResponse = await addPicture(app);

        expect(addPictureResponse.statusCode).to.equal(200);
        expect((addPictureResponse.body as any).url).to.be.a('string');
    });
});