import { EPlatform } from '@/modules/app-version/app-version.interface';
import 'dotenv/config';
import request from 'supertest';

const title = 'Mobile App Versions';
const url = 'http://localhost:2500/mobile';

describe(`${title} Detail`, () => {
  it('can get list', async () => {
    return request(url)
      .get('/app-version')
      .query({ platform: EPlatform.ANDROID_MOMMY })
      .expect(200)
      .expect(({ body }) => {
        expect(body.meta).toBeDefined();
        expect(body.meta.status).toEqual(200);
        expect(body.meta.message).toEqual('App Version item retrieved');
        expect(body.data).toBeDefined();
        expect(body.data.platform).toEqual(EPlatform.ANDROID_MOMMY);
      });
  });
});
