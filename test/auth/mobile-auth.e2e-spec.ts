import { RegisterDto } from '@/modules/auth/auth.dto';
import { MommyDetailSchema } from '@/modules/mommy-detail/mommy-detail.schema';
import { UserSchema } from '@/modules/user/user.schema';
import 'dotenv/config';
import mongoose from 'mongoose';
import request from 'supertest';
import { faker, MONGO_DB_OPTIONS } from '../helpers';

const url = 'http://localhost:2500/mobile';

const registerData: RegisterDto = {
  firstName: faker.first(),
  lastName: faker.last(),
  password: 'password',
  phone: faker.phone(),
  email: faker.email(),
};

let token: string;
let refreshToken: string;
let User: mongoose.Model<mongoose.Document, {}>;
let MommyDetail: mongoose.Model<mongoose.Document, {}>;
beforeAll(async () => {
  const MONGOSE_URI = `${process.env.DB_URL}/${process.env.DB_NAME}`;
  await mongoose.connect(MONGOSE_URI, MONGO_DB_OPTIONS);
  User = mongoose.model('User', UserSchema);
  MommyDetail = mongoose.model(
    'MommyDetail',
    MommyDetailSchema,
    'mommy_details'
  );
});

afterAll(async done => {
  const user = await User.findOne({ phone: registerData.phone });
  await MommyDetail.deleteOne({ user: user._id });
  await user.remove();
  await mongoose.disconnect(done);
});

describe('Mobile Auth Register', () => {
  it('cannot register with incomplete input', () => {
    const postData = { ...registerData };
    delete postData.email;
    return request(url)
      .post('/register')
      .send(postData)
      .expect(400)
      .expect(({ body }) => {
        expect(body.meta).toBeDefined();
        expect(body.meta.status).toEqual(400);
        expect(body.meta.message).toBeDefined();
        expect(Array.isArray(body.meta.message)).toBeTruthy();
        expect(body.meta.message[0].property).toEqual('email');
        token = body.data;
      });
  });

  it('register', () => {
    return request(url)
      .post('/register')
      .send(registerData)
      .expect(201)
      .expect(async ({ body }) => {
        expect(body.meta).toBeDefined();
        expect(body.meta.status).toEqual(200);
        expect(body.meta.message).toEqual('Please confirm your email');
        const created = await User.findOne({ email: registerData.email });
        expect(created).toBeDefined();
        expect(created.toJSON().isActive).toBeFalsy();
        token = body.data;
      });
  });

  it('cannot register duplicate user', () => {
    return request(url)
      .post('/register')
      .send(registerData)
      .expect(400)
      .expect(({ body }) => {
        expect(body.meta).toBeDefined();
        expect(body.meta.status).toEqual(400);
        expect(body.meta.message).toBeDefined();
        expect(body.meta.message).toEqual('email is already exists');
      });
  });

  it('cannot confirm user if token is invalid', () => {
    return request(url)
      .get('/confirm/token')
      .expect(400)
      .expect(({ body }) => {
        expect(body.meta).toBeDefined();
        expect(body.meta.status).toEqual(400);
        expect(body.meta.message).toBeDefined();
        expect(body.meta.message).toEqual('Invalid token');
      });
  });
});

describe('Mobile Login', () => {
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

  it('cannot login if not activated', () => {
    const credential = {
      uid: registerData.email,
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

  it('can confirm user if token is valid', () => {
    return request(url)
      .get(`/confirm/${token}`)
      .expect(200)
      .expect(async ({ body }) => {
        expect(body.meta).toBeDefined();
        expect(body.meta.status).toEqual(200);
        expect(body.meta.message).toEqual('User confirmation succeed');
        const created = await User.findOne({ email: registerData.email });
        expect(created).toBeDefined();
        expect(created.toJSON().isActive).toBeTruthy();
      });
  });

  it('can login with email', () => {
    const credential = {
      uid: registerData.email,
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

  it('can login with phone', () => {
    const credential = {
      uid: registerData.phone,
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
        refreshToken = body.data.refreshToken;
      });
  });
});

describe('Mobile Refresh Token', () => {
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
    return request(url)
      .post('/refreshToken')
      .send({ refreshToken })
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

describe('Mobile Me', () => {
  it('cannot get me if not authenticated', () => {
    return request(url)
      .get('/me')
      .expect(({ body }) => {
        expect(body.meta).toBeDefined();
        expect(body.meta.status).toEqual(401);
        expect(body.meta.message).toEqual('Unauthorized');
      });
  });

  it('get me', () => {
    return request(url)
      .get('/me')
      .set('Content-Type', 'application/json')
      .set({ Authorization: `Bearer ${token}` })
      .expect(200)
      .expect(({ body }) => {
        expect(body.meta).toBeDefined();
        expect(body.meta.status).toEqual(200);
        expect(body.data).toBeDefined();
        expect(body.data.firstName).toEqual(registerData.firstName);
        expect(body.data.role).toBeDefined();
        expect(body.data.role.slug).toEqual('mommy');
        expect(body.data.detail).toBeDefined();
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
