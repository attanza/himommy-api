import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { getApiCollection, isUnique } from '../helpers';
import { IApiCollection } from '../shared/interfaces/response-parser.interface';
import { ResourcePaginationPipe } from '../shared/pipes/resource-pagination.pipe';
import { CreateUserDto, UpdateUserDto } from './user.dto';
import { IUser } from './user.interface';

@Injectable()
export class UserService {
  constructor(@InjectModel('User') private model: Model<IUser>) {}

  async all(query: ResourcePaginationPipe): Promise<IApiCollection> {
    const regexSearchable = ['slug'];
    const keyValueSearchable = [];
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
    const { email, phone } = createDto;
    await isUnique(this.model, 'email', email);
    await isUnique(this.model, 'phone', phone);

    const newData = new this.model(createDto);
    await newData.save();
    return newData;
  }

  async update(id: string, updateDto: UpdateUserDto): Promise<IUser> {
    const data = await this.getById(id);
    const { email, phone } = updateDto;
    await isUnique(this.model, 'email', email);
    await isUnique(this.model, 'phone', phone);

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

  async getById(id: string): Promise<IUser> {
    const found = await this.model.findById(id);
    if (!found) {
      throw new HttpException('Permission not found', HttpStatus.NOT_FOUND);
    }
    return found;
  }
}
