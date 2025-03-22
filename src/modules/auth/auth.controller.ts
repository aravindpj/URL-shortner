import { Body, Controller, Post } from '@nestjs/common';
import { UserCreateDto } from './dto/userCreateDto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signUp(@Body() userCreateDto: UserCreateDto) {
    const result = await this.authService.signUp(userCreateDto);
    return result;
  }
}
