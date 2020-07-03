import { EProvider, LoginDto } from '@/modules/auth/auth.interface';
import { RoleSchema } from '@/modules/role/role.schema';
import { UserSchema } from '@/modules/user/user.schema';
import { HttpStatus } from '@nestjs/common';
import 'dotenv/config';
import 'module-alias/register';
import mongoose from 'mongoose';
import request from 'supertest';
import {
  faker,
  MONGO_DB_OPTIONS,
  otherLogin,
  superAdminLogin,
} from '../helpers';

const app = 'http://localhost:2500';
const credentials: LoginDto = {
  uid: 'super_administrator@himommy.org',
  password: 'password',
  provider: EProvider.LOCAL,
};

let token: string;
let User: mongoose.Model<mongoose.Document, {}>;
let Role: mongoose.Model<mongoose.Document, {}>;
let user: any;
beforeAll(async () => {
  const tokenData = await superAdminLogin();
  token = tokenData.token;

  const MONGOOSE_URI = `${process.env.DB_URL}/${process.env.DB_NAME}`;
  await mongoose.connect(MONGOOSE_URI, MONGO_DB_OPTIONS);
  User = mongoose.model('User', UserSchema);
  Role = mongoose.model('Role', RoleSchema);
  const role = await Role.findOne({ slug: 'super-administrator' });
  const userData = {
    email: faker.email(),
    firstName: faker.first(),
    lastName: faker.last(),
    password: 'password',
    phone: faker.phone(),
    role: role._id,
    isActive: true,
  };
  user = await User.create(userData);
  credentials.uid = user.email;
});

afterAll(async done => {
  await user.remove();
  await mongoose.disconnect(done);
});

describe('Auth Admin', () => {
  it('cannot login with wrong credentials', () => {
    const credential2 = {
      uid: user.email,
      password: 'passwor',
      provider: 'local',
    };
    return request(app)
      .post('/admin/login')
      .send(credential2)
      .expect(HttpStatus.UNAUTHORIZED)
      .expect(({ body }) => {
        expect(body.meta).toBeDefined();
        expect(body.meta.status).toEqual(401);
        expect(body.meta.message).toEqual('Unauthorized');
      });
  });

  it('admin login', () => {
    return request(app)
      .post('/admin/login')
      .send(credentials)
      .expect(HttpStatus.OK)
      .expect(({ body }) => {
        expect(body.meta).toBeDefined();
        expect(body.data).toBeDefined();
        expect(body.data.token).toBeDefined();
        expect(body.data.refreshToken).toBeDefined();
      });
  });

  it('cannot refresh token if no refresh token', () => {
    return request(app)
      .post('/admin/refreshToken')
      .expect(400)
      .expect(({ body }) => {
        expect(body.meta).toBeDefined();
        expect(body.meta.status).toEqual(400);
        expect(body.meta.message).toBeDefined();
        expect(Array.isArray(body.meta.message)).toBeTruthy();
        expect(body.meta.message[0].property).toEqual('refreshToken');
      });
  });

  it('refresh token', async () => {
    const tokenData = await otherLogin(user.email);
    return request(app)
      .post('/admin/refreshToken')
      .send({ refreshToken: tokenData.refreshToken })
      .expect(200)
      .expect(({ body }) => {
        expect(body.meta).toBeDefined();
        expect(body.meta.status).toEqual(200);
        expect(body.data).toBeDefined();
        expect(body.data.token).toBeDefined();
        expect(body.data.refreshToken).toBeDefined();
        token = body.data.token;
      });
  });
});

describe('Admin Me', () => {
  it('cannot get me if not authenticated', () => {
    return request(app)
      .get('/admin/me')
      .expect(({ body }) => {
        expect(body.meta).toBeDefined();
        expect(body.meta.status).toEqual(401);
        expect(body.meta.message).toEqual('Unauthorized');
      });
  });

  it('get me', () => {
    return request(app)
      .get('/admin/me')
      .set('Content-Type', 'application/json')
      .set({ Authorization: `Bearer ${token}` })
      .expect(200)
      .expect(({ body }) => {
        expect(body.meta).toBeDefined();
        expect(body.meta.status).toEqual(200);
        expect(body.data).toBeDefined();
      });
  });
});
