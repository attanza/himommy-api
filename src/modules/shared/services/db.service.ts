import { getApiCollection, isUnique } from '@modules/helpers';
import mqttHandler from '@modules/helpers/mqttHandler';
import { Redis } from '@modules/helpers/redis';
import {
  apiCreated,
  apiDeleted,
  apiItem,
  apiUpdated,
} from '@modules/helpers/responseParser';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import {
  IResourceDestroy,
  IResourceShow,
  IResourceStore,
  IResourceUpdate,
} from '../interfaces/db-resource.interface';
import { IPaginated } from '../interfaces/paginated.inteface';
import {
  IApiCollection,
  IApiItem,
} from '../interfaces/response-parser.interface';

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
   * @param customOptions
   */
  async getPaginated({
    modelName,
    query,
    regexSearchable,
    keyValueSearchable,
    relations = [],
    customOptions,
  }: IPaginated): Promise<IApiCollection> {
    return await getApiCollection({
      modelName,
      model: this.Model,
      query,
      regexSearchable,
      keyValueSearchable,
      relations,
      customOptions,
    });
  }

  /**
   * GET RESOURCE BY ID WITH EXCEPTION
   * @param modelName
   * @param id
   * @param relations
   */
  async show(resourceShow: IResourceShow): Promise<IApiItem> {
    const { modelName } = resourceShow;
    const redisKey = Object.values(resourceShow).join('_');
    const cache = await Redis.get(redisKey);
    if (cache && cache != null) {
      Logger.log(`${modelName} detail from cache`, 'DB SERVICE');
      return JSON.parse(cache);
    }
    const data = await this.getById(resourceShow);

    if (!data) {
      throw new HttpException(`${modelName} not found`, HttpStatus.NOT_FOUND);
    }
    const output = apiItem(modelName, data);
    Redis.set(redisKey, JSON.stringify(output));
    return output;
  }

  /**
   * GET RESOURCE BY ID
   * @param id
   * @param relations
   */
  async getById<T>(resourceShow: IResourceShow): Promise<T> {
    const { id, relations } = resourceShow;
    return await this.Model.findById(id).populate(relations);
  }

  async getByKey<T>(key: string, value: any): Promise<T> {
    return await this.Model.findOne({ [key]: value });
  }

  /**
   * STORE NEW DOCUMENT
   * @param modelName
   * @param createDto
   * @param uniques
   * @param relations
   * @param topic
   */
  async store(resourceStore: IResourceStore): Promise<IApiItem> {
    const { modelName, uniques, createDto, relations, topic } = resourceStore;
    if (uniques && uniques.length > 0) {
      for (const key of uniques) {
        await isUnique(this.Model, key, createDto[key]);
      }
    }
    const newData = await this.dbStore(modelName, createDto);

    let output: IApiItem;
    if (relations && relations.length > 0) {
      output = apiCreated(
        modelName,
        await this.getById({ id: newData._id, relations }),
      );
    } else {
      output = apiCreated(modelName, newData);
    }
    if (topic) {
      mqttHandler.sendMessage(topic, JSON.stringify(output.data));
    }
    return output;
  }

  async dbStore(modelName: string, createDto: any) {
    Redis.deletePattern(modelName);
    return await this.Model.create(createDto);
  }

  /**
   * UPDATE DOCUMENT
   * @param modelName
   * @param id
   * @param updateDto
   * @param uniques
   * @param relations
   */
  async update(resourceUpdate: IResourceUpdate): Promise<IApiItem> {
    const {
      modelName,
      id,
      updateDto,
      uniques,
      relations,
      topic,
    } = resourceUpdate;
    await this.show({ modelName, id, relations });

    if (uniques && uniques.length > 0) {
      for (const key of uniques) {
        await isUnique(this.Model, key, updateDto[key], id);
      }
    }
    await this.dbUpdate(modelName, id, updateDto);

    const output = apiUpdated(modelName, await this.getById({ id, relations }));
    if (topic) {
      mqttHandler.sendMessage(topic, JSON.stringify(output.data));
    }
    return output;
  }

  async dbUpdate(modelName: string, id: string, updateDto: any) {
    Redis.deletePattern(modelName);

    return await this.Model.updateOne({ _id: id }, updateDto);
  }

  /**
   * DELETE DOCUMENT
   * @param modelName
   * @param id
   */
  async destroy(resourceDestroy: IResourceDestroy): Promise<IApiItem> {
    const { modelName, id, topic } = resourceDestroy;
    await this.dbDestroy(id);
    Redis.deletePattern(modelName);

    const output = apiDeleted(modelName);
    if (topic) {
      mqttHandler.sendMessage(topic, JSON.stringify(output.data));
    }
    return output;
  }

  async dbDestroy(id: string) {
    return await this.Model.deleteOne({ _id: id });
  }

  async isUnique(key: string, value: any, id?: string): Promise<boolean> {
    const found = await this.Model.findOne({ [key]: value })
      .select('_id')
      .lean();
    if (found && id && found._id.toString() === id.toString()) {
      return true;
    } else if (found) {
      throw new BadRequestException(`${key} is already exists`);
    } else {
      return true;
    }
  }
}
