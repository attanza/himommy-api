import {
  CreateMythFactDto,
  UpdateMythFactDto,
} from '@/modules/myth-fact/myth-fact.dto';
import { MythFactSchema } from '@/modules/myth-fact/myth-fact.schema';
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

const title = 'Admin Myth-facts';
const baseUrl = 'http://localhost:2500/admin';
const url = '/myth-facts';
const createData: CreateMythFactDto = {
  title: faker.sentence(),
  subtitle: faker.sentence(),
  description: faker.paragraph(),
  fact: faker.paragraph(),
  myth: faker.paragraph(),
};
const updateData: Partial<UpdateMythFactDto> = {
  isPublish: true,
};

let token: string;
let unauthorizedToken: string;
let MythFact: mongoose.Model<mongoose.Document, {}>;
let User: mongoose.Model<mongoose.Document, {}>;

let foundData: any;

beforeAll(async () => {
  const MONGOOSE_URI = `${process.env.DB_URL}/${process.env.DB_NAME}`;
  await mongoose.connect(MONGOOSE_URI, MONGO_DB_OPTIONS);
  MythFact = mongoose.model('MythFact', MythFactSchema, 'myth_facts');
  User = mongoose.model('User', UserSchema);
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
  await MythFact.deleteOne({ title: createData.title });
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
    delete postData.title;
    return request(baseUrl)
      .post(url)
      .set({ Authorization: `Bearer ${token}` })
      .send(postData)
      .expect(400)
      .expect(({ body }) => {
        validationFailExpects(expect, body, 'title');
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
        const created = await MythFact.findOne({
          title: createData.title,
        });
        expect(created).toBeDefined();
        expect(created.toJSON().title).toEqual(createData.title);
      });
  });
});

describe(`${title} Detail`, () => {
  it('cannot get detail if not authenticated', async () => {
    foundData = await MythFact.findOne({
      title: createData.title,
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
        expect(body.data.title).toEqual(foundData.toJSON().title);
        expect(body.data.subtitle).toEqual(foundData.toJSON().subtitle);
      });
  });
});

describe(`${title} Update`, () => {
  it('cannot update if not authenticated', async () => {
    return request(baseUrl)
      .put(`${url}/${foundData._id}`)
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
      .put(`${url}/${foundData._id}`)
      .set({ Authorization: `Bearer ${token}` })
      .send(updateData)
      .expect(200)
      .expect(async ({ body }) => {
        expect(body.meta).toBeDefined();
        expect(body.meta.status).toEqual(200);
        expect(body.data.isPublish).toEqual(updateData.isPublish);
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
        expect(body.meta.message).toEqual('MythFact deleted');
      });
  });
});
