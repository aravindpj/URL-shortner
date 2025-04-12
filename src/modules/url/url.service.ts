import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Url } from './entities/url.entities';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { getUrlId } from 'src/common/utils/key';
import { CacheUrl } from './interfaces/url.cache';
import { AnalyticsInfo } from './interfaces/url.analytics';
import { CreateUrl } from './interfaces/url.create';
import { AnalyticsConsumer } from '../analytics/jobs/analytics-consumer.service';
import { RedisService } from '../redis/redis.service';
import { customAlphabet } from 'nanoid';

@Injectable()
export class UrlService {
  protected nanoid = customAlphabet(
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
    8,
  );
  private generateNewId = () => this.nanoid();
  constructor(
    private redisService: RedisService,
    private readonly analyticsConsumer: AnalyticsConsumer,
    @InjectModel(Url.name) private urlModel: Model<Url>,
  ) {}

  async createShortUrl(urlPayload: CreateUrl) {
    let shortId!: string;
    if (urlPayload.alias) {
      const existingAlias = await this.urlModel.findOne({
        shortId: urlPayload.alias,
      });
      if (existingAlias) {
        throw new BadRequestException(
          'Custom alias already exist. Please choose different one.',
        );
      }
      shortId = urlPayload.alias;
    } else {
      let attempt = 0;
      const maxAttempt = 5;
      // prevent infinity loop
      while (attempt < maxAttempt) {
        shortId = this.generateNewId();
        const exist = await this.urlModel.findOne({ shortId: shortId });

        if (!exist) break;

        attempt++;
      }
    }

    const urlKey = getUrlId(shortId.toString());

    const newUrlDoc = await this.urlModel.create({
      ...urlPayload,
      shortId,
    });
    await this.redisService.setCache(
      urlKey,
      3600,
      JSON.stringify({ longUrl: newUrlDoc.longUrl, topic: newUrlDoc.topic }),
    );

    const shortUrl = `${urlPayload.protocol}://${urlPayload.host}/url/${newUrlDoc.shortId}`;

    return { shortUrl, createdAt: newUrlDoc.createdAt };
  }

  async GetRedirectUrl(shortId: string, analyticsInfo: AnalyticsInfo) {
    const urlKey = getUrlId(shortId);

    const cacheUrl = await this.redisService.getCache(urlKey);
    if (cacheUrl) {
      const { longUrl, topic } = JSON.parse(cacheUrl) as CacheUrl;
      analyticsInfo.topic = topic;
      await this.analyticsConsumer.queueTrackVisit(analyticsInfo);
      return longUrl;
    }

    const urlDoc = await this.urlModel
      .findOne({ shortId: shortId })
      .select('longUrl topic')
      .lean();

    if (!urlDoc) throw new NotFoundException('URL not found');

    await this.redisService.setCache(urlKey, 3600, JSON.stringify(urlDoc));
    await this.analyticsConsumer.queueTrackVisit(analyticsInfo);

    return urlDoc.longUrl;
  }
  async getUrlCreatedUser(id: string) {
    return this.urlModel.findOne({ shortId: id });
  }
}
