import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Analytics } from './entities/analytics.entities';
import { Model } from 'mongoose';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import {
  addDays,
  setEndOfDay,
  setStartOfDay,
} from 'src/common/utils/date-utils';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(Analytics.name) private AnalyticsModel: Model<Analytics>,
    @InjectQueue('analytics') private analyticsQueue: Queue,
  ) {}
  async getUrlAnalyticsByAlias(alias) {
    // const totalClicks = await this.AnalyticsModel.countDocuments({ alias });

    const currentDateStart = setStartOfDay(new Date()); // Today's start
    const seventhDayEnd = setEndOfDay(addDays(new Date(), 7));
    try {
      const [totalClicks, analytics] = await Promise.all([
        this.AnalyticsModel.countDocuments({ alias }),
        this.AnalyticsModel.aggregate([
          {
            $match: { alias: alias },
          },
          {
            $facet: {
              clickByDate: [
                {
                  $match: {
                    createdAt: {
                      $gte: currentDateStart,
                      $lte: seventhDayEnd,
                    },
                  },
                },
                {
                  $group: {
                    _id: {
                      $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
                    },
                    count: { $sum: 1 },
                  },
                },
                {
                  $project: {
                    date: '$_id',
                    uniqueClicks: '$count',
                    _id: 0,
                  },
                },
              ],
              osType: [
                {
                  $group: {
                    _id: '$osName',
                    count: { $sum: 1 },
                  },
                },
                {
                  $project: {
                    osName: '$_id',
                    uniqueClicks: '$count',
                    _id: 0,
                  },
                },
              ],
              deviceType: [
                {
                  $group: {
                    _id: '$deviceName',
                    count: { $sum: 1 },
                  },
                },
                {
                  $project: {
                    deviceName: '$_id',
                    uniqueClicks: '$count',
                  },
                },
              ],
            },
          },
        ]),
      ]);
      const { clickByDate, osType, deviceType } = analytics[0];
      return {
        totalClicks,
        clickByDate,
        osType,
        deviceType,
      };
    } catch (error) {
      console.log('ERROR', error);
      return { currentDateStart, seventhDayEnd };
    }
  }

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
