import { IMommyDetail } from '@modules/mommy-detail/mommy-detail.interface';
import { MommyDetailService } from '@modules/mommy-detail/mommy-detail.service';
import { ITocologist } from '@modules/tocologist/tocologist.interface';
import { TocologistService } from '@modules/tocologist/tocologist.service';
import { IUser } from '@modules/user/user.interface';
import { UserService } from '@modules/user/user.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../auth.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  uid: string;
  constructor(
    private userService: UserService,
    private tocologistService: TocologistService,
    private mommyDetailService: MommyDetailService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.APP_SECRET,
    });
  }

  async validate(payload: JwtPayload): Promise<IUser> {
    const { uid } = payload;
    this.uid = uid;
    const user = await this.userService.findByIdWithRolePermissions(uid);
    if (!user) {
      throw new UnauthorizedException();
    }
    const jsonUser = user.toJSON();
    if (jsonUser.role && jsonUser.role.slug === 'mommy') {
      jsonUser.detail = await this.getMommyDetail();
    }
    if (jsonUser.role && jsonUser.role.slug === 'tocologist') {
      jsonUser.tocologist = await this.getTocologist();
    }
    return jsonUser;
  }

  private async getTocologist(): Promise<ITocologist> {
    return await this.tocologistService.getByKey('user', this.uid);
  }

  private async getMommyDetail(): Promise<IMommyDetail> {
    const data: IMommyDetail = await this.mommyDetailService.getByKey(
      'user',
      this.uid,
    );
    return data;
  }
}
