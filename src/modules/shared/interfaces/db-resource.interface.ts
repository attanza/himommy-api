export interface IResourceShow {
  modelName?: string;
  id: string;
  relations?: string[];
}

export interface IResourceStore {
  modelName: string;
  createDto: any;
  uniques?: string[];
  relations?: string[];
  topic?: string;
}

export interface IResourceUpdate {
  modelName?: string;
  id: string;
  updateDto;
  uniques?: string[];
  relations?: string[];
  topic?: string;
}

export interface IResourceDestroy {
  modelName?: string;
  id: string;
  topic?: string;
}
