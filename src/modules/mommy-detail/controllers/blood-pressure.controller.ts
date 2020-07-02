import { Role } from '@/guards/role.decorator';
import { RoleGuard } from '@/guards/role.guard';
import { Redis } from '@/modules/helpers/redis';
import {
  apiCreated,
  apiDeleted,
  apiItem,
  apiUpdated,
  mommyDetail,
} from '@/modules/helpers/responseParser';
import { GetUser } from '@/modules/shared/decorators/get-user.decorator';
import {
  IApiItem,
  IMommyGraphics,
} from '@/modules/shared/interfaces/response-parser.interface';
import { MongoIdPipe } from '@/modules/shared/pipes/mongoId.pipe';
import { IUser } from '@/modules/user/user.interface';
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
import { CreateBloodPressureDto } from '../dto/blood-pressure.dto';
import { EMommyBloodPressureStatus } from '../mommy-detail.enums';
import { IMommyBloodPressure, IMommyDetail } from '../mommy-detail.interface';
import { MommyDetailService } from '../mommy-detail.service';

@Controller('/mobile/blood-pressures')
@UseGuards(AuthGuard('jwt'), RoleGuard)
export class BloodPressureController {
  constructor(private dbService: MommyDetailService) {}

  @Get()
  @Role('mommy')
  async getBloodPressures(@GetUser() user: IUser): Promise<IMommyGraphics> {
    const status = [
      EMommyBloodPressureStatus.LOW,
      EMommyBloodPressureStatus.NORMAL,
      EMommyBloodPressureStatus.HYPERTENSION,
    ];
    const other = { status };
    const bloodPressures =
      user.detail && user.detail.bloodPressures
        ? user.detail.bloodPressures
        : [];
    return mommyDetail('Blood Pressures', bloodPressures, other);
  }

  @Post()
  @UsePipes(ValidationPipe)
  @Role('mommy')
  async store(
    @GetUser() user: IUser,
    @Body() createData: CreateBloodPressureDto
  ): Promise<IApiItem> {
    // const status = this.dbService.getBloodPressureStatus(
    //   createData.systolic,
    //   createData.diastolic
    // );

    const bloodPressureData: IMommyBloodPressure = {
      systolic: createData.systolic,
      diastolic: createData.diastolic,
      status: createData.status,
      date: new Date(),
    };

    const detail: IMommyDetail = await this.dbService.getByKey(
      'user',
      user._id
    );

    detail.bloodPressures = this.dbService.checkDuplicate(
      detail.bloodPressures,
      bloodPressureData
    );
    detail.bloodPressures.push(bloodPressureData);

    await detail.save();
    await Redis.deletePattern('MommyDetail_user_*');
    return apiCreated('Blood Pressure', detail.bloodPressures);
  }

  @Get(':id')
  @UsePipes(ValidationPipe)
  @Role('mommy')
  async show(
    @GetUser() user: IUser,
    @Param() param: MongoIdPipe
  ): Promise<IApiItem> {
    const bloodPressures =
      user.detail && user.detail.bloodPressures
        ? user.detail.bloodPressures
        : null;
    if (!bloodPressures) {
      throw new BadRequestException('Blood Pressure not found');
    }
    const { id } = param;
    const index = bloodPressures.findIndex(w => w._id.toString() === id);
    if (index === -1) {
      throw new BadRequestException('Blood pressure reading not found');
    }
    return apiItem('Blood Pressure', bloodPressures[index]);
  }

  @Put(':id')
  @UsePipes(ValidationPipe)
  @Role('mommy')
  async update(
    @GetUser() user: IUser,
    @Param() param: MongoIdPipe,
    @Body() updateData: Partial<CreateBloodPressureDto>
  ): Promise<IApiItem> {
    // get blood pressure by id
    const { id } = param;
    const index = user.detail.bloodPressures.findIndex(
      w => w._id.toString() === id
    );
    if (index === -1) {
      throw new BadRequestException('Blood pressure not found');
    }

    const bloodPressure = user.detail.bloodPressures[index];
    Object.keys(updateData).map(key => {
      bloodPressure[key] = updateData[key];
    });

    const detail: IMommyDetail = await this.dbService.getByKey(
      'user',
      user._id
    );

    detail.bloodPressures.splice(index, 1, bloodPressure);

    await detail.save();
    await Redis.deletePattern('MommyDetail_user_*');
    return apiUpdated('Blood pressure', detail.bloodPressures[index]);
  }

  @Delete(':id')
  @UsePipes(ValidationPipe)
  @Role('mommy')
  async destroy(
    @GetUser() user: IUser,
    @Param() param: MongoIdPipe
  ): Promise<IApiItem> {
    const { id } = param;
    const index = user.detail.bloodPressures.findIndex(
      w => w._id.toString() === id
    );
    if (index === -1) {
      throw new BadRequestException('Blood pressure not found');
    }

    const detail: IMommyDetail = await this.dbService.getByKey(
      'user',
      user._id
    );

    detail.bloodPressures.splice(index, 1);
    await detail.save();
    await Redis.deletePattern('MommyDetail_user_*');

    return apiDeleted('Blood Pressure');
  }
}
