import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Module({
  imports: [
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
  ],
})
export class DatabaseModule {}
