import Fastify  from 'fastify';

import mercurius from 'mercurius';

const app = Fastify({ logger: false });

import service from 'src/db/service.ts';
import lib from 'src/lib/index.ts';
import resolvers from 'graphql/resolvers.ts';
import { User, insertUser } from "src/db/types.ts";
import depthLimit from 'graphql-depth-limit';

import { schema } from "graphql/graphql.ts";

import logger from 'src/lib/logger.ts';

const loaders = {

}

app.register(mercurius, {
  schema,
  resolvers,
  loaders,
  graphiql: process.env.NODE_ENV == 'development', // enable graphiql in development
  cache: true,
  validationRules: [depthLimit(5)], 
  errorFormatter: (err, ctx) => {
    // to-do: handle errors properly
    const response = mercurius.defaultErrorFormatter(err, ctx)      

    for (let i = 0; i < err.errors.length; i++){
      const error = err.errors[i];
      
      if (error.message.includes('Graphql validation error') || 
          error.message.includes('InvalidRequestException')){
        response.response.errors[i]["status"] = 400;
        response.response.errors[i]["error"]  = 'Bad Request';
      }
      else if (error.message.includes('ForbiddenException')){
        response.response.errors[i]["status"] = 403;
        response.response.errors[i]["error"]  = 'Forbidden';
      }
      else if (error.message.includes('NotFoundException')){
        response.response.errors[i]["status"] = 404;
        response.response.errors[i]["error"]  = 'Not Found';
      }
      else if (error.message.includes('ConflictException')){
        response.response.errors[i]["status"] = 409;
        response.response.errors[i]["error"]  = 'Conflict';
      }
      else {
        logger.error('graphql', error.message, error);
        response.response.errors[i]["status"] = 500;
        response.response.errors[i]["error"]  = 'INTERNAL SERVER ERROR';
      }
    }
    
    // we keep the highest status code
    response.statusCode = 200;
    for (const error of response.response.errors)
      if ((error as any).status > response.statusCode)
        response.statusCode = (error as any).status;
    
    return response;
  }
});

// Declare a route
app.get('/hello', async (request, reply) => {
  console.log(`hello route called`);
  return { message: 'Hello World 2' };
});

app.addHook('preHandler', async (request, reply) => {});
app.addHook('onResponse', async (request, reply) => {});

try {
  await app.listen({ host:`0.0.0.0`, port: parseInt(process.env.BACKEND_HTTP_PORT) });
  logger.info(`startup`, `Backend is listening on port ${process.env.BACKEND_HTTP_PORT} in ${process.env.NODE_ENV} mode`);
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