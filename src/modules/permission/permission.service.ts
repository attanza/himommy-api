import { BaseDbService } from '@modules/shared/services/baseDb.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IPermission } from './permission.interface';

@Injectable()
export class PermissionService extends BaseDbService {
  constructor(@InjectModel('Permission') private model: Model<IPermission>) {
    super(model);
  }

  async checkPermissionArray(permissions: string[]) {
    if (permissions && permissions.length > 0) {
      const count = await this.model.countDocuments({
        _id: { $in: permissions },
      });
      if (count !== permissions.length) {
        throw new BadRequestException(
          'One or more permission is not exists in database',
        );
      }
    }
  }
}
// export class PermissionService extends DbService {
//   constructor(@InjectModel('Permission') private model: Model<IPermission>) {
//     super(model);
//   }

//   async checkPermissionArray(permissions: string[]) {
//     if (permissions && permissions.length > 0) {
//       const count = await this.model.countDocuments({
//         _id: { $in: permissions },
//       });
//       if (count !== permissions.length) {
//         throw new BadRequestException(
//           'One or more permission is not exists in database',
//         );
//       }
//     }
//   }
// }
