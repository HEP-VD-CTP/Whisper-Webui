import Fastify  from 'fastify';

import mercurius from 'mercurius';
import service from 'src/db/service.ts';
import lib from 'src/lib/index.ts';
import resolvers from 'src/graphql/resolvers.ts';
import { User, insertUser } from "src/db/types.ts";
import depthLimit from 'graphql-depth-limit';
import fastifyCookie from '@fastify/cookie';

import store from 'src/db/store.ts';

import { schema, errorFormatter } from "src/graphql/graphql.ts";

import logger from 'src/lib/logger.ts';

import {
  fastifyTRPCPlugin,
  FastifyTRPCPluginOptions,
} from '@trpc/server/adapters/fastify';

import { appRouter, type AppRouter } from '@whisper-webui/lib/src/trpc/router.ts';
import { createContext } from '@whisper-webui/lib/src/trpc/context.ts';
import { ForbiddenException } from './lib/exceptions.ts';


import { TRPCError } from '@trpc/server';
import { TRPCErrorResponse } from '@trpc/server/rpc';


const PORT: number = 9000;

const app = Fastify({ logger: false });

app.register(fastifyCookie);

// register trpc server
app.register(fastifyTRPCPlugin, {
  prefix: '/trpc',
  trpcOptions: {
    router: appRouter,
    createContext,
    onError({ path, error }) {
      console.error(`Error in tRPC handler on path '${path}': ${error}`);
    },
  } satisfies FastifyTRPCPluginOptions<AppRouter>['trpcOptions'],
});

app.register(mercurius, {
  schema,
  resolvers,
  loaders: {},
  graphiql: process.env.NODE_ENV == 'development', // enable graphiql in development
  cache: true,
  validationRules: [depthLimit(5)],
  errorFormatter
});

// Declare a route
app.get('/hello', async (request, reply) => {
  console.log(`hello route called`);
  return { message: 'Hello World 2' };
});

app.addHook('preHandler', async (request, reply) => {});
app.addHook('onResponse', async (request, reply) => {});

try {
  await app.listen({ host:`0.0.0.0`, port: PORT });
  logger.info(`startup`, `Backend is listening on port ${PORT} in ${process.env.NODE_ENV} mode`);
} catch (err) {
  logger.error('startup', 'Backend failed to start', err);
  process.exit(1);
}


// to-do: log 
process.on('uncaughtException', (error, y, z) => {
  logger.error('uncaughtException', 'Uncaught Exception', error);
});
process.on('unhandledRejection', (reason, promise) => {
  logger.error('unhandledRejection', 'Unhandled Rejection', reason instanceof Error ? reason : new Error(reason.toString()));
});