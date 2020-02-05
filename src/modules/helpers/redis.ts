import * as Redis from 'ioredis';
class RedisInstance {
  redis;
  defaultExpiry = 60 * 60 * 4; // 4 hours
  constructor() {
    this.redis = new Redis(process.env.REDIS_URL, {
      keyPrefix: process.env.REDIS_PREFIX,
    });
  }

  async set(
    key: string,
    value: string,
    exp: number = this.defaultExpiry,
  ): Promise<void> {
    await this.redis.set(key, value, 'EX', exp);
  }

  async get(key: string): Promise<string> {
    return await this.redis.get(key);
  }

  async del(key: string): Promise<void> {
    return await this.redis.del(key);
  }

  async deletePattern(pattern: string): Promise<void> {
    const prefix: string = process.env.REDIS_PREFIX;
    return new Promise((resolve, reject) => {
      const stream = this.redis.scanStream({
        match: prefix + pattern,
        count: 10,
      });
      stream.on('data', resultKeys => {
        resultKeys.map(key => {
          this.redis.del(key.split(':')[1]);
        });
      });
      stream.on('end', () => {
        resolve();
      });
    });
  }
}

export default new RedisInstance();
