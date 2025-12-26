import chai from 'chai';
import { expect } from 'chai';
import { app } from '../../setup';
import { FastifyInstance } from 'fastify';

// import fixtures
import { quickUser, signUpAndGetToken } from '../fixtures/auth.fixtures';

// import utils
import { setTags, setLocalisation, setBirthDate, likeUser, viewUser, getAgeDifference } from '../utils/browsing';
import path from 'node:path';
import fs from 'node:fs';
import FormData from 'form-data';

async function browseUsers(app: FastifyInstance, token: string, params: any) {
    const url = `/private/browsing/${params.minAge || 18}/${params.maxAge || 100}/${params.minFame || 0}/${params.maxFame || 1000}/${(params.tags || []).join(',')}/${params.lat || 1000}/${params.lng || 1000}/${params.radius || 30}/${params.sortBy || 'default'}`;
    const response = await app.inject({
        method: 'GET',
        headers: {
            Cookie: `jwt=${token}`
        },
        url: url,
    });
    return JSON.parse(response.body).users;
}

async function researchUsers(app: FastifyInstance, token: string, params: any) {
    const url = `/private/research/${params.username || ''}/${params.minAge || 18}/${params.maxAge || 100}/${params.minFame || 0}/${params.maxFame || 1000}/${(params.tags || []).join(',')}/${params.lat || 1000}/${params.lng || 1000}/${params.radius || 30}/${params.sortBy || 'default'}`;
    const response = await app.inject({
        method: 'GET',
        headers: {
            Cookie: `jwt=${token}`
        },
        url: url,
    });
    return JSON.parse(response.body).users;
}

async function createUserWithProfile(app: FastifyInstance, username: string, email: string, password: string, firstName: string, lastName: string, bio: string, tags: string[], bornAt: string, orientation: string, gender: string): Promise<string> {
    const token = await signUpAndGetToken(app, {
        username: username,
        email: email,
        password: password,
        firstName: firstName,
        lastName: lastName,
        bio: bio,
        tags: tags,
        bornAt: bornAt,
        orientation: orientation,
        gender: gender
    });
    if (!token) throw new Error('Failed to create browsing test user 1');
    await setLocalisation(app, token, 69.8566, 2.3522);     
    
    const form = new FormData();
    const filePath = path.join(__dirname, '../../files/test.jpg');
    form.append('file', fs.createReadStream(filePath), {
        filename: 'test.jpg',
        contentType: 'image/jpeg'
    });

    const headers = form.getHeaders();
    headers['Cookie'] = `jwt=${token}`;

    await app.inject({
        method: 'POST',
        url: '/private/user/me/profile-picture',
        headers,
        payload: form
    });

    return token;
}

describe('Browsing filters and sorting', async () => {

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
        const token1 = await createUserWithProfile(app, 'browsingtestuser1', 'browsingtestuser1@gmail.com', 'Test@1234!fjfsfas', 'Browsing', 'TestUser1', 'I am browsing test user 1 Lorem ipsum dolor sit amet, consectetur adipiscing elit, Lorem ipsum dolor sit amet, consectetur adipiscing elit, Lorem ipsum dolor sit amet, consectetur adipiscing elit, Lorem ', ['music', 'sport', 'travel', 'art'], '1995-06-15', 'heterosexual', 'women');

        // Build corresponding users
        const { userData: data2, token: token2 } = await quickUser(app); // #1 Perfect match
        await setTags(app, token2, ['music', 'sport', 'travel']);
        await setBirthDate(app, token2, '1994-08-20');
        await setLocalisation(app, token2, 69.8566, 2.3622);
        
        const { userData: data3, token: token3 } = await quickUser(app); // #2 Almost perfect match
        await setTags(app, token3, ['music', 'art', 'whatever']);
        await setBirthDate(app, token3, '1994-08-20');
        await setLocalisation(app, token3, 69.854, 2.5522);

        const { userData: data4, token: token4 } = await quickUser(app); // #3 Less tags
        await setTags(app, token4, ['music', 'dshsh', 'sdgfgd']);
        await setBirthDate(app, token4, '1996-11-05');
        await setLocalisation(app, token4, 69.9566, 2.3522);

        const { userData: data5, token: token5 } = await quickUser(app); // #7 Too old
        await setTags(app, token5, ['music', 'sport', 'travel', 'art']);
        await setBirthDate(app, token5, '1970-03-22');
        await setLocalisation(app, token5, 69.8577, 2.3522);

        const { userData: data6, token: token6 } = await quickUser(app); // #4 Too far
        await setTags(app, token6, ['cooking', 'reading', 'music']);
        await setBirthDate(app, token6, '1995-05-30');
        await setLocalisation(app, token6, 68.8566, 2.955);

        const { userData: data7, token: token7 } = await quickUser(app); // #5 No matching tags + far + old
        await setTags(app, token7, ['cooking', 'reading', 'drug', 'gambling', 'alcohol']);
        await setBirthDate(app, token7, '1960-03-22');
        await setLocalisation(app, token7, 69.86, 2.3522);

        const users = await browseUsers(app, token1, {
            minAge: 18,
            maxAge: 100,
            minFame: 0,
            maxFame: 1000,
            lat: 69.8566,
            lng: 2.3522,
            radius: 300,
            sortBy: 'default'
        });

        expect(users[0].id).to.equal(data2.id);
        expect(users[1].id).to.equal(data3.id);
        expect(users[2].id).to.equal(data4.id);
        expect(users[3].id).to.equal(data5.id);
        expect(users[4].id).to.equal(data6.id);
        expect(users[5].id).to.equal(data7.id);
    });

    it('should be able to research users by username', async function (this: any) {
        this.timeout(5000);
        const token1 = await createUserWithProfile(app, 'researchtestuser1', 'researchtestuser1@gmail.com', 'Test@1234!fjfsfas', 'Test', 'TestUser1', 'I am browsing test user 1 Lorem ipsum dolor sit amet, consectetur adipiscing elit, Lorem ipsum dolor sit amet, consectetur adipiscing elit, Lorem ipsum dolor sit amet, consectetur adipiscing elit, Lorem ', ['music', 'sport', 'travel', 'art'], '1995-06-15', 'heterosexual', 'women');
        await setLocalisation(app, token1, 89.8566, 52.3522);
        const { userData: data2, token: token2 } = await quickUser(app);
        await setTags(app, token2, ['music', 'sport', 'travel']);
        await setBirthDate(app, token2, '1994-08-20');
        await setLocalisation(app, token2, 89.8566, 52.3622);
        const { userData: data3, token: token3 } = await quickUser(app);
        await setLocalisation(app, token3, 89.854, 52.5522);
        const users = await researchUsers(app, token2, {
            username: 'researchtestuser1',
            minAge: 18,
            maxAge: 100,
            minFame: 0,
            maxFame: 1000,
            lat: 89.8566,
            lng: 52.3622,
            radius: 300,
            sortBy: 'default'
        });
        expect(users.length).to.be.greaterThan(0);
        expect(users[0].firstName).to.equal('Test');
        expect(users[1]).to.be.undefined;
    });
});