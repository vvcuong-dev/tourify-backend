import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { redisConfig } from '../../configs/redis.config';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: RedisClientType;

  constructor() {
    this.client = createClient();
  }

  async onModuleInit() {
    const url = `redis://${redisConfig.host}:${redisConfig.port}`;
    this.client = createClient({
      url: url,
    });

    this.client.on('error', (err) => console.error('Redis Client Error', err));

    await this.client.connect();
    console.log('Redis client connected');
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  getClient(): RedisClientType {
    return this.client;
  }
}
