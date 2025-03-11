import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './databases/database.module';
import { UrlModule } from './modules/url/url.module';
import { RedisModule } from './redis/redis.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    UrlModule,
    RedisModule,
    AnalyticsModule,
  ],
})
export class AppModule {}
