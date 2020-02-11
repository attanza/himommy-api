import { IPaginated } from '@modules/shared/interfaces/paginated.inteface';
import { Logger } from '@nestjs/common';
import {
  IApiCollection,
  IMeta,
} from '../shared/interfaces/response-parser.interface';
import { Redis } from './redis';

export default async ({
  modelName,
  model,
  query,
  regexSearchable,
  keyValueSearchable,
  relations,
  customOptions,
}: IPaginated): Promise<IApiCollection> => {
  query = normalizeQuery(query);
  const redisKey = `${modelName}_${generateRedisKey(query)}`;
  // Cache
  const cache = await Redis.get(redisKey);
  if (cache && cache != null) {
    Logger.log(`${modelName} from cache`, 'DB SERVICE');
    return JSON.parse(cache);
  }

  const {
    page,
    limit,
    sortBy,
    sortMode,
    search,
    fieldKey,
    fieldValue,
    dateField,
    dateStart,
    dateEnd,
  } = query;
  let options = {};

  const coordinates = [];

  // Custom DB Options
  if (customOptions && Object.keys(customOptions).length > 0) {
    options = { ...options, ...customOptions };
  }

  // Regex Search
  if (search !== '' && regexSearchable.length > 0) {
    const regexSearch = [];
    regexSearchable.map(s => {
      regexSearch.push({ [s]: { $regex: search, $options: 'i' } });
    });
    options = { $or: regexSearch };
  }

  // key value search
  if (fieldKey && fieldValue) {
    if (Array.isArray(fieldKey) && Array.isArray(fieldValue)) {
      for (let i = 0; i < fieldKey.length; i++) {
        if (keyValueSearchable.includes(fieldKey[i])) {
          options = { ...options, [fieldKey[i]]: fieldValue[i] };
        }
      }
    } else {
      if (keyValueSearchable.includes(fieldKey)) {
        options = { ...options, [fieldKey]: fieldValue };
      }
    }
  }

  // Date Range Search
  if (dateField && dateStart && dateEnd) {
    options = { ...options, [dateField]: { $gte: dateStart, $lte: dateEnd } };
  }

  // Coordinates
  if (query.latitude && query.longitude) {
    coordinates.push(parseFloat(query.longitude.toString()));
    coordinates.push(parseFloat(query.latitude.toString()));
  }

  // NOTE: comeback later and DRY out the code bellow
  let total: number = 0;
  let data = null;
  let totalPages: number;
  let meta: IMeta;
  let output: IApiCollection;
  if (coordinates.length === 2) {
    const totalCount = await model.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates,
          },
          distanceField: `distance`,
          distanceMultiplier: 0.000998,
          spherical: true,
          limit: 1000,
        },
      },

      {
        $count: 'totalCount',
      },
    ]);
    total = totalCount[0].totalCount;
    data = await model.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates,
          },
          distanceField: `distance`,
          distanceMultiplier: 0.000998,
          spherical: true,
          query: options,
          limit: 1000,
        },
      },
      { $sort: { distance: 1 } },
      { $skip: limit * page - limit },
      { $limit: limit },
    ]);
    totalPages = Math.ceil(total / limit);
  } else {
    total = await model.countDocuments(options);
    totalPages = Math.ceil(total / limit);

    data = await model
      .find(options)
      .populate(relations)
      .sort({ [sortBy]: sortMode })
      .skip(Number(limit * page - limit))
      .limit(Number(limit));
  }

  meta = {
    status: 200,
    message: `${modelName} Collection`,
    total,
    limit: Number(limit),
    page: Number(page),
    totalPages: Number(totalPages),
    nextPage: totalPages > page ? page + 1 : null,
    prevPage: page > 1 ? page - 1 : null,
  };

  output = { meta, data };
  if (search === '') {
    Redis.set(redisKey, JSON.stringify(output));
  }
  return output;
};

const normalizeQuery = query => {
  if (!query.page) {
    query.page = 1;
  }
  if (!query.limit) {
    query.limit = 10;
  }
  if (!query.sortBy) {
    query.sortBy = 'createdAt';
  }
  if (!query.sortMode) {
    query.sortMode = -1;
  }
  if (!query.search) {
    query.search = '';
  }
  return query;
};

const generateRedisKey = query => {
  return Object.values(query).join('_');
};
