import { useEffect, useState } from 'react';

/**
 * Returns a debounced copy of `value` that updates only after `delay` ms.
 * Useful for limiting API-driven updates from fast-changing inputs.
 */
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [value, delay]);

  return debouncedValue;
};
