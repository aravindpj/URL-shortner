import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { UrlModule } from './modules/url/url.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  //When you import ConfigModule here, you're making its exports available to the entire application
  imports: [ConfigModule, UrlModule, AnalyticsModule, AuthModule],
})
export class AppModule {}
