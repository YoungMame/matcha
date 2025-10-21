// Require the framework and instantiate it

// ESM
import Fastify from 'fastify'
import {Pool} from 'pg';

const pool = new Pool();
console.log('PostgreSQL Pool created:', pool.options);
pool.connect().then(client => {
  console.log('Connected to PostgreSQL database');
  console.log('PostgreSQL Client Info:', client.escapeIdentifier);
  client.release();
}).catch(err => {
  console.error('Error connecting to PostgreSQL database:', err);
});

// CommonJs
const fastify = require('fastify')({
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
  // Server is now listening on ${address}
});