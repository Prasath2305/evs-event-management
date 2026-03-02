// src/components/ui/Card.tsx
import { cn } from '@/lib/utils/helpers';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'featured' | 'compact';
}

export function Card({ children, className, variant = 'default' }: CardProps) {
  const variants = {
    default: 'bg-white/80 backdrop-blur-sm border border-emerald-100',
    featured: 'bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200',
    compact: 'bg-white shadow-sm',
  };

  return (
    <div
      className={cn(
        'rounded-2xl overflow-hidden transition-all duration-300',
        'hover:shadow-xl hover:shadow-emerald-900/5',
        variants[variant],
        className
      )}
    >
      {children}
    </div>
  );
}

