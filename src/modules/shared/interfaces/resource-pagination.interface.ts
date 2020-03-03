import { IsIn, IsInt, IsOptional, IsString, MaxLength } from 'class-validator';
import { ArgsType, Field, Int } from 'type-graphql';
export interface ResourcePagination {
  page: string;
  limit: string;
  search: string;
  sortBy: string;
  sortMode: SortMode;
}

enum SortMode {
  asc = 1,
  desc = -1,
}

@ArgsType()
export class ArgsResourcePagination {
  @Field(() => Int)
  @IsOptional()
  @IsInt()
  page: number;

  @Field(() => Int)
  @IsOptional()
  @IsInt()
  limit: number;

  @Field()
  @IsOptional()
  @IsString()
  @MaxLength(250)
  search: string;

  @Field(() => Int)
  @IsOptional()
  @IsIn([SortMode.asc, SortMode.desc])
  sortMode: string;

  @Field(() => Int)
  @IsOptional()
  @IsString()
  sortBy: string;
}
