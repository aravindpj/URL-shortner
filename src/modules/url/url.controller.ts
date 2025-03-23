import {
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  Param,
  Post,
  Redirect,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UrlService } from './url.service';
import { CreateUrlDto } from './dto/url.createDto';
import { Request } from 'express';
import { UAParser } from 'ua-parser-js';
import { AnalyticsInfoDto } from './dto/url.analyticsDto';
import { AuthGuard } from 'src/common/guards/auth.guard';
@Controller('url')
export class UrlController {
  constructor(private urlService: UrlService) {}

  @Post('shorten')
  @HttpCode(201)
  @UseGuards(AuthGuard)
  async createShortUrl(
    @Body() createUrlDto: CreateUrlDto,
    @Req() req: Request,
  ) {
    createUrlDto.topic = createUrlDto.topic ?? '';
    createUrlDto.protocol = req.protocol ?? '';
    createUrlDto.host = req.get('host') ?? '';
    createUrlDto.user = req.user?._id as string;

    const { shortUrl, createdAt } =
      await this.urlService.createShortUrl(createUrlDto);
    return {
      message: 'Your short url ready to share',
      shortUrl,
      createdAt,
    };
  }

  // @Public()
  @UseGuards(AuthGuard)
  @Get(':shortId')
  @Redirect()
  @Header('Cache-Control', 'no-store')
  async GetRedirectUrl(
    @Req() request: Request,
    @Param('shortId') shortId: string,
  ) {
    const userAgent = request.headers['user-agent'];
    const parser = new UAParser(userAgent);
    const userAgentInfo = parser.getResult();

    const analyticsInfo: AnalyticsInfoDto = {
      alias: shortId,
      ipAddress: request.ip ?? 'Unknown',
      osName: userAgentInfo.os.name ?? 'Unknown',
      deviceName: userAgentInfo.device.vendor ?? 'Unknown',
      browser: userAgentInfo.browser.name ?? 'Unknown',
      user: (request.user?._id as string) ?? '',
    };
    const originalUrl = await this.urlService.GetRedirectUrl(
      shortId,
      analyticsInfo,
    );
    return { url: originalUrl, statusCode: 301 };
  }
}
