import { useCallback, useMemo, useRef, useEffect } from 'react';

/**
 * Debounce hook for expensive operations
 * Returns a debounced version of the callback
 */
export function useDebounce<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef(callback);
  
  // Update callback ref on each render
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      callbackRef.current(...args);
    }, delay);
  }, [delay]) as T;
}

/**
 * Throttle hook for rate-limiting expensive operations
 * Ensures the callback is called at most once per delay period
 */
export function useThrottle<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): T {
  const lastCall = useRef<number>(0);
  const callbackRef = useRef(callback);
  
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall.current >= delay) {
      lastCall.current = now;
      callbackRef.current(...args);
    }
  }, [delay]) as T;
}

/**
 * Memoize expensive computations with custom comparison
 * Similar to useMemo but with explicit dependency comparison
 */
export function useMemoCompare<T>(
  factory: () => T,
  deps: unknown[],
  compare: (prev: unknown[], next: unknown[]) => boolean = shallowArrayEqual
): T {
  const prevDepsRef = useRef<unknown[]>(deps);
  const valueRef = useRef<T>();

  if (!compare(prevDepsRef.current, deps) || valueRef.current === undefined) {
    valueRef.current = factory();
    prevDepsRef.current = deps;
  }

  return valueRef.current;
}

/**
 * Shallow array equality check
 */
function shallowArrayEqual(a: unknown[], b: unknown[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

/**
 * useStableCallback - Returns a stable callback reference
 * The callback identity never changes, but always calls the latest version
 */
export function useStableCallback<T extends (...args: unknown[]) => unknown>(
  callback: T
): T {
  const callbackRef = useRef(callback);
  
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback((...args: Parameters<T>) => {
    return callbackRef.current(...args);
  }, []) as T;
}

/**
 * useIsFirstRender - Returns true only on first render
 * Useful for skipping effects on mount
 */
export function useIsFirstRender(): boolean {
  const isFirst = useRef(true);
  
  if (isFirst.current) {
    isFirst.current = false;
    return true;
  }
  
  return false;
}

/**
 * usePrevious - Returns the previous value of a variable
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  
  useEffect(() => {
    ref.current = value;
  }, [value]);
  
  return ref.current;
}

/**
 * useRenderCount - Debug hook to count re-renders
 * Only logs in development mode
 */
export function useRenderCount(componentName: string): number {
  const renderCount = useRef(0);
  renderCount.current += 1;
  
  if (import.meta.env.DEV) {
    console.log(`[v0] ${componentName} render #${renderCount.current}`);
  }
  
  return renderCount.current;
}

/**
 * Batch state updates for better performance
 * Wraps multiple state updates in a single render cycle
 */
export function batchUpdates(callback: () => void): void {
  // React 18+ automatically batches updates, but this is explicit
  // for older React versions or when using outside React context
  if (typeof window !== 'undefined' && 'scheduler' in window) {
    // Use scheduler if available
    (window as unknown as { scheduler: { postTask: (cb: () => void) => void } }).scheduler.postTask(callback);
  } else {
    // Fallback to microtask
    queueMicrotask(callback);
  }
}

/**
 * useIntersectionObserver - Lazy load components when visible
 */
export function useIntersectionObserver(
  ref: React.RefObject<Element>,
  options?: IntersectionObserverInit
): boolean {
  const [isIntersecting, setIsIntersecting] = useRef(false);
  const [, forceUpdate] = useRef(0);
  
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting !== isIntersecting.current) {
        isIntersecting.current = entry.isIntersecting;
        forceUpdate.current += 1;
      }
    }, options);

    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, options]);

  return isIntersecting.current;
}
