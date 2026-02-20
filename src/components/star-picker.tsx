'use client';

import { useState } from 'react';
import { StarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export function StarPicker({
  value,
  onChange,
  className,
  disabled,
}: {
  value?: number;
  onChange?: (value: number) => void;
  disabled?: boolean;
  className?: string;
}) {
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  return (
    <div
      className={cn(
        'flex items-center gap-x-1',
        disabled ? 'cursor-not-allowed opacity-50' : '',
        className,
      )}
    >
      {Array.from({ length: 5 }).map((_, index) => (
        <button
          key={index}
          type='button'
          onClick={() => onChange?.(index + 1)}
          disabled={disabled}
          aria-label={`Rate ${index + 1} star${index + 1 > 1 ? 's' : ''}`}
          className={cn(
            'p-0.5 hover:scale-110 transition cursor-pointer',
            disabled ? 'cursor-not-allowed hover:scale-100' : '',
          )}
          onMouseEnter={() => setHoveredRating(index + 1)}
          onMouseLeave={() => setHoveredRating(null)}
        >
          <StarIcon
            className={cn(
              'size-5',
              (hoveredRating || value || 0) >= index + 1
                ? 'fill-yellow-500'
                : '',
            )}
          />
        </button>
      ))}
    </div>
  );
}
