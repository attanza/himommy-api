import { CreateImmunizationDto } from '@/modules/immunization/immunization.dto';
import { ImmunizationSchema } from '@/modules/immunization/immunization.schema';
import 'dotenv/config';
import mongoose from 'mongoose';
import request from 'supertest';
import {
  faker,
  forbiddenExpects,
  MONGO_DB_OPTIONS,
  resourceListExpects,
  superAdmin0Login,
  tocologistLogin,
  unauthorizedExpects,
  validationFailExpects,
} from '../helpers';

const title = 'Admin Immunization';
const baseUrl = 'http://localhost:2500/admin';
const url = '/immunizations';
const createData: CreateImmunizationDto = {
  name: faker.word(),
  age: faker.integer({ min: 0, max: 5 }),
  description: faker.paragraph(),
};

let token: string;
let Immunization: mongoose.Model<mongoose.Document, {}>;
let foundData: any;

beforeAll(async () => {
  const tokenData = await superAdmin0Login();
  token = tokenData.token;

  const MONGOOSE_URI = `${process.env.DB_URL}/${process.env.DB_NAME}`;
  await mongoose.connect(MONGOOSE_URI, MONGO_DB_OPTIONS);
  Immunization = mongoose.model('Immunization', ImmunizationSchema);
});

afterAll(async done => {
  await Immunization.deleteOne({ name: createData.name });
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
    const tokenData = await tocologistLogin();
    return request(baseUrl)
      .get(url)
      .set('Content-Type', 'application/json')
      .set({ Authorization: `Bearer ${tokenData.token}` })
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
    const tokenData = await tocologistLogin();
    return request(baseUrl)
      .post(url)
      .set({ Authorization: `Bearer ${tokenData.token}` })
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
        const created = await Immunization.findOne({
          name: createData.name,
        });
        expect(created).toBeDefined();
        expect(created.toJSON().name).toEqual(createData.name);
      });
  });
});

describe(`${title} Detail`, () => {
  it('cannot get detail if not authenticated', async () => {
    foundData = await Immunization.findOne({
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
    const tokenData = await tocologistLogin();

    return request(baseUrl)
      .get(`${url}/${foundData._id}`)
      .set({ Authorization: `Bearer ${tokenData.token}` })
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
        expect(body.data.age).toEqual(foundData.toJSON().age);
      });
  });
});

describe(`${title} Update`, () => {
  it('cannot update if not authenticated', async () => {
    const updateData = {
      age: 3,
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
    const tokenData = await tocologistLogin();
    const updateData = {
      age: 3,
    };
    return request(baseUrl)
      .put(`${url}/${foundData._id}`)
      .set({ Authorization: `Bearer ${tokenData.token}` })
      .send(updateData)
      .expect(403)
      .expect(({ body }) => {
        forbiddenExpects(expect, body);
      });
  });

  it('can update', async () => {
    const updateData = {
      age: 3,
    };
    return request(baseUrl)
      .put(`${url}/${foundData._id}`)
      .set({ Authorization: `Bearer ${token}` })
      .send(updateData)
      .expect(200)
      .expect(async ({ body }) => {
        expect(body.meta).toBeDefined();
        expect(body.meta.status).toEqual(200);
        expect(body.data.age).toEqual(updateData.age);
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
    const tokenData = await tocologistLogin();

    return request(baseUrl)
      .delete(`${url}/${foundData._id}`)
      .set({ Authorization: `Bearer ${tokenData.token}` })
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
        expect(body.meta.message).toEqual('Immunization deleted');
      });
  });
});
