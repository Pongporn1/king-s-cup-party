import { cn } from '@/lib/utils';
import cardBackImage from '@/assets/card-back.jpg';

interface CardBackPatternProps {
  className?: string;
}

export function CardBackPattern({ className }: CardBackPatternProps) {
  return (
    <div className={cn("absolute inset-0 overflow-hidden rounded-lg", className)}>
      <img 
        src={cardBackImage} 
        alt="Card back"
        className="w-full h-full object-cover"
      />
    </div>
  );
}
