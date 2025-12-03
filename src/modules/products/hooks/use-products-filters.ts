import { parseAsInteger, useQueryStates } from 'nuqs';

export function useProductsFilters() {
  return useQueryStates({
    minPrice: parseAsInteger.withOptions({ clearOnDefault: true }),
    maxPrice: parseAsInteger.withOptions({ clearOnDefault: true }),
  });
}
