export interface ResourcePagination {
  page: string;
  limit: string;
  search: string;
  sortBy: string;
  sortMode: SortMode;
}

enum SortMode {
  asc = 1,
  desc = -1,
}
