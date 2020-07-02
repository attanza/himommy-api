import { EProvider, LoginDto } from '@/modules/auth/auth.interface';
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
