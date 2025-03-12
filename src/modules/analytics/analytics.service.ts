import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Analytics } from './entities/analytics.entities';
import { Model } from 'mongoose';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(Analytics.name) private AnalyticsModel: Model<Analytics>,
    @InjectQueue('analytics') private analyticsQueue: Queue,
  ) {}

  async queueTrackVisit(analyticsInfo: any) {
    await this.analyticsQueue.add('track-visit', analyticsInfo, {
      attempts: 3, // Retry up to 3 times if fails
      backoff: {
        type: 'exponential',
        delay: 1000, // Initial delay before retry (1 second)
      },
    });
  }

  async trackVisit(analyticsInfo: any) {
    return this.AnalyticsModel.create(analyticsInfo);
  }
}
