import { IsArray, IsMongoId, IsNotEmpty } from 'class-validator';

export class CreateMommyCheckListDto {
  @IsNotEmpty()
  @IsArray()
  @IsMongoId({ each: true })
  checkLists: string[];
}
