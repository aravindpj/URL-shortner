import { Controller, Get, Param } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}
  @Get('/:alias')
  async getUrlAnalyticsByAlias(@Param('alias') alias: string) {
    const doc = await this.analyticsService.getUrlAnalyticsByAlias(alias);
    return {
      status: true,
      message: 'success',
      doc,
    };
  }
  @Get('/topic/:topic')
  async getUrlAnalyticsByTopic(@Param('topic') topic: string) {
    const doc = await this.analyticsService.getUrlAnalyticsByTopic(topic);
    return {
      status: true,
      message: 'success',
      doc,
    };
  }
  @Get('/overall')
  async getUrlAnalyticsOverall() {
    const doc = await this.analyticsService.getUrlAnalyticsOverall();
    return {
      status: true,
      message: 'success',
      doc,
    };
  }
}
