import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  colorClass?: string;
}

interface SelectProps {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
}

export const Select = ({ label, value, options, onChange }: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const selectedOption = options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    window.addEventListener('mousedown', handleOutsideClick);
    return () => window.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <label className="mb-1.5 ml-1 block text-[11px] font-medium uppercase tracking-[0.08em] text-text-secondary">
        {label}
      </label>
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex h-10 w-full items-center justify-between rounded-lg border border-border bg-bg-base px-3 text-[13px] text-text-primary outline-none transition-all focus:ring-1 focus:ring-brand-orange/50 hover:border-border-strong"
      >
        <span className="flex items-center gap-2">
          {selectedOption.colorClass ? (
            <span className={`h-2 w-2 rounded-full ${selectedOption.colorClass}`} />
          ) : null}
          <span>{selectedOption.label}</span>
        </span>
        <ChevronDown size={14} className={`text-text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen ? (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-20 rounded-xl border border-border bg-bg-surface p-1">
          {options.map((option) => {
            const isSelected = option.value === value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-[13px] transition-all ${
                  isSelected
                    ? 'bg-bg-elevated text-text-primary'
                    : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary'
                }`}
              >
                <span className="flex items-center gap-2">
                  {option.colorClass ? (
                    <span className={`h-2 w-2 rounded-full ${option.colorClass}`} />
                  ) : null}
                  <span>{option.label}</span>
                </span>
                {isSelected ? <Check size={14} className="text-brand-orange" /> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};
