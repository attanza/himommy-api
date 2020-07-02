import { EProvider, LoginDto } from '@/modules/auth/auth.interface';
import { HttpStatus } from '@nestjs/common';
import 'dotenv/config';
import 'module-alias/register';
import request from 'supertest';
import { superAdminLogin } from '../helpers';

const app = 'http://localhost:2500';
const credentials: LoginDto = {
  uid: 'super_administrator@himommy.org',
  password: 'password',
  provider: EProvider.LOCAL,
};

let token: string;

describe('Auth Admin', () => {
  it('cannot login with wrong credentials', () => {
    const credential2 = {
      uid: 'super_administrator@himommy.org',
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
    const tokenData = await superAdminLogin();
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