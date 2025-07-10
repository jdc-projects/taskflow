import { useEffect, useMemo } from 'react';

/**
 * Creates a debounced function that delays invoking the provided function until after
 * the specified wait time has elapsed since the last time it was invoked.
 */
export function useDebounce<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): T {
  const debouncedCallback = useMemo(() => {
    let timeoutId: NodeJS.Timeout;
    
    const debounced = (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => callback(...args), delay);
    };
    
    // Store the clear function for cleanup
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (debounced as any).clear = () => clearTimeout(timeoutId);
    
    return debounced as T;
  }, [callback, delay]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((debouncedCallback as any).clear) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (debouncedCallback as any).clear();
      }
    };
  }, [debouncedCallback]);

  return debouncedCallback;
}