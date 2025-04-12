import { Logger, Module } from '@nestjs/common';
import { UrlModule } from './modules/url/url.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { BullModule } from '@nestjs/bull';
import { JwtModule } from '@nestjs/jwt';
import { RedisModule } from './modules/redis/redis.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  //When you import ConfigModule here, you're making its exports available to the entire application
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const logger = new Logger('MongoDB');
        const uri = configService.get<string>('MONGODB_URI');

        return {
          uri,
          useNewUrlParser: true,
          useUnifiedTopology: true,
          onConnectionCreate: (connection: Connection) => {
            connection.on('connected', () =>
              logger.log(`MongoDB connected successfully`),
            );

            connection.on('error', () =>
              logger.log(`MongoDB connection Failed`),
            );

            return connection;
          },
        };
      },
    }),

    BullModule.forRootAsync({
      useFactory: () => {
        return {
          redis: {
            //Services can communicate using the service name as the hostname
            host: 'redis',
            port: 6379,
          },
        };
      },
    }),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: () => {
        return {
          secret: process.env.JWT_SECRET,
          signOptions: { expiresIn: '24h' },
        };
      },
      global: true,
      inject: [ConfigService],
    }),

    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 1000 * 60,
          limit: 10,
        },
      ],
    }),

    RedisModule,
    UrlModule,
    AnalyticsModule,
    AuthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
