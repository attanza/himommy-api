import { Redis } from '@modules/helpers/redis';
import { DbService } from '@modules/shared/services/db.service';
import { IUser } from '@modules/user/user.interface';
import { UserService } from '@modules/user/user.service';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { INotification } from './notification.interface';

@Injectable()
export class NotificationService extends DbService {
  constructor(
    @InjectModel('Notification') private model: Model<INotification>,
    private userService: UserService
  ) {
    super(model);
  }

  async checkUser(userId: string): Promise<boolean> {
    const user: IUser = await this.userService.getByKey('_id', userId);
    if (user) {
      return true;
    } else {
      return false;
    }
  }

  async updateIsRead(id: string, user: string): Promise<void> {
    await this.model.updateOne({ _id: id }, { isRead: true });
    Redis.deletePattern(`Notification_${user}`);
    Redis.deletePattern(`Notification_${id}`);
  }

  async bulkDelete(ids: string[], userId: string): Promise<void> {
    const notifications: INotification[] = await this.getByArray('_id', ids);
    if (notifications && notifications.length > 0) {
      const idsToDelete: string[] = [];
      notifications.map(n => {
        if (n.user._id.toString() !== userId.toString()) {
          throw new ForbiddenException('Resource is forbidden');
        }
        idsToDelete.push(n._id);
      });
      await Promise.all([
        this.bulkDestroy(idsToDelete),
        Redis.del(`Notification_*`),
      ]);
    }
  }
}
