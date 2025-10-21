// Require the framework and instantiate it

// ESM
import Fastify from 'fastify'
import { Client } from 'pg'
const client = new Client()
client.connect().then(() => {
  console.log('Connected to PostgreSQL database');
  console.log('PostgreSQL Client Info:', client.escapeIdentifier);
}).catch((err: any) => {
  console.error('Error connecting to PostgreSQL database:', err);
});

const fastify = Fastify({
  logger: true
});

// Declare a route
fastify.get('/api/hello', function (request: any, reply: any) {
  reply.send({ hello: 'world', status: 'ok' });
});

// Run the server! 
fastify.listen({ port: 3000, host: '0.0.0.0' }, function (err: any, address: any) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});