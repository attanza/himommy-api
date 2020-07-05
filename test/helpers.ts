import { EProvider, LoginDto } from '@/modules/auth/auth.interface';
import Chance from 'chance';
import superagent from 'superagent';

export const superAdminLogin = async () => {
  const url = 'http://localhost:2500';

  const credentials: LoginDto = {
    uid: 'super_administrator@himommy.org',
    password: 'password',
    provider: EProvider.LOCAL,
  };
  return superagent
    .post(`${url}/admin/login`)
    .send(credentials)
    .then(res => res.body.data);
};

export const superAdmin0Login = async () => {
  const url = 'http://localhost:2500';

  const credentials: LoginDto = {
    uid: 'super_administrator_0@himommy.org',
    password: 'password',
    provider: EProvider.LOCAL,
  };
  return superagent
    .post(`${url}/admin/login`)
    .send(credentials)
    .then(res => res.body.data);
};

export const superAdmin1Login = async () => {
  const url = 'http://localhost:2500';

  const credentials: LoginDto = {
    uid: 'super_administrator_1@himommy.org',
    password: 'password',
    provider: EProvider.LOCAL,
  };
  return superagent
    .post(`${url}/admin/login`)
    .send(credentials)
    .then(res => res.body.data);
};

export const superAdmin2Login = async () => {
  const url = 'http://localhost:2500';

  const credentials: LoginDto = {
    uid: 'super_administrator_2@himommy.org',
    password: 'password',
    provider: EProvider.LOCAL,
  };
  return superagent
    .post(`${url}/admin/login`)
    .send(credentials)
    .then(res => res.body.data);
};

export const tocologistLogin = async () => {
  const url = 'http://localhost:2500';

  const credentials: LoginDto = {
    uid: 'tocologist@himommy.org',
    password: 'password',
    provider: EProvider.LOCAL,
  };
  return superagent
    .post(`${url}/tocologist/login`)
    .send(credentials)
    .then(res => res.body.data);
};

export const mommyLogin = async () => {
  const url = 'http://localhost:2500';

  const credentials: LoginDto = {
    uid: 'mommy@himommy.org',
    password: 'password',
    provider: EProvider.LOCAL,
  };
  return superagent
    .post(`${url}/mobile/login`)
    .send(credentials)
    .then(res => res.body.data);
};

export const otherLogin = async (uid: string) => {
  const url = 'http://localhost:2500';

  const credentials: LoginDto = {
    uid,
    password: 'password',
    provider: EProvider.LOCAL,
  };
  return superagent
    .post(`${url}/admin/login`)
    .send(credentials)
    .then(res => res.body.data);
};

export const faker = new Chance();

export const MONGO_DB_OPTIONS = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
};

export const validationFailExpects = (expect, body, field) => {
  expect(body.meta).toBeDefined();
  expect(body.meta.status).toEqual(400);
  expect(body.meta.message).toBeDefined();
  expect(Array.isArray(body.meta.message)).toBeTruthy();
  expect(body.meta.message[0].property).toEqual(field);
};

export const forbiddenExpects = (expect, body) => {
  expect(body.meta).toBeDefined();
  expect(body.meta.status).toEqual(403);
  expect(body.meta.message).toBeDefined();
  expect(body.meta.message).toEqual('Forbidden resource');
};

export const unauthorizedExpects = (expect, body) => {
  expect(body.meta).toBeDefined();
  expect(body.meta.status).toEqual(401);
  expect(body.meta.message).toEqual('Unauthorized');
};

export const resourceListExpects = (expect, body) => {
  expect(body.meta).toBeDefined();
  expect(body.meta.status).toEqual(200);
  expect(body.meta.message).toBeDefined();
  expect(body.meta.total).toBeDefined();
  expect(body.meta.limit).toBeDefined();
  expect(body.meta.page).toBeDefined();
  expect(body.meta.totalPages).toBeDefined();
  expect(body.data).toBeDefined();
};
