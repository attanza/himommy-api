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
import { CreateHemoglobinDto } from '../dto/hemoglobin.dto';
import {
  EMommyHemoglobinStatus,
  EMommyHemoglobinTrimester,
} from '../mommy-detail.enums';
import { IMommyDetail, IMommyHemoglobin } from '../mommy-detail.interface';
import { MommyDetailService } from '../mommy-detail.service';

@Controller('/mobile/hemoglobins')
@UseGuards(AuthGuard('jwt'), RoleGuard)
export class HemoglobinController {
  constructor(private dbService: MommyDetailService) {}

  @Get()
  @Role('mommy')
  async getHemoglobins(@GetUser() user: IUser): Promise<IMommyGraphics> {
    const status = [
      EMommyHemoglobinStatus.LOW,
      EMommyHemoglobinStatus.NORMAL,
      EMommyHemoglobinStatus.MEDIUM,
      EMommyHemoglobinStatus.HEAVY,
    ];
    const trimesters = [
      EMommyHemoglobinTrimester.TRIMESTER_1,
      EMommyHemoglobinTrimester.TRIMESTER_2,
      EMommyHemoglobinTrimester.TRIMESTER_3,
    ];
    const other = { status, trimesters };
    const hemoglobins =
      user.detail && user.detail.hemoglobins ? user.detail.hemoglobins : [];
    return mommyDetail('Hemoglobin', hemoglobins, other);
  }

  @Post()
  @UsePipes(ValidationPipe)
  @Role('mommy')
  async store(
    @GetUser() user: IUser,
    @Body() createData: CreateHemoglobinDto
  ): Promise<IApiItem> {
    const hemoglobinData: IMommyHemoglobin = {
      hemoglobin: createData.hemoglobin,
      trimester: createData.trimester,
      status: createData.status,
      date: new Date(),
    };

    const detail: IMommyDetail = await this.dbService.getByKey(
      'user',
      user._id
    );

    detail.hemoglobins = this.dbService.checkDuplicate(
      detail.hemoglobins,
      hemoglobinData
    );
    detail.hemoglobins.push(hemoglobinData);

    await detail.save();
    await Redis.deletePattern('MommyDetail_user_*');
    return apiCreated('Weight', detail.hemoglobins);
  }

  @Get(':id')
  @UsePipes(ValidationPipe)
  @Role('mommy')
  async show(
    @GetUser() user: IUser,
    @Param() param: MongoIdPipe
  ): Promise<IApiItem> {
    const hemoglobins =
      user.detail && user.detail.hemoglobins ? user.detail.hemoglobins : null;
    if (!hemoglobins) {
      throw new BadRequestException('Hemoglobin not found');
    }
    const { id } = param;
    const index = hemoglobins.findIndex(w => w._id.toString() === id);
    if (index === -1) {
      throw new BadRequestException('Hemoglobin not found');
    }
    return apiItem('Hemoglobin', hemoglobins[index]);
  }

  @Put(':id')
  @UsePipes(ValidationPipe)
  @Role('mommy')
  async update(
    @GetUser() user: IUser,
    @Param() param: MongoIdPipe,
    @Body() updateData: Partial<CreateHemoglobinDto>
  ): Promise<IApiItem> {
    const { id } = param;
    const index = user.detail.hemoglobins.findIndex(
      w => w._id.toString() === id
    );
    if (index === -1) {
      throw new BadRequestException('Hemoglobin not found');
    }

    const hemoglobin = user.detail.hemoglobins[index];
    Object.keys(updateData).map(key => {
      hemoglobin[key] = updateData[key];
    });
    const detail: IMommyDetail = await this.dbService.getByKey(
      'user',
      user._id
    );

    detail.hemoglobins.splice(index, 1, hemoglobin);
    await detail.save();
    await Redis.deletePattern('MommyDetail_user_*');
    return apiUpdated('Hemoglobin', user.detail.hemoglobins[index]);
  }

  @Delete(':id')
  @UsePipes(ValidationPipe)
  @Role('mommy')
  async destroy(
    @GetUser() user: IUser,
    @Param() param: MongoIdPipe
  ): Promise<IApiItem> {
    const { id } = param;
    const index = user.detail.hemoglobins.findIndex(
      w => w._id.toString() === id
    );
    if (index === -1) {
      throw new BadRequestException('Hemoglobin not found');
    }

    const detail: IMommyDetail = await this.dbService.getByKey(
      'user',
      user._id
    );

    detail.hemoglobins.splice(index, 1);
    await detail.save();
    await Redis.deletePattern('MommyDetail_user_*');

    return apiDeleted('Hemoglobin');
  }
}
