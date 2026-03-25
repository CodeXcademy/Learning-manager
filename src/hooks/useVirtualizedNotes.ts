import { useCallback, useMemo, useState } from 'react';

interface UseVirtualizedNotesOptions {
  items: any[];
  containerHeight: number;
  itemHeight: number;
  overscan?: number; // Extra items to render outside visible area
}

interface VirtualizedResult {
  visibleItems: any[];
  visibleRange: { startIndex: number; endIndex: number };
  totalHeight: number;
  offsetY: number;
  scrollToIndex: (index: number) => void;
  onScroll: (scrollTop: number) => void;
}

/**
 * Hook for virtualizing long lists of notes for performance optimization.
 * Only renders visible items + overscan buffer instead of entire list.
 * 
 * Performance: O(1) rendering complexity regardless of total items
 * Memory: O(visible items + overscan) instead of O(total items)
 * 
 * Usage:
 * const { visibleItems, totalHeight, onScroll } = useVirtualizedNotes({
 *   items: filteredNotes,
 *   containerHeight: 800,
 *   itemHeight: 120,
 *   overscan: 3
 * });
 */
export function useVirtualizedNotes({
  items,
  containerHeight,
  itemHeight,
  overscan = 3,
}: UseVirtualizedNotesOptions): VirtualizedResult {
  const [scrollTop, setScrollTop] = useState(0);

  // Calculate visible range based on scroll position
  const visibleRange = useMemo(() => {
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(items.length, startIndex + visibleCount + overscan * 2);

    return { startIndex, endIndex };
  }, [scrollTop, containerHeight, itemHeight, overscan, items.length]);

  // Extract visible items
  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex);
  }, [items, visibleRange]);

  // Calculate total height
  const totalHeight = useMemo(() => {
    return items.length * itemHeight;
  }, [items.length, itemHeight]);

  // Offset for positioning visible items
  const offsetY = useMemo(() => {
    return visibleRange.startIndex * itemHeight;
  }, [visibleRange.startIndex, itemHeight]);

  // Handle scroll events
  const onScroll = useCallback((scrollTopValue: number) => {
    setScrollTop(scrollTopValue);
  }, []);

  // Scroll to specific index with smooth behavior
  const scrollToIndex = useCallback((index: number) => {
    const targetScrollTop = Math.max(0, index * itemHeight - containerHeight / 2);
    setScrollTop(targetScrollTop);
  }, [itemHeight, containerHeight]);

  return {
    visibleItems,
    visibleRange,
    totalHeight,
    offsetY,
    scrollToIndex,
    onScroll,
  };
}