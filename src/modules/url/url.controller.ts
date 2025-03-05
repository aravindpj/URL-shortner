import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Redirect,
  Req,
} from '@nestjs/common';
import { UrlService } from './url.service';
import { CreateUrlDto } from './dto/url.createDto';
import { Request } from 'express';
@Controller('url')
export class UrlController {
  constructor(private urlService: UrlService) {}

  @Post('shorten')
  @HttpCode(201)
  async createShortUrl(
    @Body() createUrlDto: CreateUrlDto,
    @Req() req: Request,
  ) {
    const { shortUrl, createdAt } = await this.urlService.createShortUrl(
      req,
      createUrlDto,
    );
    return {
      message: 'Your short url ready to share',
      shortUrl,
      createdAt,
    };
  }

  @Get(':shortId')
  @Redirect()
  async GetRedirectUrl(@Param('shortId') shortId: string) {
    const originalUrl = await this.urlService.GetRedirectUrl(shortId);
    return { url: originalUrl, statusCode: 301 };
  }
}
