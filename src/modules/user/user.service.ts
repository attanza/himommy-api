import { getApiCollection, isUnique } from '@modules/helpers';
import checkIdExists from '@modules/helpers/checkIdExists';
import { IApiCollection } from '@modules/shared/interfaces/response-parser.interface';
import { ResourcePaginationPipe } from '@modules/shared/pipes/resource-pagination.pipe';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IRole } from '../role/role.interface';
import { CreateUserDto, UpdateUserDto } from './user.dto';
import { IUser } from './user.interface';

@Injectable()
export class UserService {
  constructor(
    @InjectModel('User') private model: Model<IUser>,
    @InjectModel('Role') private roleModel: Model<IRole>,
  ) {}

  async all(query: ResourcePaginationPipe): Promise<IApiCollection> {
    const regexSearchable = ['name.first', 'name.last', 'email', 'phone'];
    const keyValueSearchable = ['role'];
    return await getApiCollection(
      'User',
      this.model,
      query,
      regexSearchable,
      keyValueSearchable,
    );
  }

  async show(id: string): Promise<IUser> {
    return this.getById(id);
  }

  async store(createDto: CreateUserDto): Promise<IUser> {
    const { email, phone, role } = createDto;
    await isUnique(this.model, 'email', email);
    await isUnique(this.model, 'phone', phone);

    if (role) await checkIdExists([role], this.roleModel);

    const newData = await this.model.create(createDto);
    return await this.getById(newData._id);
  }

  async update(id: string, updateDto: UpdateUserDto): Promise<IUser> {
    const data = await this.getById(id);
    const { email, phone, role } = updateDto;
    await isUnique(this.model, 'email', email, id);
    await isUnique(this.model, 'phone', phone, id);

    await checkIdExists([role], this.roleModel);

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

  async getById(id: string): Promise<IUser> {
    const found = await this.model.findById(id).populate('role');
    if (!found) {
      throw new HttpException('Permission not found', HttpStatus.NOT_FOUND);
    }
    return found;
  }
}
