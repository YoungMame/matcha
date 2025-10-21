// Require the framework and instantiate it

// ESM
import Fastify from 'fastify'

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