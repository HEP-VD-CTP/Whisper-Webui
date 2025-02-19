import { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify';

export function createContext({ req, res }: CreateFastifyContextOptions) {
  let user = null;
  return { req, res, user };
}
export type Context = Awaited<ReturnType<typeof createContext>>;