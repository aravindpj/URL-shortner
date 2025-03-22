import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Users } from './entities/users.entities';
import { Model } from 'mongoose';
import { UserCreateDto } from './dto/userCreateDto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Users.name) private usersModel: Model<Users>,
    private jwt: JwtService,
  ) {}
  async signUp(userPayload: UserCreateDto) {
    const user = await this.usersModel.create(userPayload);
    const access_token = await this.jwt.signAsync({
      id: user._id,
    });
    user.password = '';
    return {
      access_token,
      user,
    };
  }
}
