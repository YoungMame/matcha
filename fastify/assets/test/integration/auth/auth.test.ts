import chai from 'chai';
const expect = chai.expect;
import { buildApp } from '../../../srcs/app';
import { FastifyInstance } from 'fastify';

// import fixtures
import { signUpAndGetToken, UserData } from '../../integration/fixtures/auth.fixtures';

describe('Auth Integration Tests', () => {
    let app: FastifyInstance;

    beforeEach(async () => {
        app = buildApp();
        await app.ready();
    });
    
    afterEach(async () => {
        await app.close();
    });

    it('should sign up a new user', async () => {
        const userData: UserData = {
            username: 'testuser1',
            email: 'testuser1@example.com',
            password: 'Password123!',
            bornAt: '2000-01-01',
            orientation: 'heterosexual',
            gender: 'men'
        };

        const token = await signUpAndGetToken(app, userData);

        expect(token).to.be.a('string');
    });

    it('should not create duplicated username', async () => {
        const userData: UserData = {
            username: 'testuser2',
            email: 'testuser2@example.com',
            password: 'Password123!',
            bornAt: '2000-01-01',
            orientation: 'heterosexual',
            gender: 'men'
        };

        const token = await signUpAndGetToken(app, userData);
        expect(token).to.be.a('string');

        const duplicatedUsernameData: UserData = {
            username: 'testuser2',
            email: 'testuser2notduplicate@example.com',
            password: 'Password123!',
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
});