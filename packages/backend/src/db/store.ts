import IORedis from 'ioredis';

import { User } from 'src/db/types.ts';

// @ts-ignore 
const redis = new IORedis({
  host: 'whisper-webui-redis',
  port: 6379,
});

// store a session in redis with a given expiry time, by default 1 day
async function createSession(sessionId: string, sessionData: User, expSeconds: number = 86400): Promise<string> {
  const key = `session:${sessionId}`;
  return await redis.set(key, JSON.stringify(sessionData), 'EX', expSeconds);
}

async function getSession(sessionId: string) : Promise<User> {
  return JSON.parse(await redis.get(`session:${sessionId}`));
}

async function extendSession(sessionId: string, expSeconds: number): Promise<string> {
  return await redis.expire(`session:${sessionId}`, expSeconds);
}

async function set(key: string, value: any): Promise<string> {
  return await redis.set(key, JSON.stringify(value));
}

async function get(key: string): Promise<any> {
  return await redis.get(key);
}

export default {
  createSession,
  getSession,
  extendSession,
  set,
  get
};