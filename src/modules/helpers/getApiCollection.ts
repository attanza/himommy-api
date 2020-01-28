import { Model } from 'mongoose';
import {
  IApiCollection,
  IMeta,
} from '../shared/interfaces/response-parser.interface';
import {
  ResourcePaginationPipe,
  SortMode,
} from '../shared/pipes/resource-pagination.pipe';

export default async (
  modelName: string,
  model: Model<any>,
  query?: ResourcePaginationPipe,
  regexSearchable?: string[],
  keyValueSearchable?: string[],
): Promise<IApiCollection> => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const sortBy = query.sortBy || 'createdAt';
  const sortMode = SortMode[query.sortMode];
  const search = query.search || '';

  const { fieldKey, fieldValue, dateField, dateStart, dateEnd } = query;
  let options = {};

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

  const total: number = await model.countDocuments(options);
  const totalPages: number = Math.ceil(total / limit);
  const meta: IMeta = {
    status: 200,
    message: `${modelName} Collection`,
    total,
    limit,
    page,
    totalPages,
    nextPage: totalPages > page ? page + 1 : null,
    prevPage: page > 1 ? page - 1 : null,
  };

  const data = await model
    .find(options)
    .sort({ [sortBy]: sortMode })
    .skip(limit * page - limit)
    .limit(limit);
  return { meta, data };
};
