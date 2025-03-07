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
import { Request } from 'express';
import { RedisClientType } from 'redis';
import { getUrlId } from 'src/common/utils/key';

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
  ) {}

  async createShortUrl(req: Request, urlPayload: Partial<Url>) {
    const shortId = urlPayload?.alias || this.generateNewId();
    const urlKey = getUrlId(shortId.toString());
    const existingShortId = await this.urlModel.findOne({ shortId: shortId });

    if (existingShortId)
      throw new BadRequestException(
        'Custom alias already exist. Please choose different one.',
      );
    const newUrlDoc = await this.urlModel.create({ ...urlPayload, shortId });

    await this.RedisClient.setEx(urlKey, 3600, newUrlDoc.longUrl);

    const shortUrl = `${req.protocol}://${req.get('host')}/url/${newUrlDoc.shortId}`;

    return { shortUrl, createdAt: newUrlDoc.createdAt };
  }

  async GetRedirectUrl(shortId: string) {
    const urlKey = getUrlId(shortId.toString());

    const cacheUrl = await this.RedisClient.get(urlKey);

    if (cacheUrl) {
      return cacheUrl;
    }

    const result = await this.urlModel
      .findOne({ shortId: shortId })
      .select('longUrl createdAt');

    if (!result) throw new NotFoundException('url not found');

    await this.RedisClient.setEx(urlKey, 3600, result.longUrl);

    return result?.longUrl;
  }
}
