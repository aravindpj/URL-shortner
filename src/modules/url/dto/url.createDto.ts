import { IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateUrlDto {
  @IsUrl()
  longUrl: string;
  @IsString()
  topic: string;
  @IsString()
  protocol: string;
  @IsString()
  @IsOptional()
  alias: string;
  @IsString()
  host: string;
  @IsString()
  @IsOptional()
  user: string;
}
