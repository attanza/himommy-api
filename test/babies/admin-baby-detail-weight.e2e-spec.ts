import { ESex, IBaby } from '@/modules/baby/baby.interface';
import { BabySchema } from '@/modules/baby/baby.schema';
import { CreateBabyDto } from '@/modules/baby/dto/baby.dto';
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
} from '../helpers';

const title = 'Admin Baby Detail Weight';
const baseUrl = 'http://localhost:2500/admin';
let url = '/babies';
const babyData: CreateBabyDto = {
  name: faker.name(),
  dob: faker.date(),
  sex: ESex.MALE,
  parent: '',
  checkLists: [],
};

const createData = {
  weight: 35.5,
};

let token: string;
let unauthorizedToken: string;

let Baby: mongoose.Model<mongoose.Document, {}>;
let User: mongoose.Model<mongoose.Document, {}>;
let foundData: any;
let weightId: string;
beforeAll(async () => {
  const MONGOOSE_URI = `${process.env.DB_URL}/${process.env.DB_NAME}`;
  await mongoose.connect(MONGOOSE_URI, MONGO_DB_OPTIONS);
  Baby = mongoose.model('BabySchema', BabySchema, 'babies');
  User = mongoose.model('User', UserSchema);
  const parent = await User.findOne({ email: 'tocologist_2@himommy.org' });
  babyData.parent = parent._id;
  foundData = await Baby.create(babyData);
  url = `/babies/${foundData._id}/weights`;

  const authorizedTokenData = await generateToken(
    User,
    'super_administrator_0@himommy.org'
  );
  token = authorizedTokenData.token;
  const unauthorizedTokenData = await generateToken(
    User,
    'tocologist_0@himommy.org'
  );
  unauthorizedToken = unauthorizedTokenData.token;
});

afterAll(async done => {
  await Baby.deleteOne({ name: babyData.name });
  await mongoose.disconnect(done);
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
    return request(baseUrl)
      .post(url)
      .set({ Authorization: `Bearer ${token}` })
      .expect(400)
      .expect(({ body }) => {
        expect(body.meta).toBeDefined();
        expect(body.meta.status).toEqual(400);
        expect(body.meta.message).toBeDefined();
        expect(body.meta.message).toEqual('weight is required');
      });
  });
  it('can create', () => {
    return request(baseUrl)
      .post(url)
      .set({ Authorization: `Bearer ${token}` })
      .send(createData)
      .expect(200)
      .expect(async ({ body }) => {
        expect(body.meta).toBeDefined();
        expect(body.meta.status).toEqual(200);
        const created = await Baby.findById(foundData._id);
        const baby: IBaby = created.toJSON();
        expect(baby.weights).toBeDefined();
        expect(Array.isArray(baby.weights)).toBeTruthy();
        expect(baby.weights[0].weight).toEqual(createData.weight);
        weightId = baby.weights[0]._id;
      });
  });
});

describe(`${title} Update`, () => {
  it('cannot update if not authenticated', async () => {
    return request(baseUrl)
      .put(url)
      .expect(401)
      .expect(({ body }) => {
        unauthorizedExpects(expect, body);
      });
  });
  it('cannot update if forbidden', async () => {
    return request(baseUrl)
      .put(url)
      .set({ Authorization: `Bearer ${unauthorizedToken}` })
      .expect(403)
      .expect(({ body }) => {
        forbiddenExpects(expect, body);
      });
  });

  it('can update', async () => {
    const updateData = {
      weightId,
      weight: 37,
    };
    return request(baseUrl)
      .put(url)
      .set({ Authorization: `Bearer ${token}` })
      .send(updateData)
      .expect(200)
      .expect(async ({ body }) => {
        expect(body.meta).toBeDefined();
        expect(body.meta.status).toEqual(200);
        const updated = await Baby.findById(foundData._id);
        const baby: IBaby = updated.toJSON();
        expect(baby.weights).toBeDefined();
        expect(Array.isArray(baby.weights)).toBeTruthy();
        expect(baby.weights[0].weight).toEqual(updateData.weight);
      });
  });
});

describe(`${title} Delete`, () => {
  it('cannot delete if not authenticated', async () => {
    return request(baseUrl)
      .delete(url)
      .expect(401)
      .expect(({ body }) => {
        unauthorizedExpects(expect, body);
      });
  });
  it('cannot delete if forbidden', async () => {
    return request(baseUrl)
      .delete(url)
      .set({ Authorization: `Bearer ${unauthorizedToken}` })
      .expect(403)
      .expect(({ body }) => {
        forbiddenExpects(expect, body);
      });
  });
  it('can delete', async () => {
    return request(baseUrl)
      .delete(url)
      .set({ Authorization: `Bearer ${token}` })
      .send({
        weightId,
      })
      .expect(200)
      .expect(async ({ body }) => {
        expect(body.meta).toBeDefined();
        expect(body.meta.status).toEqual(200);
      });
  });
});
