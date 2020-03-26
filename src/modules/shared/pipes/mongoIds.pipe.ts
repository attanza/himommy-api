import { IsArray, IsMongoId, IsOptional } from 'class-validator';

export class MongoIdsPipe {
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  ids: string[];
}
