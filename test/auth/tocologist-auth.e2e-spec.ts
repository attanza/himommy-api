import 'dotenv/config';
import mongoose from 'mongoose';
import request from 'supertest';
import { faker, MONGO_DB_OPTIONS, tocologistLogin } from '../helpers';

const url = 'http://localhost:2500/tocologist';

beforeAll(async () => {
  const MONGOSE_URI = `${process.env.DB_URL}/${process.env.DB_NAME}`;
  await mongoose.connect(MONGOSE_URI, MONGO_DB_OPTIONS);
});

afterAll(async done => {
  await mongoose.disconnect(done);
});

describe('Tocologist Login', () => {
  it('cannot login with wrong credential', () => {
    const credential = {
      uid: faker.email(),
      password: 'password',
      provider: 'local',
    };
    return request(url)
      .post('/login')
      .send(credential)
      .expect(401)
      .expect(({ body }) => {
        expect(body.meta).toBeDefined();
        expect(body.meta.status).toEqual(401);
        expect(body.meta.message).toEqual('Unauthorized');
      });
  });

  it('can login', () => {
    const credential = {
      uid: 'tocologist@himommy.org',
      password: 'password',
      provider: 'local',
    };
    return request(url)
      .post('/login')
      .send(credential)
      .expect(200)
      .expect(({ body }) => {
        expect(body.meta).toBeDefined();
        expect(body.data).toBeDefined();
        expect(body.data.token).toBeDefined();
        expect(body.data.refreshToken).toBeDefined();
      });
  });
});

describe('Tocologist Refresh Token', () => {
  it('cannot refresh token if no refresh token', () => {
    return request(url)
      .post('/refreshToken')
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
    const tokenData = await tocologistLogin();

    return request(url)
      .post('/refreshToken')
      .send({ refreshToken: tokenData.refreshToken })
      .expect(200)
      .expect(({ body }) => {
        expect(body.meta).toBeDefined();
        expect(body.meta.status).toEqual(200);
        expect(body.data).toBeDefined();
        expect(body.data.token).toBeDefined();
        expect(body.data.refreshToken).toBeDefined();
      });
  });
});

describe('Tocologist Me', () => {
  it('cannot get me if not authenticated', () => {
    return request(url)
      .get('/me')
      .expect(({ body }) => {
        expect(body.meta).toBeDefined();
        expect(body.meta.status).toEqual(401);
        expect(body.meta.message).toEqual('Unauthorized');
      });
  });

  it('get me', async () => {
    const tokenData = await tocologistLogin();

    return request(url)
      .get('/me')
      .set('Content-Type', 'application/json')
      .set({ Authorization: `Bearer ${tokenData.token}` })
      .expect(200)
      .expect(({ body }) => {
        expect(body.meta).toBeDefined();
        expect(body.meta.status).toEqual(200);
        expect(body.data).toBeDefined();
        expect(body.data.role).toBeDefined();
        expect(body.data.role.slug).toEqual('tocologist');
        expect(body.data.tocologist).toBeDefined();
      });
  });
});

// it('title', () => {
//   return request(url)
//     .post('/ ')
//     .expect(({ body }) => {
//         console.log('body', JSON.stringify(body, null, 2));
//     });
// });
