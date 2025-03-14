import { Process, Processor } from '@nestjs/bull';
import { ANALYTICS_QUEUE, CLICK_TRACK } from './analytics-constants';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Analytics } from '../entities/analytics.entities';
import { Job } from 'bull';

@Processor(ANALYTICS_QUEUE)
export class AnalyticsProcessor {
  constructor(
    @InjectModel(Analytics.name) private AnalyticsModel: Model<Analytics>,
  ) {}
  @Process(CLICK_TRACK)
  async handleTrackVisit(job: Job) {
    try {
      await this.AnalyticsModel.create(job.data);

      return { success: true };
    } catch (err) {
      console.log(err);
    }
  }
}
