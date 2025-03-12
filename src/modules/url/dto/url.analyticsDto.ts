import { IsOptional, IsString } from 'class-validator';

export class AnalyticsInfoDto {
  @IsString()
  alias: string;

  @IsString()
  ipAddress: string;

  @IsString()
  osName: string;

  @IsString()
  deviceName: string;

  @IsString()
  browser: string;

  @IsString()
  @IsOptional()
  topic?: string;
}
