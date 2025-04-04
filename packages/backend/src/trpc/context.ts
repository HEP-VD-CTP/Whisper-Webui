import { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify'

import { User } from '@whisper-webui/lib/src/types/kysely.ts'

export function createContext({ req, res }: CreateFastifyContextOptions) {
  let user: User | null = null
  return { 
    req, 
    res, 
    user
  }
}

//export type Context = Awaited<ReturnType<typeof createContext>>;
export type Context = {
  req: CreateFastifyContextOptions['req']
  res: CreateFastifyContextOptions['res']
  user: User | null
}