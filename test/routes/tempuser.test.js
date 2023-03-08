const request = require('supertest');
const app = require('../../server.js');

describe('GET /', () => {
    it('should return info about the api', async () => {
        const res = await request(app)
        .get('/')
        expect(res.statusCode).toBe(200);
    });
});

describe('GET /join', () => {
    let agent; // Declare a variable to store the agent
    beforeAll(async () => {
        agent = request.agent(app); // Create a new agent for the app
    });
    it('should create a temporary user', async () => {
        const res = await agent.get('/tempuser/join');
        expect(res.statusCode).toBe(201);
        expect(res.body.username.length).toBeGreaterThan(0);
    });
    it('should tell me the temporary user is already created', async () => {
        const res = await agent.get('/tempuser/join');
        expect(res.statusCode).toBe(200);
        expect(res.body.username.length).toBeGreaterThan(0);
    });
});

describe('GET /info', () => {
    let agent; // Declare a variable to store the agent
    beforeAll(async () => {
        agent = request.agent(app); // Create a new agent for the app
    });
    it('should redirect to /join', async () => {
        const res = await agent.get('/tempuser/info');
        expect(res.statusCode).toBe(302);
    });
    it('should create a temporary user', async () => {
        const res = await agent.get('/tempuser/join');
        expect(res.statusCode).toBe(201);
        expect(res.body.username.length).toBeGreaterThan(0);
    });
    it('should return info about the temporary user', async () => {
        const res = await agent.get('/tempuser/info');
        expect(res.statusCode).toBe(200);
        expect(res.body.username.length).toBeGreaterThan(0);
    });
});
