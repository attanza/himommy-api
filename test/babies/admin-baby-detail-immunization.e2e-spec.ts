import { ESex, IBaby } from '@/modules/baby/baby.interface';
import { BabySchema } from '@/modules/baby/baby.schema';
import { CreateBabyDto } from '@/modules/baby/dto/baby.dto';
import { ImmunizationSchema } from '@/modules/immunization/immunization.schema';
import { UserSchema } from '@/modules/user/user.schema';
import 'dotenv/config';
import mongoose from 'mongoose';
import request from 'supertest';
import {
  faker,
  forbiddenExpects,
  MONGO_DB_OPTIONS,
  superAdmin1Login,
  tocologistLogin,
  unauthorizedExpects,
} from '../helpers';

const title = 'Admin Baby Detail Immunizations';
const baseUrl = 'http://localhost:2500/admin';
let url = '/babies';
const babyData: CreateBabyDto = {
  name: faker.name(),
  dob: faker.date(),
  sex: ESex.MALE,
  parent: '',
  checkLists: [],
};

let token: string;
let Baby: mongoose.Model<mongoose.Document, {}>;
let User: mongoose.Model<mongoose.Document, {}>;
let Immunization: mongoose.Model<mongoose.Document, {}>;
let foundData: any;
let immunizationId: string;

const createData = {
  immunization: '',
};
beforeAll(async () => {
  const tokenData = await superAdmin1Login();
  token = tokenData.token;

  const MONGOOSE_URI = `${process.env.DB_URL}/${process.env.DB_NAME}`;
  await mongoose.connect(MONGOOSE_URI, MONGO_DB_OPTIONS);
  Baby = mongoose.model('BabySchema', BabySchema, 'babies');
  User = mongoose.model('User', UserSchema);
  Immunization = mongoose.model('Immunization', ImmunizationSchema);
  const parent = await User.findOne({ email: 'mommy_2@himommy.org' });
  babyData.parent = parent._id;
  foundData = await Baby.create(babyData);
  url = `/babies/${foundData._id}/immunizations`;
  const immunizationData = await Immunization.findOne();
  createData.immunization = immunizationData._id;
});

afterAll(async done => {
  await Baby.deleteOne({ name: babyData.name });
  await mongoose.disconnect(done);
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
    return request(baseUrl)
      .post(url)
      .set({ Authorization: `Bearer ${token}` })
      .expect(400)
      .expect(({ body }) => {
        expect(body.meta).toBeDefined();
        expect(body.meta.status).toEqual(400);
        expect(body.meta.message).toBeDefined();
        expect(body.meta.message).toEqual('immunization is required');
      });
  });
  it('cannot create if not a valid mongo', () => {
    return request(baseUrl)
      .post(url)
      .set({ Authorization: `Bearer ${token}` })
      .send({
        immunization: 'asd',
      })
      .expect(400)
      .expect(({ body }) => {
        expect(body.meta).toBeDefined();
        expect(body.meta.status).toEqual(400);
        expect(body.meta.message).toBeDefined();
        expect(body.meta.message).toEqual(
          'immunization should be a valid mongo id'
        );
      });
  });
  it('cannot create if immunization not exists', () => {
    return request(baseUrl)
      .post(url)
      .set({ Authorization: `Bearer ${token}` })
      .send({
        immunization: foundData._id,
      })
      .expect(400)
      .expect(({ body }) => {
        expect(body.meta).toBeDefined();
        expect(body.meta.status).toEqual(400);
        expect(body.meta.message).toBeDefined();
        expect(body.meta.message).toEqual('immunization not exists');
      });
  });
  it('can create', () => {
    return request(baseUrl)
      .post(url)
      .set({ Authorization: `Bearer ${token}` })
      .send(createData)
      .expect(200)
      .expect(async ({ body }) => {
        expect(body.meta).toBeDefined();
        expect(body.meta.status).toEqual(200);
        const created = await Baby.findById(foundData._id);
        const baby: IBaby = created.toJSON();
        expect(baby.immunizations).toBeDefined();
        expect(Array.isArray(baby.immunizations)).toBeTruthy();
        expect(baby.immunizations[0].immunization).toEqual(
          createData.immunization
        );
        immunizationId = baby.immunizations[0]._id;
      });
  });
});

describe(`${title} Update`, () => {
  it('cannot update if not authenticated', async () => {
    return request(baseUrl)
      .put(url)
      .expect(401)
      .expect(({ body }) => {
        unauthorizedExpects(expect, body);
      });
  });
  it('cannot update if forbidden', async () => {
    const tokenData = await tocologistLogin();
    return request(baseUrl)
      .put(url)
      .set({ Authorization: `Bearer ${tokenData.token}` })
      .expect(403)
      .expect(({ body }) => {
        forbiddenExpects(expect, body);
      });
  });

  it('can update', async () => {
    const updateData = {
      immunizationId,
      immunization: createData.immunization,
    };
    return request(baseUrl)
      .put(url)
      .set({ Authorization: `Bearer ${token}` })
      .send(updateData)
      .expect(200)
      .expect(async ({ body }) => {
        expect(body.meta).toBeDefined();
        expect(body.meta.status).toEqual(200);
        const updated = await Baby.findById(foundData._id);
        const baby: IBaby = updated.toJSON();
        expect(baby.immunizations).toBeDefined();
        expect(Array.isArray(baby.immunizations)).toBeTruthy();
        expect(baby.immunizations[0].immunization).toEqual(
          updateData.immunization
        );
      });
  });
});

describe(`${title} Delete`, () => {
  it('cannot delete if not authenticated', async () => {
    return request(baseUrl)
      .delete(url)
      .expect(401)
      .expect(({ body }) => {
        unauthorizedExpects(expect, body);
      });
  });
  it('cannot delete if forbidden', async () => {
    const tokenData = await tocologistLogin();
    return request(baseUrl)
      .delete(url)
      .set({ Authorization: `Bearer ${tokenData.token}` })
      .expect(403)
      .expect(({ body }) => {
        forbiddenExpects(expect, body);
      });
  });
  it('can delete', async () => {
    return request(baseUrl)
      .delete(url)
      .set({ Authorization: `Bearer ${token}` })
      .send({
        immunizationId,
      })
      .expect(200)
      .expect(async ({ body }) => {
        expect(body.meta).toBeDefined();
        expect(body.meta.status).toEqual(200);
      });
  });
});
