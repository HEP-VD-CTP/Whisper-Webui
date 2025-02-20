import { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify';

import { User } from '@whisper-webui/lib/src/types/types.ts';

export function createContext({ req, res }: CreateFastifyContextOptions) {
  let user: User | null = null;
  return { 
    req, 
    res, 
    user
  };
}
export type Context = Awaited<ReturnType<typeof createContext>>;