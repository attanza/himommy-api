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

export const faker = new Chance();

export const MONGO_DB_OPTIONS = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
};
