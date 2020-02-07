import { Model } from 'mongoose';
import { ResourcePaginationPipe } from '../pipes/resource-pagination.pipe';

export interface IPaginated {
  modelName?: string;
  model?: Model<any>;
  query?: ResourcePaginationPipe;
  regexSearchable?: string[];
  keyValueSearchable?: string[];
  relations?: string[];
  customOptions?: any;
}
