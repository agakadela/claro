import { parseAsString, useQueryStates } from 'nuqs';

export function useProductsFilters() {
  return useQueryStates({
    minPrice: parseAsString.withOptions({ clearOnDefault: true }),
    maxPrice: parseAsString.withOptions({ clearOnDefault: true }),
  });
}
