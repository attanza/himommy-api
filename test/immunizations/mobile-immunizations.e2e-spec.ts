import { ImmunizationSchema } from '@/modules/immunization/immunization.schema';
import 'dotenv/config';
import mongoose from 'mongoose';
import request from 'supertest';
import {
  mommyLogin,
  MONGO_DB_OPTIONS,
  resourceListExpects,
  unauthorizedExpects,
} from '../helpers';

const title = 'Admin Articles';
const baseUrl = 'http://localhost:2500/mobile';
const url = '/immunizations';

let token: string;
let Immunization: mongoose.Model<mongoose.Document, {}>;

beforeAll(async () => {
  const tokenData = await mommyLogin();
  token = tokenData.token;

  const MONGOOSE_URI = `${process.env.DB_URL}/${process.env.DB_NAME}`;
  await mongoose.connect(MONGOOSE_URI, MONGO_DB_OPTIONS);
  Immunization = mongoose.model('Immunization', ImmunizationSchema);
});

afterAll(async done => {
  await mongoose.disconnect(done);
});

describe(`${title} List`, () => {
  it('can get list if not authenticated', async () => {
    return request(baseUrl)
      .get(url)
      .set('Content-Type', 'application/json')
      .expect(401)
      .expect(({ body }) => {
        unauthorizedExpects(expect, body);
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

  it('cannot get by id if not authenticated', async () => {
    const data = await Immunization.findOne();
    return request(baseUrl)
      .get(`${url}/${data._id}`)
      .set('Content-Type', 'application/json')
      .expect(401)
      .expect(({ body }) => {
        unauthorizedExpects(expect, body);
      });
  });
  it('can get by id', async () => {
    const data = await Immunization.findOne();
    return request(baseUrl)
      .get(`${url}/${data._id}`)
      .set('Content-Type', 'application/json')
      .set({ Authorization: `Bearer ${token}` })
      .expect(200)
      .expect(({ body }) => {
        expect(body.meta).toBeDefined();
        expect(body.meta.status).toEqual(200);
        expect(body.meta.message).toBeDefined();
        expect(body.data).toBeDefined();
        expect(body.data.name).toEqual(data.toJSON().name);
      });
  });
});
