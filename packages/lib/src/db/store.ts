import IORedis from 'ioredis'

import { type User } from '@whisper-webui/lib/src/types/kysely.ts'

// @ts-ignore 
const redis = new IORedis({
  host: 'whisper-webui-redis',
  port: 6379,
})

// Store a session in redis with a given expiry time, by default 1 day.
async function createSession(sessionId: string, sessionData: User, expSeconds: number = 86400): Promise<string> {
  const key = `session:${sessionId}`
  return await redis.set(key, JSON.stringify(sessionData), 'EX', expSeconds)
}

async function getSession(sessionId: string) : Promise<User> {
  return JSON.parse(await redis.get(`session:${sessionId}`))
}

async function extendSession(sessionId: string, expSeconds: number): Promise<string> {
  return await redis.expire(`session:${sessionId}`, expSeconds)
}

async function deleteSession(sessionId: string): Promise<string> {
  return await redis.del(`session:${sessionId}`)
}

async function set(key: string, value: any): Promise<string> {
  return await redis.set(key, JSON.stringify(value))
}

async function get(key: string): Promise<any> {
  return await redis.get(key)
}

export default {
  createSession,
  getSession,
  extendSession,
  deleteSession,
  set,
  get
}