import { IRole } from '@/modules/role/role.interface';
import { RoleService } from '@/modules/role/role.service';
import { IUser } from '@/modules/user/user.interface';
import { UserService } from '@/modules/user/user.service';
import { Injectable } from '@nestjs/common';
import { use } from 'passport';
import FacebookTokenStrategy from 'passport-facebook-token';

@Injectable()
export class FacebookStrategy {
  constructor(
    private roleService: RoleService,
    private userService: UserService
  ) {
    this.init();
  }
  init() {
    use(
      new FacebookTokenStrategy(
        {
          clientID: process.env.FB_CLIENT_ID,
          clientSecret: process.env.FB_CLIENT_SECRET,
          fbGraphVersion: 'v3.0',
        },
        async (
          accessToken: string,
          refreshToken: string,
          profile: any,
          done: any
        ) => {
          const { id, first_name, last_name, email } = profile._json;
          if (!email || email === '') {
            return done(null);
          }
          let user: IUser;
          user = await this.userService.getByKey('email', email);
          if (!user) {
            const mommyRole: IRole = await this.roleService.getByKey(
              'slug',
              'mommy'
            );
            const userData = {
              firstName: first_name || '',
              lastName: last_name || '',
              email: email || '',
              password: id,
              isActive: true,
              role: mommyRole._id,
              authProvider: 'facebook',
              avatar: profile.photos[0].value || '',
            };
            user = await this.userService.dbStore('User', userData);
          }
          return done(null, user);
        }
      )
    );
  }
}
