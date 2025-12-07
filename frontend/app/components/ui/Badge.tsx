import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/app/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-gradient-to-br from-zinc-800/60 to-zinc-900/60 border border-green-500/50 text-green-500',
        success: 'bg-green-500/10 text-green-400 border border-green-500/30',
        warning: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30',
        error: 'bg-red-500/10 text-red-400 border border-red-500/30',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
