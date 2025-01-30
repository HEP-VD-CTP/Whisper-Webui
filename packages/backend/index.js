import Fastify from 'fastify';

const fastify = Fastify({ logger: true });

// Declare a route
fastify.get('/hello', async (request, reply) => {
  return { message: 'Hello World' };
});

// Run the server!
async function start() {
  try {
    await fastify.listen({ host:`0.0.0.0`, port: 3000 });
    console.log('Server is listening on port 3000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();