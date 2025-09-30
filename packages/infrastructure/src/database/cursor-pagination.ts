// Cursor-based pagination utilities for Supabase
export interface CursorPaginationOptions {
  cursor?: string;
  limit: number;
  orderBy: string;
  orderDirection: 'asc' | 'desc';
}

export interface CursorPaginationResult<T> {
  data: T[];
  nextCursor?: string;
  hasNextPage: boolean;
}

/**
 * Apply cursor-based pagination to a Supabase query
 * @param query - The Supabase query to paginate
 * @param options - Pagination options
 * @returns The paginated query
 */
export function applyCursorPagination<T>(
  query: any,
  options: CursorPaginationOptions
) {
  const { cursor, limit, orderBy, orderDirection } = options;

  // Apply ordering
  query = query.order(orderBy, { ascending: orderDirection === 'asc' });

  // Apply cursor filter if provided
  if (cursor) {
    const operator = orderDirection === 'asc' ? 'gt' : 'lt';
    query = query.filter(orderBy, operator, cursor);
  }

  // Apply limit (get one extra to determine if there are more pages)
  query = query.limit(limit + 1);

  return query;
}

/**
 * Process cursor pagination results
 * @param data - The raw data from Supabase
 * @param limit - The requested limit
 * @param orderBy - The field used for ordering
 * @returns Processed pagination result
 */
export function processCursorResults<T>(
  data: T[],
  limit: number,
  orderBy: keyof T
): CursorPaginationResult<T> {
  const hasNextPage = data.length > limit;
  const actualData = hasNextPage ? data.slice(0, limit) : data;

  let nextCursor: string | undefined;
  if (hasNextPage && actualData.length > 0) {
    const lastItem = actualData[actualData.length - 1];
    nextCursor = String(lastItem[orderBy]);
  }

  return {
    data: actualData,
    nextCursor,
    hasNextPage
  };
}
