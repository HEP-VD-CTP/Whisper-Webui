import { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify';

import { UserWithoutPassword } from '@whisper-webui/lib/src/types/kysely.ts';

export function createContext({ req, res }: CreateFastifyContextOptions) {
  let user: UserWithoutPassword | null = null;
  return { 
    req, 
    res, 
    user
  };
}

//export type Context = Awaited<ReturnType<typeof createContext>>;
export type Context = {
  req: CreateFastifyContextOptions['req'];
  res: CreateFastifyContextOptions['res'];
  user: UserWithoutPassword | null;
};