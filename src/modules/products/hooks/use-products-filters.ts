import { useQueryStates } from 'nuqs';
import {
  createLoader,
  parseAsInteger,
  parseAsArrayOf,
  parseAsString,
  parseAsStringLiteral,
} from 'nuqs/server';

export const sortValues = ['for_you', 'trending', 'newest'] as const;

export const params = {
  minPrice: parseAsInteger.withOptions({ clearOnDefault: true }),
  maxPrice: parseAsInteger.withOptions({ clearOnDefault: true }),
  tags: parseAsArrayOf(parseAsString)
    .withOptions({ clearOnDefault: true })
    .withDefault([]),
  sort: parseAsStringLiteral(sortValues).withDefault('for_you'),
};

export function useProductsFilters() {
  return useQueryStates(params);
}

export const loadProductsFilters = createLoader(params);
