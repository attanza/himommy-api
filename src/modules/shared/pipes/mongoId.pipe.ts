import { IsMongoId } from 'class-validator';

export class MongoIdPipe {
  @IsMongoId()
  id: string;
}
