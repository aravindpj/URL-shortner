import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { UrlModule } from './modules/url/url.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';

@Module({
  //When you import ConfigModule here, you're making its exports available to the entire application
  imports: [ConfigModule, UrlModule, AnalyticsModule],
})
export class AppModule {}
