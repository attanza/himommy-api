import { MommyDetailSchema } from '@/modules/mommy-detail/mommy-detail.schema';
import { RoleSchema } from '@/modules/role/role.schema';
import { IUser } from '@/modules/user/user.interface';
import { UserSchema } from '@/modules/user/user.schema';
import 'dotenv/config';
import mongoose from 'mongoose';
import request from 'supertest';
import {
  faker,
  forbiddenExpects,
  generateToken,
  MONGO_DB_OPTIONS,
  unauthorizedExpects,
  validationFailExpects,
} from '../helpers';

const title = 'Mobile Weights';
const baseUrl = 'http://localhost:2500/mobile';
const url = '/weights';

const createData = {
  weight: 70.6,
};

const updateData = {
  weight: 50.5,
};

let token: string;
let unauthorizedToken: string;
let MommyDetail: mongoose.Model<mongoose.Document, {}>;
let User: mongoose.Model<mongoose.Document, {}>;
let Role: mongoose.Model<mongoose.Document, {}>;
let user: any;
let foundData: any;
let foundId: string;

beforeAll(async () => {
  const MONGOOSE_URI = `${process.env.DB_URL}/${process.env.DB_NAME}`;
  await mongoose.connect(MONGOOSE_URI, MONGO_DB_OPTIONS);
  MommyDetail = mongoose.model(
    'MommyDetail',
    MommyDetailSchema,
    'mommy_details'
  );
  User = mongoose.model('User', UserSchema);
  Role = mongoose.model('Role', RoleSchema);
  const mommyRole = await Role.findOne({ slug: 'mommy' });
  const userData: Partial<IUser> = {
    email: faker.email(),
    firstName: faker.first(),
    lastName: faker.last(),
    password: 'password',
    phone: faker.phone(),
    role: mommyRole._id,
    isActive: true,
  };
  user = await User.create(userData);
  const authorizedTokenData = await generateToken(User, user.toJSON().email);
  token = authorizedTokenData.token;
  const unauthorizedTokenData = await generateToken(
    User,
    'tocologist_0@himommy.org'
  );
  unauthorizedToken = unauthorizedTokenData.token;
});

afterAll(async done => {
  await MommyDetail.deleteOne({ user: user._id });
  await user.remove();
  await mongoose.disconnect(done);
});

describe(`${title} List`, () => {
  it('cannot get list if not authenticated', () => {
    return request(baseUrl)
      .get(url)
      .expect(401)
      .expect(({ body }) => {
        unauthorizedExpects(expect, body);
      });
  });
  it('cannot get list if forbidden', async () => {
    return request(baseUrl)
      .get(url)
      .set('Content-Type', 'application/json')
      .set({ Authorization: `Bearer ${unauthorizedToken}` })
      .expect(403)
      .expect(({ body }) => {
        forbiddenExpects(expect, body);
      });
  });
  it('can get list', async () => {
    return request(baseUrl)
      .get(url)
      .set('Content-Type', 'application/json')
      .set({ Authorization: `Bearer ${token}` })
      .expect(200)
      .expect(({ body }) => {
        expect(body.meta).toBeDefined();
        expect(body.meta.status).toEqual(200);
        expect(body.meta.message).toEqual('Weight item retrieved');
        expect(body.data).toBeDefined();
        expect(Array.isArray(body.data)).toBeTruthy();
      });
  });
});

describe(`${title} Create`, () => {
  it('cannot create if not authenticated', () => {
    return request(baseUrl)
      .post(url)
      .send(createData)
      .expect(401)
      .expect(({ body }) => {
        unauthorizedExpects(expect, body);
      });
  });
  it('cannot create if forbidden', async () => {
    return request(baseUrl)
      .post(url)
      .set({ Authorization: `Bearer ${unauthorizedToken}` })
      .send(createData)
      .expect(403)
      .expect(({ body }) => {
        forbiddenExpects(expect, body);
      });
  });
  it('cannot create if incomplete data', () => {
    const postData = { ...createData };
    delete postData.weight;
    return request(baseUrl)
      .post(url)
      .set({ Authorization: `Bearer ${token}` })
      .send(postData)
      .expect(400)
      .expect(({ body }) => {
        validationFailExpects(expect, body, 'weight');
      });
  });
  it('cannot create if height is not set', () => {
    return request(baseUrl)
      .post(url)
      .set({ Authorization: `Bearer ${token}` })
      .send(createData)
      .expect(400)
      .expect(({ body }) => {
        expect(body.meta).toBeDefined();
        expect(body.meta.status).toEqual(400);
        expect(body.meta.message).toEqual('Please set your height first');
      });
  });

  it('can create', async () => {
    await MommyDetail.create({ user: user._id, height: 160 });
    foundData = await MommyDetail.findOne({ user: user._id });

    return request(baseUrl)
      .post(url)
      .set({ Authorization: `Bearer ${token}` })
      .send(createData)
      .expect(201)
      .expect(async ({ body }) => {
        expect(body.meta).toBeDefined();
        expect(body.meta.status).toEqual(201);
        foundData = await MommyDetail.findOne({ user: user._id });
        expect(foundData).toBeDefined();
        expect(foundData.weights).toBeDefined();
        expect(Array.isArray(foundData.weights)).toBeTruthy();
        expect(foundData.weights[0].weight).toEqual(createData.weight);
      });
  });
});

describe(`${title} Detail`, () => {
  it('cannot get detail if not authenticated', async () => {
    foundData = await MommyDetail.findOne({ user: user._id });

    foundId = foundData.weights[0]._id;
    return request(baseUrl)
      .get(`${url}/${foundId}`)
      .expect(401)
      .expect(({ body }) => {
        unauthorizedExpects(expect, body);
      });
  });
  it('cannot get detail if forbidden', async () => {
    return request(baseUrl)
      .get(`${url}/${foundId}`)
      .set({ Authorization: `Bearer ${unauthorizedToken}` })
      .expect(403)
      .expect(({ body }) => {
        forbiddenExpects(expect, body);
      });
  });
  it('can get detail', async () => {
    return request(baseUrl)
      .get(`${url}/${foundId}`)
      .set({ Authorization: `Bearer ${token}` })
      .expect(200)
      .expect(({ body }) => {
        expect(body.meta).toBeDefined();
        expect(body.meta.status).toEqual(200);
        expect(body.meta.message).toEqual('Weight item retrieved');
        expect(body.data).toBeDefined();
        expect(body.data.weight).toEqual(createData.weight);
      });
  });
});

describe(`${title} Update`, () => {
  it('cannot update if not authenticated', async () => {
    return request(baseUrl)
      .put(`${url}/${foundId}`)
      .send(updateData)
      .expect(401)
      .expect(({ body }) => {
        unauthorizedExpects(expect, body);
      });
  });
  it('cannot update if forbidden', async () => {
    return request(baseUrl)
      .put(`${url}/${foundData._id}`)
      .set({ Authorization: `Bearer ${unauthorizedToken}` })
      .send(updateData)
      .expect(403)
      .expect(({ body }) => {
        forbiddenExpects(expect, body);
      });
  });

  it('can update', async () => {
    return request(baseUrl)
      .put(`${url}/${foundId}`)
      .set({ Authorization: `Bearer ${token}` })
      .send(updateData)
      .expect(200)
      .expect(async ({ body }) => {
        expect(body.meta).toBeDefined();
        expect(body.meta.status).toEqual(200);
        expect(body.data.weight).toEqual(updateData.weight);
      });
  });
});

describe(`${title} Delete`, () => {
  it('cannot delete if not authenticated', async () => {
    return request(baseUrl)
      .delete(`${url}/${foundId}`)
      .expect(401)
      .expect(({ body }) => {
        unauthorizedExpects(expect, body);
      });
  });
  it('cannot delete if forbidden', async () => {
    return request(baseUrl)
      .delete(`${url}/${foundId}`)
      .set({ Authorization: `Bearer ${unauthorizedToken}` })
      .expect(403)
      .expect(({ body }) => {
        forbiddenExpects(expect, body);
      });
  });
  it('can delete', async () => {
    return request(baseUrl)
      .delete(`${url}/${foundId}`)
      .set({ Authorization: `Bearer ${token}` })
      .expect(200)
      .expect(async ({ body }) => {
        expect(body.meta).toBeDefined();
        expect(body.meta.status).toEqual(200);
        expect(body.meta.message).toEqual('Weight deleted');
      });
  });
});
