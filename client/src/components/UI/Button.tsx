import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
    const variants = {
      primary: 'bg-brand-orange text-text-inverted font-semibold rounded-full hover:bg-brand-orange/90 active:scale-[0.98]',
      secondary: 'bg-transparent border border-border-strong text-text-primary rounded-md hover:bg-bg-elevated active:scale-[0.98]',
      ghost: 'bg-transparent text-text-secondary hover:text-text-primary rounded-md active:scale-[0.98]',
      danger: 'bg-brand-pumpkin/10 text-brand-pumpkin border border-brand-pumpkin/20 rounded-md hover:bg-brand-pumpkin/20 active:scale-[0.98]',
    };

    const sizes = {
      sm: 'h-[30px] px-3 text-[12px]',
      md: 'h-[34px] px-4 text-[13px]',
      lg: 'h-[40px] px-6 text-[14px]',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed outline-none focus:ring-1 focus:ring-brand-orange/50',
          variants[variant],
          sizes[size],
          className
        )}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? (
          <div className="mr-2 h-3 w-8 rounded bg-current/30 animate-pulse" />
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
