import Link from 'next/link';
import { Poppins } from 'next/font/google';
import { cn } from '@/lib/utils';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['700'],
});

export function TenantFooter() {
  return (
    <footer className='border-t font-medium bg-white'>
      <div className='max-w-(--breakpoint-2xl) mx-auto flex items-center h-full px-4 py-6 lg:px-12'>
        <p>
          Powered by{' '}
          <Link
            href='/'
            className={cn(poppins.className, 'text-primary underline')}
          >
            Claro
          </Link>
        </p>
      </div>
    </footer>
  );
}
