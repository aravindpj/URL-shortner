/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Process, Processor } from '@nestjs/bull';
import { ANALYTICS_QUEUE, CLICK_TRACK } from './analytics-constants';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Analytics } from '../entities/analytics.entities';
import { Job } from 'bull';
import { UrlService } from 'src/modules/url/url.service';

@Processor(ANALYTICS_QUEUE)
export class AnalyticsProcessor {
  constructor(
    @InjectModel(Analytics.name) private AnalyticsModel: Model<Analytics>,
    private urlService: UrlService,
  ) {}
  @Process(CLICK_TRACK)
  async handleTrackVisit(job: Job) {
    try {
      const data = job.data;

      const { alias }: { alias: string } = data;

      const user = await this.urlService.getUrlCreatedUser(alias);

      data.createdBy = user?.user ? user.user : undefined;

      if (typeof data.createdBy === 'string') {
        data.createdBy = new Types.ObjectId(data.createdBy);
      }
      await this.AnalyticsModel.create(data);

      return { success: true };
    } catch (err) {
      console.log(err);
    }
  }
}
