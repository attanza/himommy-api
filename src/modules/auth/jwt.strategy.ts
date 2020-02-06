import { TocologistService } from '@modules/tocologist/tocologist.service';
import { IUser } from '@modules/user/user.interface';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PassportStrategy } from '@nestjs/passport';
import { Model } from 'mongoose';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from './auth.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectModel('User') private userModel: Model<IUser>,
    private tocologistService: TocologistService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.APP_SECRET,
    });
  }

  async validate(payload: JwtPayload): Promise<IUser> {
    const { uid } = payload;
    let output: any;
    const user = await this.userModel
      .findById(uid)
      .populate([
        {
          path: 'role',
          select: 'name slug',
          populate: { path: 'permissions', select: 'name slug' },
        },
      ])
      .lean();
    if (!user) {
      throw new UnauthorizedException();
    }

    output = user;

    if (user.role && user.role.slug === 'tocologist') {
      const tocologist = await this.tocologistService.getByUser(user._id);
      if (tocologist) {
        output.tocologist = tocologist;
      }
    }
    return output;
  }
}
