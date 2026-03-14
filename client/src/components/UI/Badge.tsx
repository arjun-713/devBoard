import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'todo' | 'inprogress' | 'done' | 'high' | 'medium' | 'low';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant, className }) => {
  const variants = {
    todo: 'bg-text-muted/10 text-text-muted',
    inprogress: 'bg-brand-orange/10 text-brand-orange',
    done: 'bg-brand-cyan/10 text-brand-cyan',
    high: 'bg-brand-pumpkin/10 text-brand-pumpkin',
    medium: 'bg-brand-orange/10 text-brand-orange',
    low: 'bg-brand-cyan/10 text-brand-cyan',
  };

  return (
    <span
      className={cn(
        'px-2 py-0.5 rounded-md text-[11px] font-medium tracking-[0.02em]',
        variant ? variants[variant] : 'bg-bg-overlay text-text-secondary',
        className
      )}
    >
      {children}
    </span>
  );
};
