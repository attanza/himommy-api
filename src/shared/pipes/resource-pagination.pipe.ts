import {
  IsDateString,
  IsIn,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';

export class ResourcePaginationPipe {
  @IsOptional()
  @IsNumberString()
  page: number;

  @IsOptional()
  @IsNumberString()
  limit: number;

  @IsOptional()
  @IsString()
  search: string;

  @IsOptional()
  @IsString()
  sortBy: string;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortMode: SortMode;

  @IsOptional()
  @IsString()
  dateField: string;

  @IsOptional()
  @IsDateString()
  dateStart: Date;

  @IsOptional()
  @IsDateString()
  dateEnd: Date;

  @IsOptional()
  @IsString()
  fieldKey: string;

  @IsOptional()
  @IsString()
  fieldValue: string;
}

export enum SortMode {
  asc = 1,
  desc = -1,
}
