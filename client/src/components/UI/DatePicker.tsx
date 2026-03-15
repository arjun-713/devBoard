import { useEffect, useMemo, useRef, useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface DatePickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const WEEK_DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const parseYmd = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [yearText, monthText, dayText] = value.split('-');
  const year = Number(yearText);
  const month = Number(monthText) - 1;
  const day = Number(dayText);
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return null;
  const date = new Date(year, month, day);
  if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) return null;
  return date;
};

const toYmd = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const DatePicker = ({
  label,
  value,
  onChange,
  placeholder = 'Select date',
}: DatePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const initialDate = parseYmd(value) ?? new Date();
  const [visibleMonth, setVisibleMonth] = useState(
    new Date(initialDate.getFullYear(), initialDate.getMonth(), 1)
  );
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const parsed = parseYmd(value);
    if (parsed) {
      setVisibleMonth(new Date(parsed.getFullYear(), parsed.getMonth(), 1));
    }
  }, [value]);

  useEffect(() => {
    if (!isOpen) return;
    const handleOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('mousedown', handleOutsideClick);
    window.addEventListener('keydown', handleEscape);
    return () => {
      window.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const selectedDate = parseYmd(value);

  const monthLabel = visibleMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const dayCells = useMemo(() => {
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: Array<Date | null> = [];
    for (let i = 0; i < firstDay; i += 1) cells.push(null);
    for (let day = 1; day <= daysInMonth; day += 1) cells.push(new Date(year, month, day));
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [visibleMonth]);

  return (
    <div className="relative" ref={containerRef}>
      <label className="mb-1.5 ml-1 block text-[11px] font-medium uppercase tracking-[0.08em] text-text-secondary">
        {label}
      </label>
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex h-10 w-full items-center justify-between rounded-lg border border-border bg-bg-base px-3 text-[13px] text-text-primary outline-none transition-all hover:border-border-strong focus:ring-1 focus:ring-brand-orange/50"
      >
        <span className={selectedDate ? 'text-text-primary' : 'text-text-muted'}>
          {selectedDate
            ? selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : placeholder}
        </span>
        <Calendar size={14} className="text-text-muted" />
      </button>

      {isOpen ? (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-30 rounded-xl border border-border bg-bg-surface p-2">
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() =>
                setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))
              }
              className="rounded-md p-1 text-text-muted transition-colors hover:bg-bg-overlay hover:text-text-primary"
              aria-label="Previous month"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-[12px] font-medium text-text-primary">{monthLabel}</span>
            <button
              type="button"
              onClick={() =>
                setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))
              }
              className="rounded-md p-1 text-text-muted transition-colors hover:bg-bg-overlay hover:text-text-primary"
              aria-label="Next month"
            >
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {WEEK_DAYS.map((day) => (
              <span key={day} className="py-1 text-center text-[10px] uppercase tracking-[0.08em] text-text-muted">
                {day}
              </span>
            ))}
            {dayCells.map((date, index) => {
              if (!date) {
                return <span key={`empty-${index}`} className="h-8" />;
              }
              const iso = toYmd(date);
              const isSelected = iso === value;
              const isToday = iso === toYmd(new Date());
              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() => {
                    onChange(iso);
                    setIsOpen(false);
                  }}
                  className={`h-8 rounded-md text-[12px] transition-colors ${
                    isSelected
                      ? 'bg-brand-orange text-text-inverted'
                      : isToday
                        ? 'border border-border-strong text-text-primary hover:bg-bg-overlay'
                        : 'text-text-secondary hover:bg-bg-overlay hover:text-text-primary'
                  }`}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          <div className="mt-2 flex items-center justify-between border-t border-border-subtle pt-2">
            <button
              type="button"
              onClick={() => onChange(toYmd(new Date()))}
              className="rounded-md px-2 py-1 text-[11px] text-text-secondary transition-colors hover:bg-bg-overlay hover:text-text-primary"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="rounded-md px-2 py-1 text-[11px] text-text-muted transition-colors hover:bg-bg-overlay hover:text-text-primary"
            >
              Clear
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};
