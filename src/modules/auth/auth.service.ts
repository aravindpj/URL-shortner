import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Users } from './entities/users.entities';
import { Model } from 'mongoose';
import { UserCreateDto } from './dto/user.CreateDto';
import { JwtService } from '@nestjs/jwt';
import { UserLoginDto } from './dto/user.LoginDto';

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

  async login(userPayload: UserLoginDto) {
    const { email, password } = userPayload;

    if (!email || !password) throw new BadRequestException(`not valid input`);

    const user = await this.usersModel
      .findOne({ email: email })
      .select('+password');

    if (!user || !(await user.checkPasswordIsCorrect(password))) {
      throw new BadRequestException(
        'you provided email or password is incorrect',
      );
    }
    user.password = '';
    const access_token = await this.jwt.signAsync({ id: user._id });

    return {
      access_token,
      user,
    };
  }
  async getUser(id: string) {
    const user = await this.usersModel.findById(id);
    return user;
  }
}
