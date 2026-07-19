// Table utilities for filtering, sorting, and pagination

export interface TableOptions {
  search?: string;
  filter?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface TableResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export function filterItems<T extends Record<string, any>>(
  items: T[],
  searchFields: (keyof T)[],
  searchTerm: string
): T[] {
  if (!searchTerm) return items;

  const term = searchTerm.toLowerCase();
  return items.filter((item) =>
    searchFields.some((field) => {
      const value = item[field];
      return String(value).toLowerCase().includes(term);
    })
  );
}

export function sortItems<T extends Record<string, any>>(
  items: T[],
  sortBy: keyof T,
  sortOrder: 'asc' | 'desc' = 'asc'
): T[] {
  return [...items].sort((a, b) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];

    if (aVal === bVal) return 0;
    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;

    const comparison = aVal > bVal ? 1 : -1;
    return sortOrder === 'asc' ? comparison : -comparison;
  });
}

export function paginateItems<T>(
  items: T[],
  page: number = 1,
  pageSize: number = 10
): TableResult<T> {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginatedItems = items.slice(start, end);
  const totalPages = Math.ceil(items.length / pageSize);

  return {
    items: paginatedItems,
    total: items.length,
    page,
    pageSize,
    totalPages,
  };
}

export function applyTableOptions<T extends Record<string, any>>(
  items: T[],
  searchFields: (keyof T)[],
  options: TableOptions,
  filterFn?: (item: T, filterValue: string) => boolean
): TableResult<T> {
  let result = items;

  // Apply search
  if (options.search) {
    result = filterItems(result, searchFields, options.search);
  }

  // Apply custom filter
  if (options.filter && filterFn) {
    result = result.filter((item) => filterFn(item, options.filter!));
  }

  // Apply sorting
  if (options.sortBy) {
    result = sortItems(result, options.sortBy as keyof T, options.sortOrder || 'asc');
  }

  // Apply pagination
  return paginateItems(result, options.page || 1, options.pageSize || 10);
}
