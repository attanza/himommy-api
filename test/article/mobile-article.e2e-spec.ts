import { ArticleSchema } from '@/modules/article/article.schema';
import 'dotenv/config';
import mongoose from 'mongoose';
import request from 'supertest';
import {
  MONGO_DB_OPTIONS,
  resourceListExpects,
  superAdminLogin,
} from '../helpers';

const title = 'Mobile Articles';
const baseUrl = 'http://localhost:2500/mobile';
const url = '/articles';
let token: string;
let Article: mongoose.Model<mongoose.Document, {}>;

beforeAll(async () => {
  const tokenData = await superAdminLogin();
  token = tokenData.token;

  const MONGOOSE_URI = `${process.env.DB_URL}/${process.env.DB_NAME}`;
  await mongoose.connect(MONGOOSE_URI, MONGO_DB_OPTIONS);
  Article = mongoose.model('Article', ArticleSchema);
});

afterAll(async done => {
  await mongoose.disconnect(done);
});

describe(`${title} List`, () => {
  it('can get list', async () => {
    return request(baseUrl)
      .get(url)
      .set('Content-Type', 'application/json')
      .expect(200)
      .expect(({ body }) => {
        resourceListExpects(expect, body);
      });
  });

  it('can get by id', async () => {
    const data = await Article.findOne();
    return request(baseUrl)
      .get(`${url}/${data._id}`)
      .set('Content-Type', 'application/json')
      .expect(200)
      .expect(({ body }) => {
        expect(body.meta).toBeDefined();
        expect(body.meta.status).toEqual(200);
        expect(body.meta.message).toBeDefined();
        expect(body.data).toBeDefined();
        expect(body.data.title).toEqual(data.toJSON().title);
      });
  });
});
