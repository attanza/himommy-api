import { IPaginated } from '@modules/shared/interfaces/paginated.inteface';
import {
  IApiCollection,
  IMeta,
} from '../shared/interfaces/response-parser.interface';
import { SortMode } from '../shared/pipes/resource-pagination.pipe';

export default async ({
  modelName,
  model,
  query,
  regexSearchable,
  keyValueSearchable,
  relations,
  customOptions,
}: IPaginated): Promise<IApiCollection> => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const sortBy = query.sortBy || 'createdAt';
  const sortMode = SortMode[query.sortMode] || -1;
  const search = query.search || '';
  const coordinates = [];

  const { fieldKey, fieldValue, dateField, dateStart, dateEnd } = query;
  let options = {};

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
  if (fieldKey && keyValueSearchable.includes(fieldKey) && fieldValue) {
    options = { ...options, [fieldKey]: fieldValue };
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
    meta = {
      status: 200,
      message: `${modelName} Collection`,
      total,
      limit,
      page,
      totalPages,
      nextPage: totalPages > page ? page + 1 : null,
      prevPage: page > 1 ? page - 1 : null,
    };
    return { meta, data };
  }

  total = await model.countDocuments(options);
  totalPages = Math.ceil(total / limit);
  meta = {
    status: 200,
    message: `${modelName} Collection`,
    total,
    limit,
    page,
    totalPages,
    nextPage: totalPages > page ? page + 1 : null,
    prevPage: page > 1 ? page - 1 : null,
  };

  data = await model
    .find(options)
    .populate(relations)
    .sort({ [sortBy]: sortMode })
    .skip(limit * page - limit)
    .limit(limit);
  return { meta, data };
};
