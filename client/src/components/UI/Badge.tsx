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
    todo: 'bg-text-muted/10 text-text-muted border border-text-muted/20',
    inprogress: 'bg-[#FF9E00]/10 text-[#FFB347] border border-[#FF9E00]/30',
    done: 'bg-[#00B4D8]/10 text-[#5ED3FF] border border-[#00B4D8]/30',
    high: 'bg-red-500/15 text-red-300 border border-red-500/30 hover:shadow-[0_0_12px_rgba(239,68,68,0.2)]',
    medium: 'bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:shadow-[0_0_12px_rgba(245,158,11,0.2)]',
    low: 'bg-blue-500/15 text-blue-300 border border-blue-500/30 hover:shadow-[0_0_12px_rgba(59,130,246,0.2)]',
  };

  return (
    <span
      className={cn(
        'px-2 py-0.5 rounded-full text-[11px] font-medium tracking-[0.02em] transition-all',
        variant ? variants[variant] : 'bg-bg-overlay text-text-secondary',
        className
      )}
    >
      {children}
    </span>
  );
};
