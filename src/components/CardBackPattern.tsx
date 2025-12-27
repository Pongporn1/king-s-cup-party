import { cn } from '@/lib/utils';

interface CardBackPatternProps {
  className?: string;
}

export function CardBackPattern({ className }: CardBackPatternProps) {
  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)}>
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/80" />
      
      {/* Diamond pattern overlay */}
      <svg
        className="absolute inset-0 w-full h-full opacity-20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="diamond-pattern"
            x="0"
            y="0"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M10 0L20 10L10 20L0 10Z"
              fill="white"
              opacity="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#diamond-pattern)" />
      </svg>

      {/* Inner decorative frame */}
      <div className="absolute inset-2 sm:inset-3 rounded-lg border-2 border-white/30" />
      <div className="absolute inset-3 sm:inset-4 rounded-md border border-white/20" />

      {/* Corner decorations */}
      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 w-4 h-4 sm:w-6 sm:h-6">
        <svg viewBox="0 0 24 24" className="w-full h-full text-white/40">
          <path fill="currentColor" d="M12 2L2 12L12 22L22 12L12 2ZM12 6L18 12L12 18L6 12L12 6Z" />
        </svg>
      </div>
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 w-4 h-4 sm:w-6 sm:h-6">
        <svg viewBox="0 0 24 24" className="w-full h-full text-white/40">
          <path fill="currentColor" d="M12 2L2 12L12 22L22 12L12 2ZM12 6L18 12L12 18L6 12L12 6Z" />
        </svg>
      </div>
      <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 w-4 h-4 sm:w-6 sm:h-6">
        <svg viewBox="0 0 24 24" className="w-full h-full text-white/40">
          <path fill="currentColor" d="M12 2L2 12L12 22L22 12L12 2ZM12 6L18 12L12 18L6 12L12 6Z" />
        </svg>
      </div>
      <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 w-4 h-4 sm:w-6 sm:h-6">
        <svg viewBox="0 0 24 24" className="w-full h-full text-white/40">
          <path fill="currentColor" d="M12 2L2 12L12 22L22 12L12 2ZM12 6L18 12L12 18L6 12L12 6Z" />
        </svg>
      </div>

      {/* Center medallion */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          {/* Outer ring */}
          <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full border-2 border-white/30 flex items-center justify-center">
            {/* Inner decorative ring */}
            <div className="w-12 h-12 sm:w-18 sm:h-18 rounded-full border border-white/20 flex items-center justify-center">
              {/* Center content */}
              <div className="text-center">
                <div className="text-white font-bold text-lg sm:text-2xl leading-none">ไผ่</div>
                <div className="text-white/60 text-[8px] sm:text-xs mt-0.5">โดเรม่อน</div>
              </div>
            </div>
          </div>
          
          {/* Decorative spokes */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="absolute w-20 sm:w-28 h-0.5 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <div className="absolute w-0.5 h-20 sm:h-28 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
            <div className="absolute w-20 sm:w-28 h-0.5 bg-gradient-to-r from-transparent via-white/20 to-transparent rotate-45" />
            <div className="absolute w-20 sm:w-28 h-0.5 bg-gradient-to-r from-transparent via-white/20 to-transparent -rotate-45" />
          </div>
        </div>
      </div>

      {/* Subtle shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0" />
    </div>
  );
}