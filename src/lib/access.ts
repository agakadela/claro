import { ClientUser } from 'payload';
import { User } from '@/payload-types';

export function isSuperAdmin(user: User | ClientUser | null): boolean {
  return Boolean(user?.roles?.includes('super-admin'));
}
