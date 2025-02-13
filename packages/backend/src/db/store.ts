import IORedis from 'ioredis';

// @ts-ignore 
const redis = new IORedis({
  host: 'whisper-webui-redis',
  port: 6379,
});

const sessionPrefix: string = 'session:';

async function set(key: string, value: any): Promise<string> {
  return await redis.set(key, JSON.stringify(value));
}

async function get(key: string): Promise<any> {
  return await redis.get(key);
}

export default {
  set,
  get
};