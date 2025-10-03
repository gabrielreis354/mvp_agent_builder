import Redis from 'ioredis';

let redis: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redis) {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    
    redis = new Redis(redisUrl, {
      enableReadyCheck: false,
      maxRetriesPerRequest: null,
      lazyConnect: true,
      connectTimeout: 10000,
      commandTimeout: 5000,
    });

    redis.on('error', (error) => {
      console.error('Redis connection error:', error);
    });

    redis.on('connect', () => {
      console.log('Redis connected successfully');
    });

    redis.on('ready', () => {
      console.log('Redis ready for operations');
    });

    redis.on('close', () => {
      console.log('Redis connection closed');
    });
  }

  return redis;
}

export function closeRedisConnection(): void {
  if (redis) {
    redis.disconnect();
    redis = null;
  }
}

// Health check function
export async function checkRedisHealth(): Promise<boolean> {
  try {
    const client = getRedisClient();
    const result = await client.ping();
    return result === 'PONG';
  } catch (error) {
    console.error('Redis health check failed:', error);
    return false;
  }
}
