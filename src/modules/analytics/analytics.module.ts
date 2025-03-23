import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Analytics, AnalyticsSchema } from './entities/analytics.entities';
import { BullModule } from '@nestjs/bull';
import { ANALYTICS_QUEUE } from './jobs/analytics-constants';
import { AnalyticsConsumer } from './jobs/analytics-consumer.service';
import { AnalyticsProcessor } from './jobs/analytics-processor';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Analytics.name, schema: AnalyticsSchema },
    ]),
    BullModule.registerQueue({
      name: ANALYTICS_QUEUE,
    }),
    AuthModule,
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService, AnalyticsConsumer, AnalyticsProcessor],
  exports: [AnalyticsConsumer],
})
export class AnalyticsModule {}
