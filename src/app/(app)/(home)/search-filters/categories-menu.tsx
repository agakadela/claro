'use client';

import { CategoryDropdown } from './category-dropdown';
import { CustomCategory } from '../types';
import { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ListFilterIcon, Sidebar } from 'lucide-react';
import { CategoriesSidebar } from './categories-sidebar';

export function CategoriesMenu({
  categories,
}: {
  categories: CustomCategory[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const measuredRef = useRef<HTMLDivElement>(null);
  const viewAllRef = useRef<HTMLDivElement>(null);

  const [visibleCount, setVisibleCount] = useState(categories.length);
  const [isAnyHovered, setIsAnyHovered] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const activeCategory = 'all';
  const activeCategoryIndex = categories.findIndex(
    (category) => category.slug === activeCategory
  );
  const isActiveCategoryHidden =
    activeCategoryIndex >= visibleCount && activeCategoryIndex !== -1;

  useEffect(() => {
    function calculateVisibleCount() {
      if (!containerRef.current || !measuredRef.current || !viewAllRef.current)
        return;

      const containerWidth = containerRef.current.offsetWidth;
      const viewAllWidth = viewAllRef.current.offsetWidth;
      const availableWidth = containerWidth - viewAllWidth;
      const items = Array.from(measuredRef.current.children);

      let totalWidth = 0;
      let visibleItems = 0;

      for (const item of items) {
        const width = item.getBoundingClientRect().width;

        if (totalWidth + width > availableWidth) {
          break;
        }

        totalWidth += width;
        visibleItems++;
      }

      setVisibleCount(visibleItems);
    }

    const observer = new ResizeObserver(calculateVisibleCount);
    observer.observe(containerRef.current!);

    return () => observer.disconnect();
  }, [categories.length]);

  return (
    <div className='relative w-full'>
      <CategoriesSidebar
        categories={categories}
        isOpen={isSidebarOpen}
        onOpenChange={setIsSidebarOpen}
      />
      <div
        ref={measuredRef}
        className='absolute opacity-0 pointer-events-none flex'
        style={{ position: 'fixed', top: -9999, left: -9999 }}
      >
        {categories.map((category) => (
          <div key={category.id}>
            <CategoryDropdown
              category={category}
              isActive={activeCategory === category.slug}
              isNavHovered={false}
            />
          </div>
        ))}
      </div>
      <div
        ref={containerRef}
        onMouseEnter={() => setIsAnyHovered(true)}
        onMouseLeave={() => setIsAnyHovered(false)}
        className='flex items-center flex-nowrap'
      >
        {categories.slice(0, visibleCount).map((category) => (
          <div key={category.id}>
            <CategoryDropdown
              category={category}
              isActive={activeCategory === category.slug}
              isNavHovered={isAnyHovered}
            />
          </div>
        ))}
        <div ref={viewAllRef} className='shrink-0'>
          <Button
            variant='elevated'
            className={cn(
              'h-11 px-4 bg-transparent border-transparent rounded-full hover:bg-white hover:border-primary text-black',
              isActiveCategoryHidden &&
                !isAnyHovered &&
                'bg-white border-primary'
            )}
            onClick={() => setIsSidebarOpen(true)}
          >
            View All
            <ListFilterIcon className='size-4' />
          </Button>
        </div>
      </div>
    </div>
  );
}
