import { createClient, RedisClientType } from 'redis';

let redisClient: RedisClientType | null = null;

export const initializeRedis = async () => {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

  try {
    redisClient = createClient({
      url: redisUrl,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 3) {
            console.warn('⚠️  Redis connection failed after 3 retries');
            return new Error('Max retries reached');
          }
          return retries * 100;
        },
      },
    });

    redisClient.on('error', (err: Error) => {
      // Only log once, don't spam console
      if (err.message.includes('ECONNREFUSED')) {
        console.error('Redis connection refused - is Redis running?');
      }
    });

    redisClient.on('connect', () => console.info('Redis connected'));

    await redisClient.connect();
  } catch (error) {
    console.warn('Redis not available - running without cache');
    redisClient = null;
    // Don't throw, let the app continue without Redis
  }
};

export const getRedisClient = (): RedisClientType => {
  if (!redisClient) {
    throw new Error('Redis client not initialized');
  }
  return redisClient;
};
