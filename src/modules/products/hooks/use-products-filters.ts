import { useQueryStates } from 'nuqs';
import {
  createLoader,
  parseAsInteger,
  parseAsArrayOf,
  parseAsString,
  parseAsStringLiteral,
} from 'nuqs/server';

export const sortValues = ['bestsellers', 'trending', 'newest'] as const;

export const params = {
  minPrice: parseAsInteger.withOptions({ clearOnDefault: true }),
  maxPrice: parseAsInteger.withOptions({ clearOnDefault: true }),
  tags: parseAsArrayOf(parseAsString)
    .withOptions({ clearOnDefault: true })
    .withDefault([]),
  sort: parseAsStringLiteral(sortValues).withDefault('bestsellers'),
  search: parseAsString.withOptions({ clearOnDefault: true }).withDefault(''),
};

export function useProductsFilters() {
  return useQueryStates(params, { shallow: true });
}

export const loadProductsFilters = createLoader(params);
