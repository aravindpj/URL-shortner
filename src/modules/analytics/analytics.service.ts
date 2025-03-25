/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Analytics } from './entities/analytics.entities';
import { Model } from 'mongoose';

import { addDays, setEndOfDay } from 'src/common/utils/date-utils';
import { Types } from 'mongoose';
// import { Type } from 'class-transformer';

@Injectable()
export class AnalyticsService {
  protected seventhDayBefore = setEndOfDay(addDays(new Date(), 7));
  constructor(
    @InjectModel(Analytics.name) private AnalyticsModel: Model<Analytics>,
  ) {}

  async getUrlAnalyticsByAlias(alias: string) {
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
                    $gte: this.seventhDayBefore,
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
  }

  async getUrlAnalyticsByTopic(topic: string) {
    const [totalClicks, analytics] = await Promise.all([
      this.AnalyticsModel.countDocuments({ topic }),
      this.AnalyticsModel.aggregate([
        {
          $match: {
            topic: topic,
          },
        },
        {
          $facet: {
            clickByDate: [
              {
                $match: {
                  createdAt: {
                    $gte: this.seventhDayBefore,
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
                },
              },
              {
                $sort: { uniqueClicks: -1 },
              },
            ],
            urls: [
              {
                $group: {
                  _id: '$alias',
                  count: { $sum: 1 },
                },
              },
              {
                $project: {
                  shortUrl: {
                    $concat: [
                      'http://localhost:3000/url/',
                      { $toString: '$_id' },
                    ],
                  },
                  uniqueClicks: '$count',
                },
              },
              {
                $sort: { uniqueClicks: -1 },
              },
            ],
          },
        },
      ]),
    ]);
    const { clickByDate, urls } = analytics[0];
    return {
      totalClicks,
      clickByDate,
      urls,
    };
  }

  async getUrlAnalyticsOverall(user: string) {
    const doc = await this.AnalyticsModel.aggregate([
      {
        $match: {
          createdBy: new Types.ObjectId(user),
        },
      },
      {
        $facet: {
          totalUrls: [
            {
              $group: {
                _id: '$alias',
              },
            },
            {
              $count: 'total',
            },
          ],
          totalCount: [
            {
              $count: 'totalClicks',
            },
          ],
          clickByDate: [
            {
              $match: {
                createdAt: { $gte: this.seventhDayBefore },
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
                totalClicks: '$count',
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
                os: '$_id',
                totalClicks: '$count',
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
                deviceName: '$deviceName',
                totalClicks: '$count',
              },
            },
          ],
        },
      },
      {
        $project: {
          allUrlTotalClicks: {
            $arrayElemAt: ['$totalCount.totalClicks', 0],
          },
          totalUrls: {
            $arrayElemAt: ['$totalUrls.total', 0],
          },
          clickByDate: 1,
          osType: 1,
          deviceType: 1,
        },
      },
    ]);

    return { doc };
  }
}
