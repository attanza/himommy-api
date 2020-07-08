import request from 'supertest';
import {
  forbiddenExpects,
  resourceListExpects,
  unauthorizedExpects,
} from './helpers';

interface IListTest {
  baseUrl: string;
  url: string;
  unauthorizedToken: string;
  token: string;
  it: jest.It;
}

export const listTests = ({
  baseUrl,
  url,
  unauthorizedToken,
  token,
  it,
}: IListTest) => {
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
};
