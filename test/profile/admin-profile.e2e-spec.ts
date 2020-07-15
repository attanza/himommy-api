import {
  ChangePasswordDto,
  ProfileUpdateDto,
} from '@/modules/profile/profile.dto';
import { IRole } from '@/modules/role/role.interface';
import { RoleSchema } from '@/modules/role/role.schema';
import { IUser } from '@/modules/user/user.interface';
import { UserSchema } from '@/modules/user/user.schema';
import 'dotenv/config';
import mongoose from 'mongoose';
import request from 'supertest';
import { generalExpect } from '../expects';
import {
  faker,
  generateToken,
  MONGO_DB_OPTIONS,
  unauthorizedExpects,
  validationFailExpects,
} from '../helpers';

const title = 'Admin Profile';
const baseUrl = 'http://localhost:2500/admin';
const url = '/profile';
const userData: Partial<IUser> = {
  firstName: faker.first(),
  email: faker.email(),
  password: 'password',
  phone: faker.phone(),
  role: null,
  isActive: true,
  authProvider: 'local',
};

const updateData: Partial<ProfileUpdateDto> = {
  lastName: faker.last(),
  education: faker.word(),
};

let token: string;
let Role: mongoose.Model<mongoose.Document, {}>;
let User: mongoose.Model<mongoose.Document, {}>;

let foundData: any;

beforeAll(async () => {
  const MONGOOSE_URI = `${process.env.DB_URL}/${process.env.DB_NAME}`;
  await mongoose.connect(MONGOOSE_URI, MONGO_DB_OPTIONS);
  Role = mongoose.model('Role', RoleSchema);
  User = mongoose.model('User', UserSchema);
  const superAdminRole: IRole = await Role.findOne({
    slug: 'super-administrator',
  }).lean();
  userData.role = superAdminRole;
  foundData = await User.create(userData);
  const authorizedTokenData = await generateToken(User, userData.email);
  token = authorizedTokenData.token;
});

afterAll(async done => {
  await User.deleteOne({ email: userData.email });
  await mongoose.disconnect(done);
});

describe(`${title} Update`, () => {
  it('cannot update if not authenticated', async () => {
    return request(baseUrl)
      .put(url)
      .send(updateData)
      .expect(401)
      .expect(({ body }) => {
        unauthorizedExpects(expect, body);
      });
  });

  it('can update', () => {
    return request(baseUrl)
      .put(url)
      .set({ Authorization: `Bearer ${token}` })
      .send(updateData)
      .expect(200)
      .expect(async ({ body }) => {
        expect(body.meta).toBeDefined();
        expect(body.meta.status).toEqual(200);
        expect(body.data.lastName).toEqual(updateData.lastName);
        expect(body.data.education).toBeUndefined();
      });
  });
});

describe(`${title} Change Password`, () => {
  const passwordData: ChangePasswordDto = {
    oldPassword: '',
    password: '',
  };
  it('cannot change password if not authenticated', () => {
    return request(baseUrl)
      .post(`${url}/change-password`)
      .send(passwordData)
      .expect(401)
      .expect(({ body }) => {
        unauthorizedExpects(expect, body);
      });
  });

  it('cannot change password if incomplete data', () => {
    return request(baseUrl)
      .post(`${url}/change-password`)
      .set({ Authorization: `Bearer ${token}` })
      .send(passwordData)
      .expect(400)
      .expect(async ({ body }) => {
        validationFailExpects(expect, body, 'oldPassword');
      });
  });

  it('cannot change password if old password is incorrect', () => {
    passwordData.oldPassword = 'asdasd';
    passwordData.password = 'password';
    return request(baseUrl)
      .post(`${url}/change-password`)
      .set({ Authorization: `Bearer ${token}` })
      .send(passwordData)
      .expect(400)
      .expect(async ({ body }) => {
        generalExpect(expect, body, 400, 'Old password incorrect');
      });
  });

  it('can change password', () => {
    passwordData.oldPassword = 'password';
    passwordData.password = 'password';
    return request(baseUrl)
      .post(`${url}/change-password`)
      .set({ Authorization: `Bearer ${token}` })
      .send(passwordData)
      .expect(200)
      .expect(async ({ body }) => {
        generalExpect(expect, body, 200, 'Password updated');
      });
  });
});
