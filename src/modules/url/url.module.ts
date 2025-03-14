import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Url, UrlSchema } from './entities/url.entities';
import { UrlController } from './url.controller';
import { UrlService } from './url.service';
import { AnalyticsModule } from '../analytics/analytics.module';
import { ConfigModule } from 'src/config/config.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Url.name,
        schema: UrlSchema,
      },
    ]),

    //Using other modules we have to import it in our case custom module REDIS_CLIENT (provider

    ConfigModule,
    AnalyticsModule,
  ],
  controllers: [UrlController],
  providers: [UrlService],
})
export class UrlModule {}
