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
    inprogress: 'bg-[#FF9E00]/10 text-[#FF9E00]',
    done: 'bg-[#00B4D8]/10 text-[#00B4D8]',
    high: 'bg-[#FF6D00]/10 text-[#FF6D00]',
    medium: 'bg-[#FF9E00]/10 text-[#FF9E00]',
    low: 'bg-[#00B4D8]/10 text-[#00B4D8]',
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
