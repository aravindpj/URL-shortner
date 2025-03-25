import { InjectQueue } from '@nestjs/bull';
import { ANALYTICS_QUEUE, CLICK_TRACK } from './analytics-constants';
import { Queue } from 'bull';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AnalyticsConsumer {
  constructor(@InjectQueue(ANALYTICS_QUEUE) private analyticsQueue: Queue) {}

  async queueTrackVisit(data) {
    return this.analyticsQueue.add(CLICK_TRACK, data, {
      attempts: 3, // Retry up to 3 times if fails
      backoff: {
        type: 'exponential',
        delay: 1000, // Initial delay before retry (1 second)
      },
    });
  }
}
