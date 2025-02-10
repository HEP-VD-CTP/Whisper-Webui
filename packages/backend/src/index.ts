import Fastify from 'fastify';
import mercurius from 'mercurius';

const app = Fastify({ logger: false });

import service from 'src/db/service.ts';
import lib from 'src/lib/index.ts';
import resolvers from 'graphql/resolvers.ts';
import { User, insertUser } from "src/db/types.ts";

import { schema } from "graphql/graphql.ts";

const loaders = {

}

app.register(mercurius, {
  schema,
  resolvers,
  loaders,
  graphiql: process.env.NODE_ENV == 'development', // enable graphiql in development
  cache: false,
  errorFormatter: (err, ctx) => {
    const response = mercurius.defaultErrorFormatter(err, ctx)      

    response.response.errors[0]["GEH"] = "coucou"

    response.statusCode = 500;

    return response
  }
});

const users: Array<User> = [

]


// Declare a route
app.get('/hello', async (request, reply) => {
  console.log(`hello route called`);
  return { message: 'Hello World 2' };
});

app.addHook('preHandler', async (request, reply) => {});
app.addHook('onResponse', async (request, reply) => {});

try {
  await app.listen({ host:`0.0.0.0`, port: parseInt(process.env.BACKEND_HTTP_PORT) });
  console.log(`Backend is listening on port ${process.env.BACKEND_HTTP_PORT} in ${process.env.NODE_ENV} mode`);
} catch (err) {
  console.error(err);
  process.exit(1);
}


