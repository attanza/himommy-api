import { CreateAppVersionDto } from '@/modules/app-version/app-version.dto';
import { EPlatform } from '@/modules/app-version/app-version.interface';
import { AppVersionSchema } from '@/modules/app-version/app-version.schema';
import 'dotenv/config';
import mongoose from 'mongoose';
import request from 'supertest';
import {
  MONGO_DB_OPTIONS,
  resourceListExpects,
  superAdminLogin,
  unauthorizedExpects,
  validationFaildExpects,
} from '../helpers';

const title = 'Admin App Versions';
const url = 'http://localhost:2500/admin';

const createData: CreateAppVersionDto = {
  platform: EPlatform.DASHBOARD,
  version: '3.0.0',
};

let token: string;
let AppVersion: mongoose.Model<mongoose.Document, {}>;

beforeAll(async () => {
  const tokenData = await superAdminLogin();
  token = tokenData.token;

  const MONGOSE_URI = `${process.env.DB_URL}/${process.env.DB_NAME}`;
  await mongoose.connect(MONGOSE_URI, MONGO_DB_OPTIONS);
  AppVersion = mongoose.model('AppVersion', AppVersionSchema, 'app_versions');
});

afterAll(async done => {
  await AppVersion.deleteOne({ version: createData.version });
  await mongoose.disconnect(done);
});

describe(`${title} List`, () => {
  it('cannot get list if not authenticated', () => {
    return request(url)
      .get('/app-versions')
      .expect(401)
      .expect(({ body }) => {
        unauthorizedExpects(expect, body);
      });
  });
  it('can get list', async () => {
    return request(url)
      .get('/app-versions')
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
    return request(url)
      .post('/app-versions')
      .send(createData)
      .expect(401)
      .expect(({ body }) => {
        unauthorizedExpects(expect, body);
      });
  });
  it('cannot create if incomplete data', () => {
    const postData = { ...createData };
    delete postData.platform;
    return request(url)
      .post('/app-versions')
      .set({ Authorization: `Bearer ${token}` })
      .send(postData)
      .expect(400)
      .expect(({ body }) => {
        validationFaildExpects(expect, body, 'platform');
      });
  });
  it('can create', () => {
    return request(url)
      .post('/app-versions')
      .set({ Authorization: `Bearer ${token}` })
      .send(createData)
      .expect(201)
      .expect(async ({ body }) => {
        expect(body.meta).toBeDefined();
        expect(body.meta.status).toEqual(201);
        const created = await AppVersion.findOne({
          version: createData.version,
        });
        expect(created).toBeDefined();
        expect(created.toJSON().platform).toEqual(createData.platform);
      });
  });
});

describe(`${title} Detail`, () => {
  it('cannot get detail if not authenticated', async () => {
    const appVersion = await AppVersion.findOne({
      version: createData.version,
    });
    return request(url)
      .get(`/app-versions/${appVersion._id}`)
      .expect(401)
      .expect(({ body }) => {
        unauthorizedExpects(expect, body);
      });
  });
  it('can get detail', async () => {
    const appVersion = await AppVersion.findOne({
      version: createData.version,
    });
    return request(url)
      .get(`/app-versions/${appVersion._id}`)
      .set({ Authorization: `Bearer ${token}` })
      .expect(200)
      .expect(({ body }) => {
        expect(body.meta).toBeDefined();
        expect(body.meta.status).toEqual(200);
        expect(body.data).toBeDefined();
        expect(body.data.platform).toEqual(appVersion.toJSON().platform);
        expect(body.data.version).toEqual(appVersion.toJSON().version);
      });
  });
});

describe(`${title} Update`, () => {
  it('cannot update if not authenticated', async () => {
    const appVersion = await AppVersion.findOne({
      version: createData.version,
    });
    const updateData = {};
    return request(url)
      .put(`/app-versions/${appVersion._id}`)
      .expect(401)
      .expect(({ body }) => {
        unauthorizedExpects(expect, body);
      });
  });
  // it('can get detail', async () => {
  //   const appVersion = await AppVersion.findOne({
  //     version: createData.version,
  //   });
  //   return request(url)
  //     .get(`/app-versions/${appVersion._id}`)
  //     .set({ Authorization: `Bearer ${token}` })
  //     .expect(200)
  //     .expect(({ body }) => {
  //       expect(body.meta).toBeDefined();
  //       expect(body.meta.status).toEqual(200);
  //       expect(body.data).toBeDefined();
  //       expect(body.data.platform).toEqual(appVersion.toJSON().platform);
  //       expect(body.data.version).toEqual(appVersion.toJSON().version);
  //     });
  // });
});

// it('title', () => {
//   return request(url)
//     .post('/ ')
//     .expect(({ body }) => {
//         console.log('body', JSON.stringify(body, null, 2));
//     });
// });
