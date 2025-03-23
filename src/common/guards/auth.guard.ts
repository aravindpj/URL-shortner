import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from 'src/modules/auth/auth.service';
import { Request as ExpressRequest } from 'express';
import { Reflector } from '@nestjs/core';
import { PUBLIC_KEY } from '../decorators/public.decorator';

interface JwtPayload {
  id: string;
}
interface Request extends ExpressRequest {
  user?: any;
}
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwt: JwtService,
    private authService: AuthService,
    private reflactor: Reflector,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflactor.getAllAndOverride<boolean>(PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const req = context.switchToHttp().getRequest<Request>();

    const authHeader = req.headers.authorization;

    const [type = '', access_token = ''] = (authHeader ?? '').split(' ');

    if (isPublic && !authHeader) {
      req.user = null;
      return true;
    }

    if (!access_token || type !== 'Bearer')
      throw new UnauthorizedException('Token is missing');

    const user = await this.validateToken(access_token);

    if (!user) return false;

    req.user = user;

    return true;
  }

  protected async validateToken(access_token: string) {
    const decoded = await this.jwt.verifyAsync<JwtPayload>(access_token);

    const user = await this.authService.getUser(decoded.id);
    return user;
  }
}
