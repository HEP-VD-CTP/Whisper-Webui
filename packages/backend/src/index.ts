import Fastify  from 'fastify';

import fastifyCookie from '@fastify/cookie';


import logger from 'src/lib/logger.ts';

import {
  fastifyTRPCPlugin,
  FastifyTRPCPluginOptions,
} from '@trpc/server/adapters/fastify';

import { appRouter, type AppRouter } from 'src/trpc/router.ts';
import { createContext } from 'src/trpc/context.ts';

import DAO from '@whisper-webui/lib/src/db/dao.ts';

const PORT: number = 9000;

const app = Fastify({ logger: false });
 
// START KYSELY TEST
import { sql } from 'kysely';
import { db } from '@whisper-webui/lib/src/db/db2.ts';

/*const x = await db.selectFrom('users')
                  .where('id', '=', Buffer.from('67AB6A844104D822774D656E', 'hex'))
                  .selectAll() 
                  .executeTakeFirst(); 
               
console.log(x);*/

await DAO.users.update(`67AB6A844104D822774D656E`, { firstname: `AL`, lastname: `GEH` });
  

// END KYSELY TEST



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

app.addHook('preHandler', async (request, reply) => {});
app.addHook('onResponse', async (request, reply) => {});

try {
  await app.listen({ host:`0.0.0.0`, port: PORT });
  logger.info(`startup`, `Backend is listening on port ${PORT} in ${process.env.NODE_ENV} mode`);
} catch (err) {
  
  logger.error('startup', 'Backend failed to start', err instanceof Error ? err : new Error(String(err)));
  process.exit(1);
}


// to-do: log 
process.on('uncaughtException', (error) => {
  logger.error('uncaughtException', 'Uncaught Exception', error);
});
process.on('unhandledRejection', (reason, promise) => {
  logger.error('unhandledRejection', 'Unhandled Rejection', reason instanceof Error ? reason : new Error(String(reason)));
});