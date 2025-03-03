import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './databases/database.module';

@Module({
  imports: [ConfigModule, DatabaseModule],
})
export class AppModule {}
