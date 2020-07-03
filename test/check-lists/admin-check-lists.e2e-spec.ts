import {
  CreateCheckListDto,
  UpdateCheckListDto,
} from '@/modules/check-list/check-list.dto';
import { ECheckListCategory } from '@/modules/check-list/check-list.interface';
import { CheckListSchema } from '@/modules/check-list/check-list.schema';
import 'dotenv/config';
import mongoose from 'mongoose';
import request from 'supertest';
import {
  faker,
  forbiddenExpects,
  MONGO_DB_OPTIONS,
  resourceListExpects,
  superAdminLogin,
  tocologistLogin,
  unauthorizedExpects,
  validationFailExpects,
} from '../helpers';

const title = 'Admin Check Lists';
const baseUrl = 'http://localhost:2500/admin';
const url = '/check-lists';
const createData: CreateCheckListDto = {
  age: faker.integer({ min: 1, max: 12 }),
  category: ECheckListCategory.HEALTH,
  item: faker.sentence(),
  description: faker.sentence(),
};

let token: string;
let CheckList: mongoose.Model<mongoose.Document, {}>;
let foundData: any;

beforeAll(async () => {
  const tokenData = await superAdminLogin();
  token = tokenData.token;

  const MONGOOSE_URI = `${process.env.DB_URL}/${process.env.DB_NAME}`;
  await mongoose.connect(MONGOOSE_URI, MONGO_DB_OPTIONS);
  CheckList = mongoose.model('CheckList', CheckListSchema, 'check_lists');
});

afterAll(async done => {
  await CheckList.deleteOne({ item: createData.item });
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
    delete postData.item;
    return request(baseUrl)
      .post(url)
      .set({ Authorization: `Bearer ${token}` })
      .send(postData)
      .expect(400)
      .expect(({ body }) => {
        validationFailExpects(expect, body, 'item');
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
        const created = await CheckList.findOne({
          item: createData.item,
        });
        expect(created).toBeDefined();
        expect(created.toJSON().item).toEqual(createData.item);
      });
  });
});

describe(`${title} Detail`, () => {
  it('cannot get detail if not authenticated', async () => {
    foundData = await CheckList.findOne({
      item: createData.item,
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
        expect(body.data.item).toEqual(foundData.toJSON().item);
        expect(body.data.description).toEqual(foundData.toJSON().description);
      });
  });
});

describe(`${title} Update`, () => {
  it('cannot update if not authenticated', async () => {
    const updateData: Partial<UpdateCheckListDto> = {
      description: faker.sentence(),
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
    const updateData: Partial<UpdateCheckListDto> = {
      description: faker.sentence(),
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
    const updateData: Partial<UpdateCheckListDto> = {
      description: faker.sentence(),
    };
    return request(baseUrl)
      .put(`${url}/${foundData._id}`)
      .set({ Authorization: `Bearer ${token}` })
      .send(updateData)
      .expect(200)
      .expect(async ({ body }) => {
        expect(body.meta).toBeDefined();
        expect(body.meta.status).toEqual(200);
        expect(body.data.description).toEqual(updateData.description);
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
        expect(body.meta.message).toEqual('CheckList deleted');
      });
  });
});
