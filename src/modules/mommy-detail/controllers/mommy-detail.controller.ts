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
import { CreateWeightDto } from '../dto/weight.dto';
import { IMommyDetail, IMommyWeight } from '../mommy-detail.interface';
import { MommyDetailService } from '../mommy-detail.service';

@Controller('/mobile/weights')
@UseGuards(AuthGuard('jwt'), RoleGuard)
export class WeightController {
  constructor(private dbService: MommyDetailService) {}

  @Get()
  @Role('mommy')
  async getWeights(@GetUser() user: IUser): Promise<IApiItem> {
    return apiItem('Weight', user.detail.weights);
  }

  @Post()
  @UsePipes(ValidationPipe)
  @Role('mommy')
  async store(
    @GetUser() user: IUser,
    @Body() createData: CreateWeightDto
  ): Promise<IApiItem> {
    // check if height is exists
    if (!user.detail.height) {
      throw new BadRequestException('Please set your height');
    }

    const { bmi, status } = this.dbService.getBmiAndStatus(
      createData.weight,
      user.detail.height
    );

    const weightData: IMommyWeight = {
      weight: createData.weight,
      bmi,
      status,
      date: new Date(),
    };

    const detail: IMommyDetail = await this.dbService.getByKey(
      'user',
      user._id
    );

    detail.weights = this.dbService.checkDuplicate(detail.weights, weightData);
    detail.weights.push(weightData);

    await detail.save();
    await Redis.deletePattern('MommyDetail_user_*');
    return apiCreated('Weight', detail.weights);
  }

  @Get(':id')
  @UsePipes(ValidationPipe)
  @Role('mommy')
  async show(
    @GetUser() user: IUser,
    @Param() param: MongoIdPipe
  ): Promise<IApiItem> {
    const { id } = param;
    const index = user.detail.weights.findIndex(w => w._id.toString() === id);
    if (index === -1) {
      throw new BadRequestException('Weight not found');
    }
    return apiItem('Weight', user.detail.weights[index]);
  }

  @Put(':id')
  @UsePipes(ValidationPipe)
  @Role('mommy')
  async update(
    @GetUser() user: IUser,
    @Param() param: MongoIdPipe,
    @Body() updateData: Partial<CreateWeightDto>
  ): Promise<IApiItem> {
    // get weight by id
    const { id } = param;
    const index = user.detail.weights.findIndex(w => w._id.toString() === id);
    if (index === -1) {
      throw new BadRequestException('Weight not found');
    }

    // Edit weight
    if (updateData.weight) {
      const weight = user.detail.weights[index];
      weight.weight = updateData.weight;
      const detail: IMommyDetail = await this.dbService.getByKey(
        'user',
        user._id
      );

      detail.weights.splice(index, 1, weight);
      await detail.save();
      await Redis.deletePattern('MommyDetail_user_*');
    }
    return apiUpdated('Weight', user.detail.weights[index]);
  }

  @Delete(':id')
  @UsePipes(ValidationPipe)
  @Role('mommy')
  async destroy(
    @GetUser() user: IUser,
    @Param() param: MongoIdPipe,
    @Body() updateData: Partial<CreateWeightDto>
  ): Promise<IApiItem> {
    // get weight by id
    const { id } = param;
    const index = user.detail.weights.findIndex(w => w._id.toString() === id);
    if (index === -1) {
      throw new BadRequestException('Weight not found');
    }

    const detail: IMommyDetail = await this.dbService.getByKey(
      'user',
      user._id
    );

    detail.weights.splice(index, 1);
    await detail.save();
    await Redis.deletePattern('MommyDetail_user_*');

    return apiDeleted('Weight');
  }
}
