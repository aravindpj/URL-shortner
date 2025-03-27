/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Analytics } from './entities/analytics.entities';
import { Model } from 'mongoose';

import { addDays, setEndOfDay } from 'src/common/utils/date-utils';
import { Types } from 'mongoose';

@Injectable()
export class AnalyticsService {
  protected seventhDayBefore = setEndOfDay(addDays(new Date(), 7));
  constructor(
    @InjectModel(Analytics.name) private AnalyticsModel: Model<Analytics>,
  ) {}
  protected getClickByDate(date: Date) {
    return [
      {
        $match: {
          createdAt: {
            $gte: date,
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
    ];
  }
  protected getOsType() {
    return [
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
    ];
  }

  protected getDeviceType() {
    return [
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
    ];
  }
  async getUrlAnalyticsByAlias(alias: string) {
    const [totalClicks, analytics] = await Promise.all([
      this.AnalyticsModel.countDocuments({ alias }),
      this.AnalyticsModel.aggregate([
        {
          $match: { alias: alias },
        },
        {
          $facet: {
            clickByDate: this.getClickByDate(this.seventhDayBefore),
            osType: this.getOsType(),
            deviceType: this.getDeviceType(),
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
            clickByDate: this.getClickByDate(this.seventhDayBefore),
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
          clickByDate: this.getClickByDate(this.seventhDayBefore),
          osType: this.getOsType(),
          deviceType: this.getDeviceType(),
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
