import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

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
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
}

/**
 * Hook for virtualizing long lists of notes for performance optimization.
 * Only renders visible items + overscan buffer instead of entire list.
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
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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
  const onScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    setScrollTop(target.scrollTop);
  }, []);

  // Scroll to specific index
  const scrollToIndex = useCallback((index: number) => {
    if (scrollContainerRef.current) {
      const targetScrollTop = Math.max(0, index * itemHeight - containerHeight / 2);
      scrollContainerRef.current.scrollTo({
        top: targetScrollTop,
        behavior: 'smooth',
      });
    }
  }, [itemHeight, containerHeight]);

  // Update scroll container ref callback
  useEffect(() => {
    // This is used internally when we need to access the scroll container
  }, []);

  return {
    visibleItems,
    visibleRange,
    totalHeight,
    offsetY,
    scrollToIndex,
    onScroll,
  };
}

/**
 * Wrapper component for virtual scroll container.
 * Handles the rendering of virtualized items with proper positioning.
 */
interface VirtualScrollContainerProps {
  height: number;
  itemHeight: number;
  items: any[];
  renderItem: (item: any, index: number) => React.ReactNode;
  onScroll?: (scrollTop: number) => void;
  className?: string;
  overscan?: number;
}

export function VirtualScrollContainer({
  height,
  itemHeight,
  items,
  renderItem,
  onScroll,
  className = '',
  overscan = 3,
}: VirtualScrollContainerProps) {
  const { visibleItems, visibleRange, totalHeight, offsetY, onScroll: handleScroll } = useVirtualizedNotes({
    items,
    containerHeight: height,
    itemHeight,
    overscan,
  });

  const handleScrollInternal = (e: React.UIEvent<HTMLDivElement>) => {
    handleScroll(e);
    onScroll?.(e.currentTarget.scrollTop);
  };

  return (
    <div
      style={{ height, overflow: 'auto' }}
      onScroll={handleScrollInternal}
      className={className}
      role="list"
      aria-label="Virtual scrolled list"
    >
      {/* Spacer for top invisible items */}
      {visibleRange.startIndex > 0 && (
        <div style={{ height: offsetY, pointerEvents: 'none' }} aria-hidden="true" />
      )}

      {/* Visible items */}
      {visibleItems.map((item, i) => (
        <div key={item.id || visibleRange.startIndex + i} role="listitem">
          {renderItem(item, visibleRange.startIndex + i)}
        </div>
      ))}

      {/* Spacer for bottom invisible items */}
      {visibleRange.endIndex < items.length && (
        <div
          style={{ height: totalHeight - (offsetY + visibleItems.length * itemHeight), pointerEvents: 'none' }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}