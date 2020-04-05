import { CheckListService } from '@modules/check-list/check-list.service';
import { Redis } from '@modules/helpers/redis';
import { UpdateMommyDto } from '@modules/mommy-detail/dto/mommy-detail.dto';
import { MommyDetailService } from '@modules/mommy-detail/mommy-detail.service';
import { QuestionService } from '@modules/question/question.service';
import { QueueService } from '@modules/queue/queue.service';
import { UpdateTocologistDto } from '@modules/tocologist/tocologist.dto';
import { ITocologist } from '@modules/tocologist/tocologist.interface';
import { TocologistService } from '@modules/tocologist/tocologist.service';
import { UpdateUserDto } from '@modules/user/user.dto';
import { IUser } from '@modules/user/user.interface';
import { UserService } from '@modules/user/user.service';
import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import { ChangePasswordDto } from './profile.dto';

@Injectable()
export class ProfileService {
  constructor(
    private userService: UserService,
    private queueService: QueueService,
    private mommyService: MommyDetailService,
    private tocologistService: TocologistService,
    private checkListService: CheckListService,
    private questionService: QuestionService
  ) {}
  async changePassword(user: IUser, changePasswordDto: ChangePasswordDto) {
    return this.userService.changePassword(user, changePasswordDto);
  }

  async saveAvatar(avatar: any, userId: string): Promise<IUser> {
    const user: IUser = await this.userService.getById({ id: userId });
    const imageString = avatar.path.split('public')[1];
    const oldAvatar = 'public' + user.avatar;
    user.avatar = imageString;
    try {
      await Promise.all([
        user.save(),
        fs.promises.unlink(oldAvatar),
        this.queueService.resizeImage(avatar),
        Redis.deletePattern(`User_${userId}`),
      ]);
    } catch (e) {
      Logger.debug(oldAvatar + ' not exists');
    }
    return user;
  }

  async updateUser(id: string, updateDto: UpdateUserDto) {
    if (updateDto.email) {
      this.userService.isUnique('email', updateDto.email, id);
    }
    if (updateDto.phone) {
      this.userService.isUnique('phone', updateDto.phone, id);
    }
    await this.userService.dbUpdate('User', id, updateDto);
    return this.userService.findByIdWithRolePermissions(id);
  }

  async updateDetail(updateDto: Partial<UpdateMommyDto>) {
    return await this.mommyService.createOrUpdateDetail(updateDto);
  }

  async updateTocologistDetail(
    id: string,
    updateDto: UpdateTocologistDto
  ): Promise<ITocologist> {
    await this.tocologistService.dbUpdate('Tocologist', id, updateDto);
    return await this.tocologistService.getById({ id });
  }

  async isCheckListsExists(checkLists: string[]): Promise<void> {
    await this.checkListService.isCheckListsExists(checkLists);
  }

  async isQuestionsExists(questions: string[]): Promise<void> {
    await this.questionService.isQuestionsExists(questions);
  }

  async getLevelFromIds(questions: string[]): Promise<number> {
    return await this.questionService.getLevelFromIds(questions);
  }
}
