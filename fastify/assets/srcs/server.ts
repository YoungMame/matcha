import fastify from './app';

// Run the server! 
fastify.listen({ port: 3000, host: '0.0.0.0' }, function (err: any, address: any) {
  if (err) {
    console.log('Error starting server:', err);
    fastify.log.error(err);
    process.exit(1);
  }
  console.log(`server listening on ${address} and port 3000 for env ${process.env.NODE_ENV}`);
});