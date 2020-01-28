export interface IApiCollection {
  meta: IMeta;
  data?: any[];
}

export interface IMeta {
  status: number;
  message: string;
  total?: number;
  limit: number;
  page: number;
  totalPages?: number;
  nextPage?: number | null;
  prevPage?: number | null;
}

export interface IApiItem {
  meta: Meta2;
  data?: any;
}

export interface Meta2 {
  status: number;
  message: string;
}
