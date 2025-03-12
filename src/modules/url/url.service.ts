import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Url } from './entities/url.entities';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { customAlphabet } from 'nanoid';
import { RedisClientType } from 'redis';
import { getUrlId } from 'src/common/utils/key';
import { AnalyticsService } from '../analytics/analytics.service';
import { CacheUrl } from './interfaces/url.cache';
import { AnalyticsInfo } from './interfaces/url.analytics';
import { CreateUrl } from './interfaces/url.create';

@Injectable()
export class UrlService {
  protected nanoid = customAlphabet(
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
    8,
  );
  private generateNewId = () => this.nanoid();

  constructor(
    @Inject('REDIS_CLIENT') private RedisClient: RedisClientType,
    @InjectModel(Url.name) private urlModel: Model<Url>,
    private analyticsService: AnalyticsService,
  ) {}

  async createShortUrl(urlPayload: CreateUrl) {
    const shortId = urlPayload?.alias || this.generateNewId();
    const urlKey = getUrlId(shortId.toString());
    const existingShortId = await this.urlModel.findOne({ shortId: shortId });

    if (existingShortId)
      throw new BadRequestException(
        'Custom alias already exist. Please choose different one.',
      );
    const newUrlDoc = await this.urlModel.create({ ...urlPayload, shortId });

    await this.RedisClient.setEx(
      urlKey,
      3600,
      JSON.stringify({ longUrl: newUrlDoc.longUrl, topic: newUrlDoc.topic }),
    );

    const shortUrl = `${urlPayload.protocol}://${urlPayload.host}/url/${newUrlDoc.shortId}`;

    return { shortUrl, createdAt: newUrlDoc.createdAt };
  }

  async GetRedirectUrl(shortId: string, analyticsInfo: AnalyticsInfo) {
    const urlKey = getUrlId(shortId);

    const cacheUrl = await this.RedisClient.get(urlKey);
    if (cacheUrl) {
      const { longUrl, topic } = JSON.parse(cacheUrl) as CacheUrl;
      analyticsInfo.topic = topic;
      await this.analyticsService.queueTrackVisit(analyticsInfo);
      return longUrl;
    }

    const urlDoc = await this.urlModel
      .findOne({ shortId: shortId })
      .select('longUrl topic')
      .lean();

    if (!urlDoc) throw new NotFoundException('URL not found');

    await this.RedisClient.setEx(urlKey, 3600, JSON.stringify(urlDoc));
    await this.analyticsService.queueTrackVisit(analyticsInfo);

    return urlDoc.longUrl;
  }
}
