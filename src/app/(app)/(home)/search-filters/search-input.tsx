import { Input } from '@/components/ui/input';
import { SearchIcon } from 'lucide-react';

interface SearchInputProps {
  disabled?: boolean;
}
export function SearchInput({ disabled }: SearchInputProps) {
  return (
    <div className='flex items-center gap-2w-full'>
      <div className='relative w-full'>
        <SearchIcon className='size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2' />
        <Input
          className='pl-8'
          type='text'
          placeholder='Search products'
          disabled={disabled}
        />
      </div>
      {/* TODO: Add categories view all button */}
      {/* TODO: Add library button */}
    </div>
  );
}
