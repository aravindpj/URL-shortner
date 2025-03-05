import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Url } from './entities/url.entities';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { customAlphabet } from 'nanoid';
import { Request } from 'express';
import { RedisClientType } from 'redis';

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

    const existingShortId = await this.urlModel.findOne({ shortId: shortId });

    if (existingShortId)
      throw new BadRequestException(
        'Custom alias already exist. Please choose different one.',
      );
    const newUrlDoc = await this.urlModel.create({ ...urlPayload, shortId });

    const shortUrl = `${req.protocol}://${req.get('host')}/url/${newUrlDoc.shortId}`;

    return { shortUrl, createdAt: newUrlDoc.createdAt };
  }

  async GetRedirectUrl(shortId: string) {
    const result = await this.urlModel
      .findOne({ shortId: shortId })
      .select('longUrl');
    if (!result) return null;
    return result?.longUrl;
  }
}
