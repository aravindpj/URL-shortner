import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Analytics } from './entities/analytics.entities';
import { Model } from 'mongoose';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(Analytics.name) private AnalyticsModel: Model<Analytics>,
  ) {}

  async trackAnalytics(analyticsInfo) {
    return await this.AnalyticsModel.create(analyticsInfo);
  }
}
