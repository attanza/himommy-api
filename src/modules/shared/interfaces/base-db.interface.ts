export interface IDbPaginated {
  options: any;
  relations: string[];
  sortBy: string;
  sortMode: SortMode;
  limit: number;
  page: number;
}

enum SortMode {
  ASC = 1,
  DESC = -1,
}
