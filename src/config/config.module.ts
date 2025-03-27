import { BullModule } from '@nestjs/bull';
import { Module, Logger } from '@nestjs/common';
import {
  ConfigModule as NestConfigModule,
  ConfigService,
} from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { createClient } from 'redis';
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
    }),

    //MONGO DB CONNECTION
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

    //Bull MQ connection

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

    //JWT

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
  ],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: async () => {
        const client = createClient({ url: 'redis://redis:6379' });

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
export class ConfigModule {}
