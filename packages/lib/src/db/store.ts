import IORedis from 'ioredis'

import { type User } from '@whisper-webui/lib/src/types/kysely.ts'

// @ts-ignore 
const redis = new IORedis({
  host: 'whisper-webui-redis',
  port: 6379,
})
// @ts-ignore
const pubsubRedis = new IORedis({
  host: 'whisper-webui-redis',
  port: 6379,
})

// contains all the callbacks for each channel
const cbs: Record<string, Array<(message: string) => Promise<void>>> = {}

// check for incoming messages
pubsubRedis.on('message', (channel: string, message: string) => {
  // check if the channel exists and call all the callbacks
  if (cbs[channel]) 
    for (const cb of cbs[channel]) 
      cb(message).catch(err => console.error(err))
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

async function enqueue(queueName: string, value: string): Promise<void> {
  return await redis.lpush(`queue:${queueName}`, value)
}

async function dequeue(queueName: string, timeoutSeconds: number = 60): Promise<string|null> {
  const result = await redis.brpop(`queue:${queueName}`, timeoutSeconds)
  return result ? result[1] : null
}

async function publish(channel: string, message: string): Promise<number> {
  return await redis.publish(channel, message)
}

function subscribe(channel: string, cb: (message: string) => Promise<void>): void {
  // check if the channel is already subscribed
  if (!cbs[channel]) {
    pubsubRedis.subscribe(channel, (err, count) => {
      if (err) 
        console.error(`Failed to subscribe to channel:`, err)
    })
    cbs[channel] = []
  }

  // store the callback
  cbs[channel].push(cb)
}

export default {
  createSession,
  getSession,
  extendSession,
  deleteSession,
  set,
  get,
  enqueue,
  dequeue,
  publish,
  subscribe
}