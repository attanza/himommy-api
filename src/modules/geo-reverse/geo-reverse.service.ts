import { Redis } from '@modules/helpers/redis';
import { DbService } from '@modules/shared/services/db.service';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import axios from 'axios';
import { Model } from 'mongoose';
import { IGeoReverse } from './geo-reverse.interface';
@Injectable()
export class GeoReverseService extends DbService {
  constructor(@InjectModel('GeoReverse') private model: Model<IGeoReverse>) {
    super(model);
  }

  async getAddressFromLatLong(lat: number, lon: number): Promise<IGeoReverse> {
    try {
      // Check from Redis
      const redisKey = `GeoReverse_${lat}_${lon}`;
      const cache = await Redis.get(redisKey);
      if (cache != null) {
        Logger.log('Get GeoReverse from Cache');
        return JSON.parse(cache);
      }

      // Check From DB
      const data: IGeoReverse = await this.model.findOne({ lat, lon }).lean();
      if (data) {
        Redis.set(redisKey, JSON.stringify(data));
        Logger.log('Get GeoReverse from DB');
        return data;
      }

      // Get From LocationIQ API
      const LOCATIONIQ_TOKEN: string = process.env.LOCATIONIQ_TOKEN;
      const url = `https://us1.locationiq.com/v1/reverse.php?key=${LOCATIONIQ_TOKEN}&lat=${lat}&lon=${lon}&format=json`;
      const resp = await axios.get(url).then(res => res.data);
      if (resp) {
        // save into db
        const geoReverseData = {
          lat: resp.lat,
          lon: resp.lon,
          displayName: resp.display_name,
          address: { ...resp.address, countryCode: resp.address.country_code },
        };
        const newGeoReverse: IGeoReverse = await this.dbStore(
          'GeoReverse',
          geoReverseData
        );
        // save into redis
        Redis.set(redisKey, JSON.stringify(newGeoReverse));
        Logger.log('Get GeoReverse from API');
        return newGeoReverse;
      }
      return null;
    } catch (e) {
      Logger.log(JSON.stringify(e));
      return null;
    }
  }
}
// {
//   "place_id": "333758478609",
//   "osm_type": "node",
//   "osm_id": "5889477214",
//   "licence": "https://locationiq.com/attribution",
//   "lat": "40.748736",
//   "lon": "-73.98486",
//   "display_name": "358, 5th Avenue, Midtown West, New York, New York County, New York, 10001, USA",
//   "boundingbox": ["40.748736", "40.748736", "-73.98486", "-73.98486"],
//   "importance": 0.225,
//   "address": {
//       "house_number": "358",
//       "road": "5th Avenue",
//       "neighbourhood": "Midtown West",
//       "city": "New York",
//       "county": "New York County",
//       "state": "New York",
//       "postcode": "10001",
//       "country": "United States of America",
//       "country_code": "us"
//   }
// }
