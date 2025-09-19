'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Loader } from '../Loader';
import { Button } from '../atomic/Button';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface VirtualizedListProps<T = any> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  loading?: boolean;
  hasNextPage?: boolean;
  onLoadMore?: () => void;
  className?: string;
  onScroll?: (scrollTop: number) => void;
  scrollToIndex?: number;
  scrollToAlignment?: 'start' | 'center' | 'end' | 'auto';
}

export function VirtualizedList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  loading = false,
  hasNextPage = false,
  onLoadMore,
  className = '',
  onScroll,
  scrollToIndex,
  scrollToAlignment = 'auto'
}: VirtualizedListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const end = Math.min(items.length, start + visibleCount + overscan * 2);
    
    return { start, end };
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);

  // Get visible items
  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end).map((item, index) => ({
      item,
      index: visibleRange.start + index
    }));
  }, [items, visibleRange]);

  // Handle scroll
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = e.currentTarget.scrollTop;
    setScrollTop(newScrollTop);
    setIsScrolling(true);
    
    onScroll?.(newScrollTop);
    
    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    // Set scrolling to false after scroll ends
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);
    
    // Load more when near bottom
    if (hasNextPage && onLoadMore) {
      const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
      const threshold = scrollHeight - clientHeight - itemHeight * 5;
      
      if (scrollTop >= threshold) {
        onLoadMore();
      }
    }
  }, [onScroll, hasNextPage, onLoadMore, itemHeight]);

  // Scroll to specific index
  const scrollToItem = useCallback((index: number, alignment: 'start' | 'center' | 'end' | 'auto' = 'auto') => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const itemTop = index * itemHeight;
    const itemBottom = itemTop + itemHeight;
    const containerTop = container.scrollTop;
    const containerBottom = containerTop + containerHeight;
    
    let targetScrollTop = containerTop;
    
    switch (alignment) {
      case 'start':
        targetScrollTop = itemTop;
        break;
      case 'center':
        targetScrollTop = itemTop - (containerHeight - itemHeight) / 2;
        break;
      case 'end':
        targetScrollTop = itemBottom - containerHeight;
        break;
      case 'auto':
        if (itemTop < containerTop) {
          targetScrollTop = itemTop;
        } else if (itemBottom > containerBottom) {
          targetScrollTop = itemBottom - containerHeight;
        }
        break;
    }
    
    container.scrollTo({
      top: Math.max(0, Math.min(targetScrollTop, items.length * itemHeight - containerHeight)),
      behavior: 'smooth'
    });
  }, [itemHeight, containerHeight, items.length]);

  // Handle scroll to index prop
  useEffect(() => {
    if (scrollToIndex !== undefined && scrollToIndex >= 0 && scrollToIndex < items.length) {
      scrollToItem(scrollToIndex, scrollToAlignment);
    }
  }, [scrollToIndex, scrollToAlignment, scrollToItem, items.length]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.start * itemHeight;

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0
          }}
        >
          {visibleItems.map(({ item, index }) => (
            <div
              key={index}
              style={{ height: itemHeight }}
              className="flex-shrink-0"
            >
              {renderItem(item, index)}
            </div>
          ))}
        </div>
        
        {/* Loading indicator */}
        {loading && (
          <div
            style={{
              position: 'absolute',
              top: visibleRange.end * itemHeight,
              left: 0,
              right: 0,
              height: itemHeight * 3
            }}
            className="flex items-center justify-center"
          >
            <Loader  text="Loading more..." />
          </div>
        )}
      </div>
      
      {/* Scroll indicators */}
      {isScrolling && (
        <div className="absolute top-2 right-2 bg-foreground/75 text-background px-sm py-xs rounded text-xs">
          {Math.round((scrollTop / (totalHeight - containerHeight)) * 100)}%
        </div>
      )}
    </div>
  );
}

// Virtualized grid component
interface VirtualizedGridProps<T = any> {
  items: T[];
  itemWidth: number;
  itemHeight: number;
  containerWidth: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  gap?: number;
  overscan?: number;
  loading?: boolean;
  hasNextPage?: boolean;
  onLoadMore?: () => void;
  className?: string;
}

export function VirtualizedGrid<T>({
  items,
  itemWidth,
  itemHeight,
  containerWidth,
  containerHeight,
  renderItem,
  gap = 0,
  overscan = 5,
  loading = false,
  hasNextPage = false,
  onLoadMore,
  className = ''
}: VirtualizedGridProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate columns
  const columnsCount = Math.floor((containerWidth + gap) / (itemWidth + gap));
  const rowsCount = Math.ceil(items.length / columnsCount);
  const rowHeight = itemHeight + gap;

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const startRow = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
    const visibleRows = Math.ceil(containerHeight / rowHeight);
    const endRow = Math.min(rowsCount, startRow + visibleRows + overscan * 2);
    
    return { 
      startRow, 
      endRow,
      startIndex: startRow * columnsCount,
      endIndex: Math.min(items.length, endRow * columnsCount)
    };
  }, [scrollTop, rowHeight, containerHeight, overscan, rowsCount, columnsCount, items.length]);

  // Get visible items
  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex).map((item, index) => ({
      item,
      index: visibleRange.startIndex + index,
      row: Math.floor((visibleRange.startIndex + index) / columnsCount),
      col: (visibleRange.startIndex + index) % columnsCount
    }));
  }, [items, visibleRange, columnsCount]);

  // Handle scroll
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = e.currentTarget.scrollTop;
    setScrollTop(newScrollTop);
    
    // Load more when near bottom
    if (hasNextPage && onLoadMore) {
      const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
      const threshold = scrollHeight - clientHeight - rowHeight * 3;
      
      if (scrollTop >= threshold) {
        onLoadMore();
      }
    }
  }, [hasNextPage, onLoadMore, rowHeight]);

  const totalHeight = rowsCount * rowHeight;
  const offsetY = visibleRange.startRow * rowHeight;

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0
          }}
        >
          {visibleItems.map(({ item, index, row, col }) => (
            <div
              key={index}
              style={{
                position: 'absolute',
                left: col * (itemWidth + gap),
                top: (row - visibleRange.startRow) * rowHeight,
                width: itemWidth,
                height: itemHeight
              }}
            >
              {renderItem(item, index)}
            </div>
          ))}
        </div>
        
        {/* Loading indicator */}
        {loading && (
          <div
            style={{
              position: 'absolute',
              top: Math.ceil(visibleRange.endIndex / columnsCount) * rowHeight,
              left: 0,
              right: 0,
              height: rowHeight * 2
            }}
            className="flex items-center justify-center"
          >
            <Loader  text="Loading more..." />
          </div>
        )}
      </div>
    </div>
  );
}

// Infinite scroll hook
export function useInfiniteScroll(
  hasNextPage: boolean,
  isFetching: boolean,
  fetchNextPage: () => void,
  threshold: number = 100
) {
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);

  const handleScroll = useCallback((e: React.UIEvent<HTMLElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    
    if (
      hasNextPage &&
      !isFetching &&
      !isFetchingNextPage &&
      scrollHeight - scrollTop - clientHeight < threshold
    ) {
      setIsFetchingNextPage(true);
      fetchNextPage();
    }
  }, [hasNextPage, isFetching, isFetchingNextPage, fetchNextPage, threshold]);

  useEffect(() => {
    if (!isFetching) {
      setIsFetchingNextPage(false);
    }
  }, [isFetching]);

  return { handleScroll, isFetchingNextPage };
}

// Lazy loading component
interface LazyLoadProps {
  children: React.ReactNode;
  height?: number;
  offset?: number;
  placeholder?: React.ReactNode;
  onLoad?: () => void;
  className?: string;
}

export function LazyLoad({
  children,
  height = 200,
  offset = 100,
  placeholder,
  onLoad,
  className = ''
}: LazyLoadProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasLoaded) {
          setIsVisible(true);
          setHasLoaded(true);
          onLoad?.();
        }
      },
      {
        rootMargin: `${offset}px`,
        threshold: 0.1
      }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [offset, hasLoaded, onLoad]);

  return (
    <div
      ref={elementRef}
      className={className}
      style={{ minHeight: isVisible ? 'auto' : height }}
    >
      {isVisible ? children : (placeholder || <div style={{ height }} />)}
    </div>
  );
}
