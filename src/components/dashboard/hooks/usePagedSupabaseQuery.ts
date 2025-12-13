import { keepPreviousData, useQuery, UseQueryResult } from "@tanstack/react-query";

export const DASHBOARD_ITEMS_PER_PAGE = 20;

interface PagedQueryResult<TData> {
  data: TData[];
  totalCount: number;
}

interface PagedQueryOptions<TFilters, TData> {
  keyPrefix: string;
  page: number;
  filters: TFilters;
  queryFn: (page: number, filters: TFilters) => Promise<TData[]>;
  countFn?: (filters: TFilters) => Promise<number>;
}

export function usePagedSupabaseQuery<TData, TFilters = Record<string, any>>({
  keyPrefix,
  page,
  filters,
  queryFn,
  countFn,
}: PagedQueryOptions<TFilters, TData>): UseQueryResult<TData[]> & { totalCount?: number } {
  const queryKey = [keyPrefix, { page, filters }];
  const countKey = countFn ? [keyPrefix, "count", { filters }] : null;

  const countQuery = useQuery({
    queryKey: countKey!,
    queryFn: () => countFn!(filters),
    enabled: !!countFn,
  });

  const dataQuery = useQuery({
    queryKey,
    queryFn: () => queryFn(page, filters),
    placeholderData: keepPreviousData,
  });

  return {
    ...dataQuery,
    totalCount: countQuery.data,
  };
}
