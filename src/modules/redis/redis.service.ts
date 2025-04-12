import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { RedisClientType, createClient } from 'redis';
@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  public redisClient: RedisClientType;
  private redisConnected: boolean;
  //it run After all providers in the module are initialized
  constructor() {}
  async onModuleInit() {
    this.redisClient = createClient({ url: 'redis://redis:6379' });

    this.redisClient.on('error', (err) => {
      console.log(err);
      throw new Error('redis not connected');
    });

    this.redisClient.on('connect', () => {
      this.redisConnected = true;
      console.log('Redis connected successfully');
    });

    await this.redisClient.connect();
  }
  async onModuleDestroy() {
    if (this.redisClient) await this.redisClient.quit();
  }

  getRedisClient() {
    if (!this.redisConnected) throw new Error('redis not connected');
    return this.redisClient;
  }

  async setCache(key: string, ttl: number, value: string) {
    await this.redisClient.setEx(key, ttl, value);
  }

  async getCache(key: string) {
    return this.redisClient.get(key);
  }
}
