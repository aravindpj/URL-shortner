import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { Request } from 'express';

@Controller('analytics')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}
  @Get('/:alias')
  @UseGuards(AuthGuard)
  async getUrlAnalyticsByAlias(@Param('alias') alias: string) {
    const doc = await this.analyticsService.getUrlAnalyticsByAlias(alias);
    return {
      status: true,
      message: 'success',
      doc,
    };
  }
  @Get('/topic/:topic')
  @UseGuards(AuthGuard)
  async getUrlAnalyticsByTopic(@Param('topic') topic: string) {
    const doc = await this.analyticsService.getUrlAnalyticsByTopic(topic);
    return {
      status: true,
      message: 'success',
      doc,
    };
  }
  @Get('user/overall')
  @UseGuards(AuthGuard)
  async getUrlAnalyticsOverall(@Req() req: Request) {
    const user = req.user?._id as string;
    const doc = await this.analyticsService.getUrlAnalyticsOverall(user);
    return {
      status: true,
      message: 'success',
      doc,
    };
  }
}
