import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Url, UrlSchema } from './entities/url.entities';
import { UrlController } from './url.controller';
import { UrlService } from './url.service';
import { AnalyticsModule } from '../analytics/analytics.module';
import { AuthModule } from '../auth/auth.module';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Url.name,
        schema: UrlSchema,
      },
    ]),
    RedisModule,
    AnalyticsModule,
    AuthModule,
  ],
  controllers: [UrlController],
  providers: [UrlService],
  exports: [UrlService],
})
export class UrlModule {}
