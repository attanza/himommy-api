import { Role } from '@guards/role.decorator';
import { RoleGuard } from '@guards/role.guard';
import { Redis } from '@modules/helpers/redis';
import {
  apiCreated,
  apiDeleted,
  apiItem,
  apiUpdated,
} from '@modules/helpers/responseParser';
import { GetUser } from '@modules/shared/decorators/get-user.decorator';
import { IApiItem } from '@modules/shared/interfaces/response-parser.interface';
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
import { CreateBloodPressureDto } from '../dto/blood-pressure.dto';
import { IMommyBloodPressure, IMommyDetail } from '../mommy-detail.interface';
import { MommyDetailService } from '../mommy-detail.service';

@Controller('/mobile/blood-pressures')
@UseGuards(AuthGuard('jwt'), RoleGuard)
export class BloodPressureController {
  constructor(private dbService: MommyDetailService) {}

  @Get()
  @Role('mommy')
  async getWeights(@GetUser() user: IUser): Promise<IApiItem> {
    return apiItem('Blood Pressures', user.detail.bloodPressures);
  }

  @Post()
  @UsePipes(ValidationPipe)
  @Role('mommy')
  async store(
    @GetUser() user: IUser,
    @Body() createData: CreateBloodPressureDto
  ): Promise<IApiItem> {
    const status = this.dbService.getBloodPressureStatus(
      createData.systolic,
      createData.diastolic
    );

    const bloodPressureData: IMommyBloodPressure = {
      systolic: createData.systolic,
      diastolic: createData.diastolic,
      status,
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
    const { id } = param;
    const index = user.detail.bloodPressures.findIndex(
      w => w._id.toString() === id
    );
    if (index === -1) {
      throw new BadRequestException('Blood pressure reading not found');
    }
    return apiItem('Blood Pressure', user.detail.bloodPressures[index]);
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

    // Edit Blood Pressiure
    if (updateData.systolic && updateData.diastolic) {
      const bloodPressure = user.detail.bloodPressures[index];
      const status = this.dbService.getBloodPressureStatus(
        updateData.systolic,
        updateData.diastolic
      );
      bloodPressure.systolic = updateData.systolic;
      bloodPressure.diastolic = updateData.diastolic;
      bloodPressure.status = status;

      const detail: IMommyDetail = await this.dbService.getByKey(
        'user',
        user._id
      );

      detail.bloodPressures.splice(index, 1, bloodPressure);

      await detail.save();
      await Redis.deletePattern('MommyDetail_user_*');
      return apiUpdated('Weight', detail.bloodPressures[index]);
    }
    return apiUpdated('Weight', user.detail.bloodPressures[index]);
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
      throw new BadRequestException('Weight not found');
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