import Redis from 'ioredis'

let redis: Redis | null = null

// Função para criar conexão Redis
export function getRedisClient(): Redis {
  if (!redis) {
    redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0'),
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000)
        return delay
      },
      lazyConnect: true
    })

    redis.on('error', (err) => {
      console.error('❌ Redis Client Error:', err.message)
    })

    redis.on('connect', () => {
      console.log('✅ Redis conectado com sucesso')
    })

    redis.on('ready', () => {
      console.log('✅ Redis pronto para uso')
    })
  }

  return redis
}

// Testar conexão
export async function testRedisConnection(): Promise<boolean> {
  try {
    const client = getRedisClient()
    await client.ping()
    return true
  } catch (error) {
    console.error('❌ Erro ao conectar com Redis:', error)
    return false
  }
}

export default getRedisClient()
