import { IMommyDetail } from '@/modules/mommy-detail/mommy-detail.interface';
import { ITocologist } from '@/modules/tocologist/tocologist.interface';
import { IUser } from '@/modules/user/user.interface';

export interface IAuthContext {
  user: IUser;
  tocologist: ITocologist;
  mommyDetail: IMommyDetail;
}
