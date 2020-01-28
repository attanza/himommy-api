import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { isUnique } from '../helpers';
import getApiCollection from '../helpers/getApiCollection';
import { IPermission } from '../permission/permission.interface';
import { IApiCollection } from '../shared/interfaces/response-parser.interface';
import { ResourcePaginationPipe } from '../shared/pipes/resource-pagination.pipe';
import { CreateRoleDto, UpdateRoleDto } from './role.dto';
import { IRole } from './role.interface';

@Injectable()
export class RoleService {
  constructor(
    @InjectModel('Role') private model: Model<IRole>,
    @InjectModel('Permission') private permissionModel: Model<IPermission>,
  ) {}

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
    const { name, permissions } = createDto;
    await isUnique(this.model, 'name', name);
    await this.checkPermissions(permissions);
    const newData = await this.model.create(createDto);
    return await this.getById(newData._id);
  }

  async update(id: string, updateDto: UpdateRoleDto): Promise<IRole> {
    const data = await this.getById(id);
    const { name, permissions } = updateDto;
    await isUnique(this.model, 'name', name, id);
    await this.checkPermissions(permissions);
    Object.keys(updateDto).map(key => (data[key] = updateDto[key]));
    await data.save();
    return await this.getById(id);
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
    const found = await this.model.findById(id).populate('permissions');
    if (!found) {
      throw new HttpException('Data not found', HttpStatus.NOT_FOUND);
    }
    return found;
  }

  private async checkPermissions(permissions): Promise<void> {
    if (permissions && permissions.length > 0) {
      const count = await this.permissionModel.countDocuments({
        _id: { $in: permissions },
      });
      if (count !== permissions.length) {
        throw new HttpException(
          'One or more permission is not exists in database',
          HttpStatus.BAD_REQUEST,
        );
      }
    }
  }
}
