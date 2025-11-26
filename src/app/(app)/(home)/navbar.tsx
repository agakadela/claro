'use client';

import { Poppins } from 'next/font/google';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { NavbarSidebar } from './navbar-sidebar';
import { NavbarSidebarItemProps } from './navbar-sidebar';
import { MenuIcon } from 'lucide-react';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['700'],
});

interface NavBarItemProps {
  href: string;
  label: string;
  isActive?: boolean;
}

const navItems: NavbarSidebarItemProps[] = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/features', label: 'Features' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/contact', label: 'Contact' },
];

const NavBarItem = ({ href, label, isActive = false }: NavBarItemProps) => {
  return (
    <Button
      asChild
      variant='outline'
      className={cn(
        'bg-transparent hover:bg-transparent hover:border-primary border-transparent rounded-full text-lg px-3.5',
        isActive && 'bg-black text-white hover:bg-black hover:text-white'
      )}
    >
      <Link href={href}>{label}</Link>
    </Button>
  );
};

export function Navbar({ isAuth = false }: { isAuth?: boolean }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  return (
    <nav className='h-20 flex border-b justify-between font-medium bg-white'>
      <Link href='/' className='pl-6 flex items-center'>
        <span className={cn(poppins.className, 'text-5xl font-semibold')}>
          Claro
        </span>
      </Link>
      {!isAuth ? (
        <>
          <NavbarSidebar
            items={navItems}
            isOpen={isSidebarOpen}
            onOpenChange={setIsSidebarOpen}
          />

          <div className='items-center justify-center gap-4 hidden lg:flex'>
            {navItems.map((item) => (
              <NavBarItem
                key={item.label}
                href={item.href}
                label={item.label}
                isActive={item.href === pathname}
              />
            ))}
          </div>

          <div className='hidden lg:flex items-center justify-center'>
            <Button
              asChild
              variant='secondary'
              className='border-l border-t-0 border-b-0 border-r-0 px-12 h-full rounded-none bg-white hover:bg-pink-400 transition-colors text-lg'
            >
              <Link href='/sign-in'>Log in</Link>
            </Button>
            <Button
              asChild
              variant='secondary'
              className='border-l border-t-0 border-b-0 border-r-0 px-12 h-full rounded-none bg-black text-white hover:bg-pink-400 hover:text-black transition-colors text-lg'
            >
              <Link href='/sign-up'>Start selling</Link>
            </Button>
          </div>
          <div className='flex lg:hidden items-center justify-center'>
            <Button
              variant='ghost'
              size='lg'
              className='border-transparent bg-white'
              onClick={() => setIsSidebarOpen(true)}
            >
              <MenuIcon />
            </Button>
          </div>
        </>
      ) : (
        <></>
      )}
    </nav>
  );
}
