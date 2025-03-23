import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AuthGuard } from 'src/common/guards/auth.guard';

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
  @Get('/overall')
  @UseGuards(AuthGuard)
  async getUrlAnalyticsOverall() {
    const doc = await this.analyticsService.getUrlAnalyticsOverall();
    return {
      status: true,
      message: 'success',
      doc,
    };
  }
}
