import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import Link from 'next/link';

export interface NavbarSidebarItemProps {
  href: string;
  label: string;
}

interface NavbarSidebarProps {
  items: NavbarSidebarItemProps[];
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function NavbarSidebar({
  items,
  isOpen,
  onOpenChange,
}: NavbarSidebarProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side='left' className='p-0 transition-none'>
        <SheetHeader className='p-4 border-b'>
          <div className='flex items-center'>
            <SheetTitle className=''>Menu</SheetTitle>
          </div>
        </SheetHeader>
        <ScrollArea className='flex flex-col overflow-y-auto h-full pb-2'>
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => onOpenChange(false)}
              className='w-full text-left p-4 hover:bg-black hover:text-white transition-colors flex items-center text-base font-medium'
            >
              {item.label}
            </Link>
          ))}
          <div className='border-t'>
            <Link
              href='/sign-in'
              onClick={() => onOpenChange(false)}
              className='w-full text-left p-4 hover:bg-black hover:text-white transition-colors flex items-center text-base font-medium'
            >
              Log in
            </Link>
            <Link
              href='/sign-up'
              onClick={() => onOpenChange(false)}
              className='w-full text-left p-4 hover:bg-black hover:text-white transition-colors flex items-center text-base font-medium'
            >
              Start selling
            </Link>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
