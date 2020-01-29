import { IRole } from '@modules/role/role.interface';
import { IUser } from '@modules/user/user.interface';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { use } from 'passport';
import * as FacebookTokenStrategy from 'passport-facebook-token';

@Injectable()
export class FacebookStrategy {
  constructor(
    @InjectModel('User') private userModel: Model<IUser>,
    @InjectModel('Role') private roleModel: Model<IRole>,
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
          done: any,
        ) => {
          const { id, first_name, last_name, email } = profile._json;
          let user: IUser;
          user = await this.userModel.findOne({ email });
          if (!user) {
            const mommyRole = await this.roleModel.findOne({ slug: 'mommy' });
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
            user = await this.userModel.create(userData);
          }
          return done(null, user);
        },
      ),
    );
  }
}

// {
//   provider: 'facebook',
//   id: '166776008086912',
//   displayName: 'Ajeng Rahmawati',
//   name: { familyName: 'Rahmawati', givenName: 'Ajeng', middleName: '' },
//   gender: '',
//   emails: [ { value: '' } ],
//   photos: [
//     {
//       value: 'https://graph.facebook.com/v3.0/166776008086912/picture?type=large'
//     }
//   ],
//   _raw: '{"id":"166776008086912","name":"Ajeng Rahmawati","last_name":"Rahmawati","first_name":"Ajeng"}',
//   _json: {
//     id: '166776008086912',
//     name: 'Ajeng Rahmawati',
//     last_name: 'Rahmawati',
//     first_name: 'Ajeng'
//   }
// }
