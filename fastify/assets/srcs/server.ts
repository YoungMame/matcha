import buildApp from './app';

const fastify = buildApp();

// Run the server! 
fastify.listen({ port: 3000, host: '0.0.0.0' }, function (err: any, address: any) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  // Server is now listening on ${address}
});