import { ESortMode } from '../pipes/resource-pagination.pipe';

export interface IResourcePagination {
  modelName: string;
  page: number;
  limit: number;
  search: string;
  sortBy: string;
  sortMode: ESortMode;
  dateField: string;
  dateStart: Date;
  dateEnd: Date;
  fieldKey: string;
  fieldValue: any;
  latitude: number;
  longitude: number;
  customOptions?: any;
  regexSearchable?: string[];
  keyValueSearchable?: string[];
  relations?: string[];
}
