import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { getApiCollection, isUnique } from '../helpers';
import { IApiCollection } from '../shared/interfaces/response-parser.interface';
import { ResourcePaginationPipe } from '../shared/pipes/resource-pagination.pipe';
import { CreatePermissionDto, UpdatePermissionDto } from './permission.dto';
import { IPermission } from './permission.interface';

@Injectable()
export class PermissionService {
  constructor(@InjectModel('Permission') private model: Model<IPermission>) {}

  async all(query: ResourcePaginationPipe): Promise<IApiCollection> {
    const regexSearchable = ['slug'];
    const keyValueSearchable = [];
    return await getApiCollection(
      'Role',
      this.model,
      query,
      regexSearchable,
      keyValueSearchable,
    );
  }

  async show(id: string): Promise<IPermission> {
    return this.getById(id);
  }

  async store(createDto: CreatePermissionDto): Promise<IPermission> {
    const { name } = createDto;
    await isUnique(this.model, 'name', name);

    const newData = new this.model(createDto);
    await newData.save();
    return newData;
  }

  async update(
    id: string,
    updateDto: UpdatePermissionDto,
  ): Promise<IPermission> {
    const data = await this.getById(id);
    const { name } = updateDto;

    await isUnique(this.model, 'name', name, id);

    Object.keys(updateDto).map(key => (data[key] = updateDto[key]));
    await data.save();
    return data;
  }

  async destroy(id: string): Promise<string> {
    const data = await this.getById(id);
    await data.remove();
    return 'Data successfuly deleted';
  }

  async removeAll() {
    await this.model.deleteMany({});
  }

  async getById(id: string): Promise<IPermission> {
    const found = await this.model.findById(id);
    if (!found) {
      throw new HttpException('Permission not found', HttpStatus.NOT_FOUND);
    }
    return found;
  }
}
