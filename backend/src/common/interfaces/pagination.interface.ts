export interface PaginatedMeta {
  total: number;
  page: number;
  limit: number;
  lastPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginatedMeta;
}

export function createPaginationMeta(
  total: number,
  page: number,
  limit: number,
): PaginatedMeta {
  const lastPage = Math.ceil(total / limit);
  return {
    total,
    page,
    limit,
    lastPage,
    hasNextPage: page < lastPage,
    hasPreviousPage: page > 1,
  };
}
