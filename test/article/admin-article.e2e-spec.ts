import {
  CreateArticleDto,
  UpdateArticleDto,
} from '@/modules/article/article.dto';
import { EArticleCategory } from '@/modules/article/article.interface';
import { ArticleSchema } from '@/modules/article/article.schema';
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

const title = 'Admin Articles';
const baseUrl = 'http://localhost:2500/admin';
const url = '/articles';
const createData: CreateArticleDto = {
  title: faker.sentence(),
  subtitle: faker.sentence(),
  content: faker.paragraph(),
  age: faker.integer({ min: 1, max: 12 }),
  category: EArticleCategory.ARTICLES,
};

let token: string;
let Article: mongoose.Model<mongoose.Document, {}>;

beforeAll(async () => {
  const tokenData = await superAdmin0Login();
  token = tokenData.token;

  const MONGOOSE_URI = `${process.env.DB_URL}/${process.env.DB_NAME}`;
  await mongoose.connect(MONGOOSE_URI, MONGO_DB_OPTIONS);
  Article = mongoose.model('Article', ArticleSchema);
});

afterAll(async done => {
  await Article.deleteOne({ title: createData.title });
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
        const created = await Article.findOne({
          title: createData.title,
        });
        expect(created).toBeDefined();
        expect(created.toJSON().title).toEqual(createData.title);
      });
  });
});

describe(`${title} Detail`, () => {
  it('cannot get detail if not authenticated', async () => {
    const data = await Article.findOne({
      title: createData.title,
    });
    return request(baseUrl)
      .get(`${url}/${data._id}`)
      .expect(401)
      .expect(({ body }) => {
        unauthorizedExpects(expect, body);
      });
  });
  it('cannot get detail if forbidden', async () => {
    const tokenData = await tocologistLogin();

    const data = await Article.findOne({
      title: createData.title,
    });
    return request(baseUrl)
      .get(`${url}/${data._id}`)
      .set({ Authorization: `Bearer ${tokenData.token}` })
      .expect(403)
      .expect(({ body }) => {
        forbiddenExpects(expect, body);
      });
  });
  it('can get detail', async () => {
    const data = await Article.findOne({
      title: createData.title,
    });
    return request(baseUrl)
      .get(`${url}/${data._id}`)
      .set({ Authorization: `Bearer ${token}` })
      .expect(200)
      .expect(({ body }) => {
        expect(body.meta).toBeDefined();
        expect(body.meta.status).toEqual(200);
        expect(body.data).toBeDefined();
        expect(body.data.title).toEqual(data.toJSON().title);
        expect(body.data.subtitle).toEqual(data.toJSON().subtitle);
      });
  });
});

describe(`${title} Update`, () => {
  it('cannot update if not authenticated', async () => {
    const data = await Article.findOne({
      title: createData.title,
    });
    const updateData: Partial<UpdateArticleDto> = {
      subtitle: faker.sentence(),
    };
    return request(baseUrl)
      .put(`${url}/${data._id}`)
      .send(updateData)
      .expect(401)
      .expect(({ body }) => {
        unauthorizedExpects(expect, body);
      });
  });
  it('cannot update if forbidden', async () => {
    const tokenData = await tocologistLogin();

    const data = await Article.findOne({
      title: createData.title,
    });
    const updateData: Partial<UpdateArticleDto> = {
      subtitle: faker.sentence(),
    };
    return request(baseUrl)
      .put(`${url}/${data._id}`)
      .set({ Authorization: `Bearer ${tokenData.token}` })
      .send(updateData)
      .expect(403)
      .expect(({ body }) => {
        forbiddenExpects(expect, body);
      });
  });

  it('can update', async () => {
    const data = await Article.findOne({
      title: createData.title,
    });
    const updateData: Partial<UpdateArticleDto> = {
      subtitle: faker.sentence(),
    };
    return request(baseUrl)
      .put(`${url}/${data._id}`)
      .set({ Authorization: `Bearer ${token}` })
      .send(updateData)
      .expect(200)
      .expect(async ({ body }) => {
        expect(body.meta).toBeDefined();
        expect(body.meta.status).toEqual(200);
        expect(body.data.subtitle).toEqual(updateData.subtitle);
      });
  });
});

describe(`${title} Delete`, () => {
  it('cannot delete if not authenticated', async () => {
    const data = await Article.findOne({
      title: createData.title,
    });

    return request(baseUrl)
      .delete(`${url}/${data._id}`)
      .expect(401)
      .expect(({ body }) => {
        unauthorizedExpects(expect, body);
      });
  });
  it('cannot delete if forbidden', async () => {
    const tokenData = await tocologistLogin();

    const data = await Article.findOne({
      title: createData.title,
    });

    return request(baseUrl)
      .delete(`${url}/${data._id}`)
      .set({ Authorization: `Bearer ${tokenData.token}` })
      .expect(403)
      .expect(({ body }) => {
        forbiddenExpects(expect, body);
      });
  });
  it('can delete', async () => {
    const data = await Article.findOne({
      title: createData.title,
    });

    return request(baseUrl)
      .delete(`${url}/${data._id}`)
      .set({ Authorization: `Bearer ${token}` })
      .expect(200)
      .expect(async ({ body }) => {
        expect(body.meta).toBeDefined();
        expect(body.meta.status).toEqual(200);
        expect(body.meta.message).toEqual('Article deleted');
      });
  });
});
