import { IsIn, IsNotEmpty } from 'class-validator';
export class IComboDataQuery {
  @IsNotEmpty()
  @IsIn(['role'])
  resource: string;
}
