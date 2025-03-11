import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
import { createClient } from 'redis';

@Module({
  imports: [
    BullModule.forRootAsync({
      useFactory: () => {
        return {
          redis: {
            host: 'localhost',
            port: 6379,
          },
        };
      },
    }),
  ],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: async () => {
        const client = createClient({});

        client.on('error', (err) => {
          console.error(err);
        });

        client.on('connect', () => {
          console.log('Redis connected');
        });

        await client.connect();

        return client;
      },
      // inject: [ConfigService],
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisModule {}
