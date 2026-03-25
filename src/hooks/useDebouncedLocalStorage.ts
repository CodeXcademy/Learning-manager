import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Debounced localStorage hook for performance-critical updates
 * Batches rapid state changes before persisting to localStorage
 * 
 * @param key - localStorage key
 * @param initialValue - fallback value if key doesn't exist
 * @param debounceMs - debounce delay in milliseconds (default: 500ms)
 */
export function useDebouncedLocalStorage<T>(
  key: string,
  initialValue: T,
  debounceMs: number = 500
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  // Pending value ref for immediate reads during debounce
  const pendingValue = useRef<T | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Read initial value from localStorage
  const readValue = useCallback((): T => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  }, [initialValue, key]);

  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Flush pending writes immediately
  const flush = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (pendingValue.current !== null && typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(key, JSON.stringify(pendingValue.current));
        window.dispatchEvent(new StorageEvent('storage', { 
          key, 
          newValue: JSON.stringify(pendingValue.current) 
        }));
      } catch (error) {
        console.warn(`Error flushing localStorage key "${key}":`, error);
      }
      pendingValue.current = null;
    }
  }, [key]);

  // Debounced setValue
  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    // Calculate new value
    const currentValue = pendingValue.current ?? storedValue;
    const valueToStore = value instanceof Function ? value(currentValue) : value;
    
    // Update React state immediately for UI responsiveness
    setStoredValue(valueToStore);
    pendingValue.current = valueToStore;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Schedule debounced write
    timeoutRef.current = setTimeout(() => {
      if (typeof window !== 'undefined' && pendingValue.current !== null) {
        try {
          window.localStorage.setItem(key, JSON.stringify(pendingValue.current));
          window.dispatchEvent(new StorageEvent('storage', { 
            key, 
            newValue: JSON.stringify(pendingValue.current) 
          }));
        } catch (error) {
          console.warn(`Error setting localStorage key "${key}":`, error);
        }
        pendingValue.current = null;
      }
    }, debounceMs);
  }, [key, storedValue, debounceMs]);

  // Flush on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        // Synchronous flush on unmount
        if (pendingValue.current !== null && typeof window !== 'undefined') {
          try {
            window.localStorage.setItem(key, JSON.stringify(pendingValue.current));
          } catch {
            // Silent fail on unmount
          }
        }
      }
    };
  }, [key]);

  // Listen for cross-tab changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        // Cancel pending write if external change detected
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        pendingValue.current = null;
        setStoredValue(JSON.parse(e.newValue));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setValue, flush];
}

/**
 * Batched updates helper for multiple localStorage operations
 * Groups multiple updates into a single render cycle
 */
export function batchLocalStorageUpdates(updates: Array<{ key: string; value: unknown }>) {
  if (typeof window === 'undefined') return;
  
  // Use requestAnimationFrame to batch DOM reads/writes
  requestAnimationFrame(() => {
    updates.forEach(({ key, value }) => {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.warn(`Error batch-writing localStorage key "${key}":`, error);
      }
    });
  });
}
