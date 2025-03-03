import { IsString, IsUrl } from 'class-validator';

export class CreateUrlDto {
  @IsUrl()
  longUrl: string;
  @IsString()
  topic: string;
  @IsString()
  alias: string;
}
