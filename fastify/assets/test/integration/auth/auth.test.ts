import chai from 'chai';
import { expect } from 'chai';
import { FastifyInstance } from 'fastify';

// import fixtures
import { signUpAndGetToken, UserData } from '../fixtures/auth.fixtures';

import { app } from '../../setup';

const testWeakPassword = async (app: FastifyInstance, passwordToTest: string) => {
    const signUpResponse = await app.inject({
        method: 'POST',
        url: '/auth/signup',
        payload: {
            username: 'weakpassworduser',
            email: 'weakpassworduser@example.com',
            password: passwordToTest,
        }
    });

    return signUpResponse;
};

const login = async(app: FastifyInstance, email: string, password: string) => {
    const loginResponse = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: {
            email,
            password
        }
    });

    return loginResponse;
}

describe('Auth Integration Tests', () => {
    it('should sign up a new user and login', async () => {
        const userData: UserData = {
            username: 'testuser1',
            email: 'testuser1@example.com',
            password: 'ghhgdhgdF123!',
            firstName: 'Test',
            lastName: 'User',
            bio: 'This is a test user.',
            tags: ['test', 'user'],
            bornAt: '2000-01-01',
            orientation: 'heterosexual',
            gender: 'men',
        };

        const token = await signUpAndGetToken(app, userData);
        expect(token).to.be.a('string');

        const loginResponse = await login(app, 'testuser1@example.com', 'ghhgdhgdF123!');
        expect(loginResponse.statusCode).to.equal(203);

        const wrongPassLogin = await login(app, 'testuser1@example.com', 'ghhgdh2gdF123!');
        expect(wrongPassLogin.statusCode).to.equal(404);

        const wrongEmailLogin = await login(app, 'testusesfasfr1@example.com', 'ghhgdhgdF123!');
        expect(wrongEmailLogin.statusCode).to.equal(404);
    });

    it('should not create duplicated username', async () => {
        const userData: UserData = {
            username: 'testuser2',
            email: 'testuser2@example.com',
            password: 'ghhgdhgdF123!',
            firstName: 'Test',
            lastName: 'User',
            bio: 'This is a test user.',
            tags: ['test', 'user'],
            bornAt: '2000-01-01',
            orientation: 'heterosexual',
            gender: 'men'
        };

        const token = await signUpAndGetToken(app, userData);
        expect(token).to.be.a('string');

        const duplicatedUsernameData: UserData = {
            username: 'testuser2',
            email: 'testuser2notduplicate@example.com',
            password: 'ghhgdhgdF123!',
            firstName: 'Test',
            lastName: 'User',
            bio: 'This is a test user.',
            tags: ['test', 'user'],
            bornAt: '2000-01-01',
            orientation: 'heterosexual',
            gender: 'men'
        };

        const signUpResponse = await app.inject({
            method: 'POST',
            url: '/auth/signup',
            payload: duplicatedUsernameData
        });

        expect(signUpResponse.statusCode).to.equal(403);
    });

    it('should not create duplicated email', async () => {
        const userData: UserData = {
            username: 'testuser3',
            email: 'testuser3@example.com',
            password: 'ghhgdhgdF123!',
            firstName: 'Test',
            lastName: 'User',
            bio: 'This is a test user.',
            tags: ['test', 'user'],
            bornAt: '2000-01-01',
            orientation: 'heterosexual',
            gender: 'men'
        };

        const token = await signUpAndGetToken(app, userData);
        expect(token).to.be.a('string');

        const duplicatedEmailData: UserData = {
            username: 'testuser3notduplicate',
            email: 'testuser3@example.com',
            password: 'ghhgdhgdF123!',
            firstName: 'Test',
            lastName: 'User',
            bio: 'This is a test user.',
            tags: ['test', 'user'],
            bornAt: '2000-01-01',
            orientation: 'heterosexual',
            gender: 'men'
        };

        const signUpResponse = await app.inject({
            method: 'POST',
            url: '/auth/signup',
            payload: duplicatedEmailData
        });

        expect(signUpResponse.statusCode).to.equal(403);
    });

    it('should not accept weak passwords', async () => {
        const shortPassResponse = await testWeakPassword(app, 'pass42');
        expect(shortPassResponse.statusCode).to.equal(400);

        const noUppercaseResponse = await testWeakPassword(app, 'nopuppercase42!');
        expect(noUppercaseResponse.statusCode).to.equal(400);

        const noLowercaseResponse = await testWeakPassword(app, 'NOPLOWERCASE42!');
        expect(noLowercaseResponse.statusCode).to.equal(400);

        const noSpecialResponse = await testWeakPassword(app, 'nOPLOWERCASE42');
        expect(noSpecialResponse.statusCode).to.equal(400);

        const commonPasswordResponse = await testWeakPassword(app, 'Password42!');
        expect(commonPasswordResponse.statusCode).to.equal(400);

        const commonPasswordResponse2 = await testWeakPassword(app, 'password42!');
        expect(commonPasswordResponse2.statusCode).to.equal(400);
    });
});