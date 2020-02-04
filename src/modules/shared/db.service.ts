import { getApiCollection, isUnique } from '@modules/helpers';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { IApiCollection } from './interfaces/response-parser.interface';
import { ResourcePaginationPipe } from './pipes/resource-pagination.pipe';

@Injectable()
export class DbService {
  Model: any;
  constructor(model) {
    this.Model = model;
  }

  /**
   * GET PAGINATED RESOURCE
   * @param modelName
   * @param query
   * @param regexSearchable
   * @param keyValueSearchable
   */
  async getPaginated(
    modelName: string,
    query: ResourcePaginationPipe,
    regexSearchable: string[],
    keyValueSearchable: string[],
  ): Promise<IApiCollection> {
    return await getApiCollection(
      modelName,
      this.Model,
      query,
      regexSearchable,
      keyValueSearchable,
    );
  }

  /**
   * GET RESOURCE BY ID WITH EXCEPTION
   * @param modelName
   * @param id
   * @param relations
   */
  async show(
    modelName: string,
    id: string,
    relations?: string[],
  ): Promise<any> {
    const found = await this.getById(id, relations);

    if (!found) {
      throw new HttpException(`${modelName} not found`, HttpStatus.NOT_FOUND);
    }
    await found;
    return found;
  }

  /**
   * GET RESOURCE BY ID
   * @param id
   * @param relations
   */
  async getById(id: string, relations?: string[]): Promise<any> {
    if (relations && relations.length > 0) {
      return await this.Model.findById(id)
        .populate(relations)
        .lean();
    } else {
      return await this.Model.findById(id).lean();
    }
  }

  /**
   * STORE NEW DOCUMENT
   * @param createDto
   * @param uniques
   * @param relations
   */
  async store(
    createDto: any,
    uniques?: string[],
    relations?: string[],
  ): Promise<any> {
    if (uniques && uniques.length > 0) {
      for (const key of uniques) {
        await isUnique(this.Model, key, createDto[key]);
      }
    }
    const newData = new this.Model(createDto);
    await newData.save();
    if (relations && relations.length > 0) {
      return this.getById(newData._id, relations);
    } else {
      return newData;
    }
  }

  /**
   * UPDATE DOCUMENT
   * @param modelName
   * @param id
   * @param updateDto
   * @param uniques
   * @param relations
   */
  async update(
    modelName: string,
    id: string,
    updateDto,
    uniques?: string[],
    relations?: string[],
  ): Promise<any> {
    const data = await this.show(modelName, id, relations);

    if (uniques && uniques.length > 0) {
      for (const key of uniques) {
        await isUnique(this.Model, key, updateDto[key], id);
      }
    }

    await this.Model.updateOne({ _id: id }, updateDto);
    return this.getById(id, relations);
  }

  /**
   * DELETE DOCUMENT
   * @param modelName
   * @param id
   */
  async destroy(modelName: string, id: string): Promise<string> {
    await this.Model.deleteOne({ _id: id });
    return `${modelName} successfully deleted`;
  }
}
