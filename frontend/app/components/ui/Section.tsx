import React from 'react';
import { cn } from '@/app/lib/utils';

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  variant?: 'default' | 'dark' | 'gradient';
  padding?: 'sm' | 'md' | 'lg' | 'xl';
}

const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ className, variant = 'default', padding = 'lg', ...props }, ref) => {
    const variantClasses = {
      default: 'bg-black',
      dark: 'bg-zinc-950',
      gradient: 'bg-gradient-to-b from-black to-zinc-950',
    };

    const paddingClasses = {
      sm: 'py-8 sm:py-12',
      md: 'py-12 sm:py-16 lg:py-20',
      lg: 'py-16 sm:py-20 lg:py-28',
      xl: 'py-20 sm:py-28 lg:py-32',
    };

    return (
      <section
        ref={ref}
        className={cn(variantClasses[variant], paddingClasses[padding], className)}
        {...props}
      />
    );
  }
);

Section.displayName = 'Section';

export { Section };
