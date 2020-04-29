import { Role } from '@guards/role.decorator';
import { RoleGuard } from '@guards/role.guard';
import { Redis } from '@modules/helpers/redis';
import {
  apiCreated,
  apiDeleted,
  apiItem,
  apiUpdated,
  mommyDetail,
} from '@modules/helpers/responseParser';
import { GetUser } from '@modules/shared/decorators/get-user.decorator';
import {
  IApiItem,
  IMommyGraphics,
} from '@modules/shared/interfaces/response-parser.interface';
import { MongoIdPipe } from '@modules/shared/pipes/mongoId.pipe';
import { IUser } from '@modules/user/user.interface';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateUrineDto } from '../dto/urine.dto';
import { EMommyUrineStatus } from '../mommy-detail.enums';
import { IMommyDetail, IMommyUrine } from '../mommy-detail.interface';
import { MommyDetailService } from '../mommy-detail.service';

@Controller('/mobile/urines')
@UseGuards(AuthGuard('jwt'), RoleGuard)
export class UrineController {
  constructor(private dbService: MommyDetailService) {}

  @Get()
  @Role('mommy')
  async getUrines(@GetUser() user: IUser): Promise<IMommyGraphics> {
    const status = [
      EMommyUrineStatus.NEGATIVE,
      EMommyUrineStatus.POSITIVE_1,
      EMommyUrineStatus.POSITIVE_2,
      EMommyUrineStatus.POSITIVE_3,
      EMommyUrineStatus.POSITIVE_4,
    ];
    const other = { status };
    const urines = user.detail && user.detail.urines ? user.detail.urines : [];
    return mommyDetail('Urine', urines, other);
  }

  @Post()
  @UsePipes(ValidationPipe)
  @Role('mommy')
  async store(
    @GetUser() user: IUser,
    @Body() createData: CreateUrineDto
  ): Promise<IApiItem> {
    const urineData: IMommyUrine = {
      urine: createData.urine,
      date: new Date(),
    };

    const detail: IMommyDetail = await this.dbService.getByKey(
      'user',
      user._id
    );

    detail.urines = this.dbService.checkDuplicate(detail.urines, urineData);
    detail.urines.push(urineData);

    await detail.save();
    await Redis.deletePattern('MommyDetail_user_*');
    return apiCreated('Urine', detail.urines);
  }

  @Get(':id')
  @UsePipes(ValidationPipe)
  @Role('mommy')
  async show(
    @GetUser() user: IUser,
    @Param() param: MongoIdPipe
  ): Promise<IApiItem> {
    const urines =
      user.detail && user.detail.urines ? user.detail.urines : null;
    if (!urines) {
      throw new BadRequestException('Urine not found');
    }
    const { id } = param;
    const index = urines.findIndex(w => w._id.toString() === id);
    if (index === -1) {
      throw new BadRequestException('Urine not found');
    }
    return apiItem('Urine', urines[index]);
  }

  @Put(':id')
  @UsePipes(ValidationPipe)
  @Role('mommy')
  async update(
    @GetUser() user: IUser,
    @Param() param: MongoIdPipe,
    @Body() updateData: CreateUrineDto
  ): Promise<IApiItem> {
    const { id } = param;
    const index = user.detail.urines.findIndex(w => w._id.toString() === id);
    if (index === -1) {
      throw new BadRequestException('Urine not found');
    }

    const urine = user.detail.urines[index];
    Object.keys(updateData).map(key => {
      urine[key] = updateData[key];
    });
    const detail: IMommyDetail = await this.dbService.getByKey(
      'user',
      user._id
    );

    detail.urines.splice(index, 1, urine);
    await detail.save();
    await Redis.deletePattern('MommyDetail_user_*');
    return apiUpdated('Urine', user.detail.urines[index]);
  }

  @Delete(':id')
  @UsePipes(ValidationPipe)
  @Role('mommy')
  async destroy(
    @GetUser() user: IUser,
    @Param() param: MongoIdPipe
  ): Promise<IApiItem> {
    const { id } = param;
    const index = user.detail.urines.findIndex(w => w._id.toString() === id);
    if (index === -1) {
      throw new BadRequestException('Urine not found');
    }

    const detail: IMommyDetail = await this.dbService.getByKey(
      'user',
      user._id
    );

    detail.urines.splice(index, 1);
    await detail.save();
    await Redis.deletePattern('MommyDetail_user_*');

    return apiDeleted('Urine');
  }
}
