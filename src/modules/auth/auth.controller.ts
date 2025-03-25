import { Body, Controller, Post } from '@nestjs/common';
import { UserCreateDto } from './dto/user.CreateDto';
import { AuthService } from './auth.service';
import { UserLoginDto } from './dto/user.LoginDto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signUp(@Body() userCreateDto: UserCreateDto) {
    const result = await this.authService.signUp(userCreateDto);
    return result;
  }

  @Post('login')
  async login(@Body() userLoginDto: UserLoginDto) {
    const result = await this.authService.login(userLoginDto);
    return result;
  }
}
