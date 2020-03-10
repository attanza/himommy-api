import { IsLatitude, IsLongitude, IsNotEmpty } from 'class-validator';

export class GeoReverseQueryPipe {
  @IsNotEmpty()
  @IsLatitude()
  lat: number;

  @IsNotEmpty()
  @IsLongitude()
  lon: number;
}
