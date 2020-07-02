import { isUnique } from '@/modules/helpers';
import { BadRequestException } from '@nestjs/common';
import { Model } from 'mongoose';
import {
  IResourceDestroy,
  IResourceShow,
  IResourceStore,
  IResourceUpdate,
} from '../interfaces/db-resource.interface';
import { IResourcePagination } from '../interfaces/resource-pagination.interface';
import { IApiCollection, IMeta } from '../interfaces/response-parser.interface';
export abstract class BaseDbService {
  private readonly dbModel: Model<any>;
  constructor(dbModel) {
    this.dbModel = dbModel;
  }

  /**
   * GET DB DATA WITH PAGINATION
   * @param args: IResourcePagination
   * @returns Promise<IApiCollection>
   */
  async getPaginated(args: IResourcePagination): Promise<IApiCollection> {
    let options = {};
    const coordinates = [];

    /**
     * CUSTOM DB OPTIONS
     */
    if (args.customOptions && Object.keys(args.customOptions).length > 0) {
      options = { ...options, ...args.customOptions };
    }

    /**
     * SEARCH EQUIVALENT TO 'LIKE' QUERY
     */
    if (
      args.search &&
      args.search !== '' &&
      args.regexSearchable &&
      args.regexSearchable.length > 0
    ) {
      const regexSearch = [];
      args.regexSearchable.map(s => {
        regexSearch.push({ [s]: { $regex: args.search, $options: 'i' } });
      });
      options = { $or: regexSearch };
    }

    /**
     * KEY VALUE SEARCH FROM QUERY STRING
     */
    if (args.fieldKey && args.fieldValue) {
      if (Array.isArray(args.fieldKey) && Array.isArray(args.fieldValue)) {
        for (let i = 0; i < args.fieldKey.length; i++) {
          if (args.keyValueSearchable.includes(args.fieldKey[i])) {
            options = { ...options, [args.fieldKey[i]]: args.fieldValue[i] };
          }
        }
      } else {
        if (
          args.keyValueSearchable &&
          args.keyValueSearchable.includes(args.fieldKey)
        ) {
          options = { ...options, [args.fieldKey]: args.fieldValue };
        }
      }
    }

    /**
     * DATE RANGE SEARCH
     */
    if (args.dateField && args.dateStart && args.dateEnd) {
      options = {
        ...options,
        [args.dateField]: { $gte: args.dateStart, $lte: args.dateEnd },
      };
    }

    /**
     * COORDINATE FILTERING
     */
    if (args.latitude && args.longitude) {
      coordinates.push(parseFloat(args.longitude.toString()));
      coordinates.push(parseFloat(args.latitude.toString()));
    }

    const total = await this.dbModel.countDocuments(options);
    const totalPages = Math.ceil(total / Number(args.limit));
    const page = Number(args.page) || 1;
    const limit = Number(args.limit) || 10;
    const sortBy = args.sortBy || 'createdAt';
    const sortMode = args.sortMode || -1;
    const data = await this.dbModel
      .find(options)
      .populate(args.relations)
      .sort({ [sortBy]: sortMode })
      .skip(Number(limit * page - limit))
      .limit(Number(limit));

    const meta: IMeta = {
      status: 200,
      message: `${args.modelName} Collection`,
      total,
      limit: Number(limit),
      page: Number(page),
      totalPages: Number(totalPages),
      nextPage: totalPages > page ? page + 1 : null,
      prevPage: page > 1 ? page - 1 : null,
    };
    const output: IApiCollection = { meta, data };
    return output;
  }

  /**
   * Get DB data by ID
   * @param args
   */
  async show<T>(args: IResourceShow): Promise<T> {
    const data = await this.dbModel.findById(args.id).populate(args.relations);
    if (!data) {
      throw new BadRequestException(`${args.modelName} not found`);
    }
    return data;
  }

  /**
   * STORE NEW DB DATA
   * @param createDto
   * @param uniques
   */
  async store<T>(args: IResourceStore): Promise<T> {
    if (args.uniques && args.uniques.length > 0) {
      for (const key of args.uniques) {
        await isUnique(this.dbModel, key, args.createDto[key]);
      }
    }
    return this.dbModel.create(args.createDto);
  }

  /**
   * Update DB data by ID
   */
  async update<T>(args: IResourceUpdate): Promise<T> {
    const data = await this.dbModel.findById(args.id);
    if (!data) {
      throw new BadRequestException(`${args.modelName} not found`);
    }
    if (args.uniques && args.uniques.length > 0) {
      for (const key of args.uniques) {
        await isUnique(this.dbModel, key, args.updateDto[key], args.id);
      }
    }
    if (Object.keys(args.updateDto).length > 0) {
      Object.keys(args.updateDto).map(key => (data[key] = args.updateDto[key]));
      await data.save();
    }
    return data;
  }

  /**
   * Delete DB by ID
   * @param args
   */
  async destroy(args: IResourceDestroy): Promise<boolean> {
    const data = await this.dbModel.findById(args.id);
    if (!data) {
      throw new BadRequestException(`${args.modelName} not found`);
    }
    await this.dbModel.deleteOne({ _id: args.id });
    return true;
  }
}
