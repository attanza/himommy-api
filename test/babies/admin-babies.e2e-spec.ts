import { ESex } from '@/modules/baby/baby.interface';
import { BabySchema } from '@/modules/baby/baby.schema';
import { CreateBabyDto, UpdateBabyDto } from '@/modules/baby/dto/baby.dto';
import { UserSchema } from '@/modules/user/user.schema';
import 'dotenv/config';
import mongoose from 'mongoose';
import request from 'supertest';
import {
  faker,
  forbiddenExpects,
  generateToken,
  MONGO_DB_OPTIONS,
  resourceListExpects,
  unauthorizedExpects,
  validationFailExpects,
} from '../helpers';

const title = 'Admin Babies';
const baseUrl = 'http://localhost:2500/admin';
const url = '/babies';
const createData: CreateBabyDto = {
  name: faker.name(),
  dob: faker.date(),
  sex: ESex.MALE,
  parent: '',
  checkLists: [],
};

let token: string;
let unauthorizedToken: string;

let Baby: mongoose.Model<mongoose.Document, {}>;
let User: mongoose.Model<mongoose.Document, {}>;
let foundData: any;

beforeAll(async () => {
  const MONGOOSE_URI = `${process.env.DB_URL}/${process.env.DB_NAME}`;
  await mongoose.connect(MONGOOSE_URI, MONGO_DB_OPTIONS);
  Baby = mongoose.model('BabySchema', BabySchema, 'babies');
  User = mongoose.model('User', UserSchema);
  const parent = await User.findOne({ email: 'tocologist_2@himommy.org' });
  createData.parent = parent._id;

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
  await Baby.deleteOne({ name: createData.name });
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
        resourceListExpects(expect, body);
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
    delete postData.name;
    return request(baseUrl)
      .post(url)
      .set({ Authorization: `Bearer ${token}` })
      .send(postData)
      .expect(400)
      .expect(({ body }) => {
        validationFailExpects(expect, body, 'name');
      });
  });
  it('can create', () => {
    return request(baseUrl)
      .post(url)
      .set({ Authorization: `Bearer ${token}` })
      .send(createData)
      .expect(201)
      .expect(async ({ body }) => {
        expect(body.meta).toBeDefined();
        expect(body.meta.status).toEqual(201);
        const created = await Baby.findOne({
          name: createData.name,
        });
        expect(created).toBeDefined();
        expect(created.toJSON().name).toEqual(createData.name);
      });
  });
});

describe(`${title} Detail`, () => {
  it('cannot get detail if not authenticated', async () => {
    foundData = await Baby.findOne({
      name: createData.name,
    });
    return request(baseUrl)
      .get(`${url}/${foundData._id}`)
      .expect(401)
      .expect(({ body }) => {
        unauthorizedExpects(expect, body);
      });
  });
  it('cannot get detail if forbidden', async () => {
    return request(baseUrl)
      .get(`${url}/${foundData._id}`)
      .set({ Authorization: `Bearer ${unauthorizedToken}` })
      .expect(403)
      .expect(({ body }) => {
        forbiddenExpects(expect, body);
      });
  });
  it('can get detail', async () => {
    return request(baseUrl)
      .get(`${url}/${foundData._id}`)
      .set({ Authorization: `Bearer ${token}` })
      .expect(200)
      .expect(({ body }) => {
        expect(body.meta).toBeDefined();
        expect(body.meta.status).toEqual(200);
        expect(body.data).toBeDefined();
        expect(body.data.name).toEqual(foundData.toJSON().name);
        expect(body.data.sex).toEqual(foundData.toJSON().sex);
      });
  });
});

describe(`${title} Update`, () => {
  it('cannot update if not authenticated', async () => {
    const updateData: Partial<UpdateBabyDto> = {
      sex: ESex.FEMALE,
    };
    return request(baseUrl)
      .put(`${url}/${foundData._id}`)
      .send(updateData)
      .expect(401)
      .expect(({ body }) => {
        unauthorizedExpects(expect, body);
      });
  });
  it('cannot update if forbidden', async () => {
    const updateData: Partial<UpdateBabyDto> = {
      sex: ESex.FEMALE,
    };
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
    const updateData: Partial<UpdateBabyDto> = {
      sex: ESex.FEMALE,
    };
    return request(baseUrl)
      .put(`${url}/${foundData._id}`)
      .set({ Authorization: `Bearer ${token}` })
      .send(updateData)
      .expect(200)
      .expect(async ({ body }) => {
        expect(body.meta).toBeDefined();
        expect(body.meta.status).toEqual(200);
        expect(body.data.sex).toEqual(updateData.sex);
      });
  });
});

describe(`${title} Delete`, () => {
  it('cannot delete if not authenticated', async () => {
    return request(baseUrl)
      .delete(`${url}/${foundData._id}`)
      .expect(401)
      .expect(({ body }) => {
        unauthorizedExpects(expect, body);
      });
  });
  it('cannot delete if forbidden', async () => {
    return request(baseUrl)
      .delete(`${url}/${foundData._id}`)
      .set({ Authorization: `Bearer ${unauthorizedToken}` })
      .expect(403)
      .expect(({ body }) => {
        forbiddenExpects(expect, body);
      });
  });
  it('can delete', async () => {
    return request(baseUrl)
      .delete(`${url}/${foundData._id}`)
      .set({ Authorization: `Bearer ${token}` })
      .expect(200)
      .expect(async ({ body }) => {
        expect(body.meta).toBeDefined();
        expect(body.meta.status).toEqual(200);
        expect(body.meta.message).toEqual('Baby deleted');
      });
  });
});
