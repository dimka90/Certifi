import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/app/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-500',
  {
    variants: {
      variant: {
        primary: 'bg-zinc-950/80 backdrop-blur-md border border-green-500/50 text-white hover:bg-green-500/20 hover:border-green-400 transition-all duration-300',
        secondary: 'bg-gradient-to-r from-green-400 to-emerald-600 text-black font-bold border-0 hover:scale-105 hover:shadow-[0_0_40px_rgba(34,197,94,0.6)] shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-transform duration-300',
        ghost: 'text-white hover:bg-white/10',
        outline: 'border-2 border-white text-white hover:bg-white/5',
      },
      size: {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg',
        xl: 'px-12 py-6 text-xl tracking-widest uppercase',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> { }

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
);

Button.displayName = 'Button';

export { Button, buttonVariants };
