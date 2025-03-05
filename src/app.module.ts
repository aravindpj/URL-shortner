import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './databases/database.module';
import { UrlModule } from './modules/url/url.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [ConfigModule, DatabaseModule, UrlModule, RedisModule],
})
export class AppModule {}
