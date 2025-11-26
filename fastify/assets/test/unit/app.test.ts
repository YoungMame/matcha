import { app } from '../setup';
import { expect } from 'chai';
import { describe, it, before, after } from 'mocha';

describe('API basic tests', () => {

    it("should create the app instance", () => {
        expect(app).to.exist;
    });

    it('should return hello world', async () => {
        const response = await app.inject({
            method: 'GET',
            url: '/api/hello'
        });

        expect(response.statusCode).to.equal(200);
        const payload = JSON.parse(response.payload);
        expect(payload).to.deep.equal({ hello: 'world', status: 'ok' });
    });
});