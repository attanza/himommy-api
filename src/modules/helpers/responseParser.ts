import {
  IApiItem,
  Meta2,
} from '@modules/shared/interfaces/response-parser.interface';

export const apiItem = (modelName: string, data: any): IApiItem => {
  const meta: Meta2 = {
    status: 200,
    message: `${modelName} item retrieved`,
  };

  return { meta, data };
};

export const apiCreated = (modelName: string, data: any): IApiItem => {
  const meta: Meta2 = {
    status: 201,
    message: `${modelName} created`,
  };

  return { meta, data };
};

export const apiUpdated = (modelName: string, data: any): IApiItem => {
  const meta: Meta2 = {
    status: 200,
    message: `${modelName} updated`,
  };

  return { meta, data };
};

export const apiDeleted = (modelName: string): IApiItem => {
  const meta: Meta2 = {
    status: 200,
    message: `${modelName} deleted`,
  };

  return { meta };
};

export const apiSucceed = (message: string): IApiItem => {
  const meta: Meta2 = {
    status: 200,
    message,
  };

  return { meta };
};
