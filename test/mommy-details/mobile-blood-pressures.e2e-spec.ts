import { CreateBloodPressureDto } from '@/modules/mommy-detail/dto/blood-pressure.dto';
import { EMommyBloodPressureStatus } from '@/modules/mommy-detail/mommy-detail.enums';
import { MommyDetailSchema } from '@/modules/mommy-detail/mommy-detail.schema';
import { RoleSchema } from '@/modules/role/role.schema';
import { IUser } from '@/modules/user/user.interface';
import { UserSchema } from '@/modules/user/user.schema';
import 'dotenv/config';
import mongoose from 'mongoose';
import request from 'supertest';
import {
  faker,
  forbiddenExpects,
  MONGO_DB_OPTIONS,
  otherLogin,
  tocologistLogin,
  unauthorizedExpects,
  validationFailExpects,
} from '../helpers';

const title = 'Mobile Blood Pressures';
const baseUrl = 'http://localhost:2500/mobile';
const url = '/blood-pressures';

const createData: CreateBloodPressureDto = {
  systolic: 110,
  diastolic: 80,
  status: EMommyBloodPressureStatus.NORMAL,
};

const updateData = {
  diastolic: 90,
};

let token: string;
let unauthorizedToken: string;
let MommyDetail: mongoose.Model<mongoose.Document, {}>;
let User: mongoose.Model<mongoose.Document, {}>;
let Role: mongoose.Model<mongoose.Document, {}>;
let user: any;
let foundData: any;
let bloodId: string;

beforeAll(async () => {
  const MONGOOSE_URI = `${process.env.DB_URL}/${process.env.DB_NAME}`;
  await mongoose.connect(MONGOOSE_URI, MONGO_DB_OPTIONS);
  MommyDetail = mongoose.model(
    'MommyDetail',
    MommyDetailSchema,
    'mommy_details'
  );
  User = mongoose.model('User', UserSchema);
  Role = mongoose.model('Role', RoleSchema);
  const mommyRole = await Role.findOne({ slug: 'mommy' });
  const userData: Partial<IUser> = {
    email: faker.email(),
    firstName: faker.first(),
    lastName: faker.last(),
    password: 'password',
    phone: faker.phone(),
    role: mommyRole._id,
    isActive: true,
  };
  user = await User.create(userData);
  const tokenData = await otherLogin(userData.email, 'mobile');
  token = tokenData.token;
  const tokenData2 = await tocologistLogin();
  unauthorizedToken = tokenData2.token;
});

afterAll(async done => {
  await MommyDetail.deleteOne({ user: user._id });

  await user.remove();
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
        expect(body.meta).toBeDefined();
        expect(body.meta.status).toEqual(200);
        expect(body.meta.message).toEqual('Blood Pressures');
        expect(body.data).toBeDefined();
        expect(Array.isArray(body.data)).toBeTruthy();
        expect(body.other).toBeDefined();
        expect(Array.isArray(body.other.status)).toBeTruthy();
        expect(body.other.status).toEqual(
          expect.arrayContaining(['Darah Rendah', 'Normal', 'Darah Tinggi'])
        );
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
    delete postData.systolic;
    return request(baseUrl)
      .post(url)
      .set({ Authorization: `Bearer ${token}` })
      .send(postData)
      .expect(400)
      .expect(({ body }) => {
        validationFailExpects(expect, body, 'systolic');
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
        foundData = await MommyDetail.findOne({ user: user._id });
        expect(foundData).toBeDefined();
        expect(foundData.bloodPressures).toBeDefined();
        expect(Array.isArray(foundData.bloodPressures)).toBeTruthy();
        expect(foundData.bloodPressures[0].systolic).toEqual(
          createData.systolic
        );
      });
  });
});

describe(`${title} Detail`, () => {
  it('cannot get detail if not authenticated', async () => {
    foundData = await MommyDetail.findOne({ user: user._id });

    bloodId = foundData.bloodPressures[0]._id;
    return request(baseUrl)
      .get(`${url}/${bloodId}`)
      .expect(401)
      .expect(({ body }) => {
        unauthorizedExpects(expect, body);
      });
  });
  it('cannot get detail if forbidden', async () => {
    return request(baseUrl)
      .get(`${url}/${bloodId}`)
      .set({ Authorization: `Bearer ${unauthorizedToken}` })
      .expect(403)
      .expect(({ body }) => {
        forbiddenExpects(expect, body);
      });
  });
  it('can get detail', async () => {
    return request(baseUrl)
      .get(`${url}/${bloodId}`)
      .set({ Authorization: `Bearer ${token}` })
      .expect(200)
      .expect(({ body }) => {
        expect(body.meta).toBeDefined();
        expect(body.meta.status).toEqual(200);
        expect(body.meta.message).toEqual('Blood Pressure item retrieved');
        expect(body.data).toBeDefined();
        expect(body.data.systolic).toEqual(createData.systolic);
      });
  });
});

describe(`${title} Update`, () => {
  it('cannot update if not authenticated', async () => {
    return request(baseUrl)
      .put(`${url}/${bloodId}`)
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
      .put(`${url}/${bloodId}`)
      .set({ Authorization: `Bearer ${token}` })
      .send(updateData)
      .expect(200)
      .expect(async ({ body }) => {
        expect(body.meta).toBeDefined();
        expect(body.meta.status).toEqual(200);
        expect(body.data.diastolic).toEqual(updateData.diastolic);
      });
  });
});

describe(`${title} Delete`, () => {
  it('cannot delete if not authenticated', async () => {
    return request(baseUrl)
      .delete(`${url}/${bloodId}`)
      .expect(401)
      .expect(({ body }) => {
        unauthorizedExpects(expect, body);
      });
  });
  it('cannot delete if forbidden', async () => {
    return request(baseUrl)
      .delete(`${url}/${bloodId}`)
      .set({ Authorization: `Bearer ${unauthorizedToken}` })
      .expect(403)
      .expect(({ body }) => {
        forbiddenExpects(expect, body);
      });
  });
  it('can delete', async () => {
    return request(baseUrl)
      .delete(`${url}/${bloodId}`)
      .set({ Authorization: `Bearer ${token}` })
      .expect(200)
      .expect(async ({ body }) => {
        expect(body.meta).toBeDefined();
        expect(body.meta.status).toEqual(200);
        expect(body.meta.message).toEqual('Blood Pressure deleted');
      });
  });
});
