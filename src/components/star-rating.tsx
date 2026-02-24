import { StarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const MAX_STARS = 5;
const MIN_STARS = 0;

interface StarRatingProps {
  rating: number;
  className?: string;
  iconClassName?: string;
  text?: string;
}

export function StarRating({
  rating,
  className,
  iconClassName,
  text,
}: StarRatingProps) {
  const safeRating = Math.max(MIN_STARS, Math.min(MAX_STARS, rating));
  return (
    <div className={cn('flex items-center gap-x-1', className)}>
      {Array.from({ length: MAX_STARS }).map((_, index) => (
        <StarIcon
          key={index}
          className={cn(
            'size-4',
            index < safeRating ? 'fill-yellow-500' : '',
            iconClassName,
          )}
        />
      ))}
      {text && <span className='text-sm'>{text}</span>}
    </div>
  );
}
