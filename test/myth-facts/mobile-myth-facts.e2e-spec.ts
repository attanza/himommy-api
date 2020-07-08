import { MythFactSchema } from '@/modules/myth-fact/myth-fact.schema';
import { UserSchema } from '@/modules/user/user.schema';
import 'dotenv/config';
import mongoose from 'mongoose';
import request from 'supertest';
import {
  forbiddenExpects,
  generateToken,
  MONGO_DB_OPTIONS,
  resourceListExpects,
  superAdminLogin,
  unauthorizedExpects,
} from '../helpers';

const title = 'Mobile Myth-facts';
const baseUrl = 'http://localhost:2500/mobile';
const url = '/myth-facts';
let token: string;
let unauthorizedToken: string;
let MythFact: mongoose.Model<mongoose.Document, {}>;
let User: mongoose.Model<mongoose.Document, {}>;
let foundData: any;
beforeAll(async () => {
  const tokenData = await superAdminLogin();
  token = tokenData.token;

  const MONGOOSE_URI = `${process.env.DB_URL}/${process.env.DB_NAME}`;
  await mongoose.connect(MONGOOSE_URI, MONGO_DB_OPTIONS);
  MythFact = mongoose.model('MythFact', MythFactSchema, 'myth_facts');
  User = mongoose.model('User', UserSchema);
  const authorizedTokenData = await generateToken(User, 'mommy_2@himommy.org');
  token = authorizedTokenData.token;
  const unauthorizedTokenData = await generateToken(
    User,
    'tocologist_0@himommy.org'
  );
  unauthorizedToken = unauthorizedTokenData.token;
});

afterAll(async done => {
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

describe(`${title} Detail`, () => {
  it('cannot get detail if not authenticated', async () => {
    foundData = await MythFact.findOne();
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
