import { Process, Processor } from '@nestjs/bull';
import { AnalyticsService } from './analytics.service';
import { Job } from 'bull';

@Processor('analytics')
export class AnalyticsProcessor {
  constructor(private analyticsService: AnalyticsService) {}

  @Process('track-visit')
  async handleTrackVisit(job: Job) {
    return this.analyticsService.trackVisit(job.data);
  }
}
