import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { isUnique } from '../helpers';
import getApiCollection from '../helpers/getApiCollection';
import { IApiCollection } from '../shared/interfaces/response-parser.interface';
import { ResourcePaginationPipe } from '../shared/pipes/resource-pagination.pipe';
import { CreateRoleDto, UpdateRoleDto } from './role.dto';
import { IRole } from './role.interface';

@Injectable()
export class RoleService {
  constructor(@InjectModel('Role') private model: Model<IRole>) {}

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

  async show(id: string): Promise<IRole> {
    return this.getById(id);
  }

  async store(createDto: CreateRoleDto): Promise<IRole> {
    const { name } = createDto;
    await isUnique(this.model, 'name', name);

    const newData = new this.model(createDto);
    await newData.save();
    return newData;
  }

  async update(id: string, updateDto: UpdateRoleDto): Promise<IRole> {
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

  private async getById(id: string): Promise<IRole> {
    const found = await this.model.findById(id);
    if (!found) {
      throw new HttpException('Data not found', HttpStatus.NOT_FOUND);
    }
    return found;
  }
}
