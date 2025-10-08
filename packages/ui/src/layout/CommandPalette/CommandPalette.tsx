/**
 * CommandPalette Component — Cmd+K Command Menu
 * Quick navigation and actions
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

'use client';

import React from 'react';
import { Search, ArrowRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon?: LucideIcon;
  shortcut?: string[];
  category?: string;
  onSelect: () => void;
}

export interface CommandPaletteProps {
  /** Is palette open */
  open: boolean;
  
  /** Close callback */
  onClose: () => void;
  
  /** Command items */
  items: CommandItem[];
  
  /** Recent items */
  recentItems?: CommandItem[];
  
  /** Search placeholder */
  placeholder?: string;
  
  /** Show categories */
  showCategories?: boolean;
  
  /** Custom className */
  className?: string;
}

/**
 * CommandPalette Component
 * 
 * @example
 * ```tsx
 * const [open, setOpen] = useState(false);
 * 
 * // Cmd+K listener
 * useEffect(() => {
 *   const down = (e: KeyboardEvent) => {
 *     if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
 *       e.preventDefault();
 *       setOpen(true);
 *     }
 *   };
 *   document.addEventListener('keydown', down);
 *   return () => document.removeEventListener('keydown', down);
 * }, []);
 * 
 * <CommandPalette
 *   open={open}
 *   onClose={() => setOpen(false)}
 *   items={commands}
 * />
 * ```
 */
export function CommandPalette({
  open,
  onClose,
  items,
  recentItems = [],
  placeholder = 'Search commands...',
  showCategories = true,
  className = '',
}: CommandPaletteProps) {
  const [search, setSearch] = React.useState('');
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  
  // Filter items based on search
  const filteredItems = React.useMemo(() => {
    if (!search) return items;
    
    const query = search.toLowerCase();
    return items.filter(
      item =>
        item.label.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query)
    );
  }, [items, search]);
  
  // Group by category
  const groupedItems = React.useMemo(() => {
    if (!showCategories) {
      return { '': filteredItems };
    }
    
    return filteredItems.reduce((acc, item) => {
      const category = item.category || 'Other';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {} as Record<string, CommandItem[]>);
  }, [filteredItems, showCategories]);
  
  // Handle keyboard navigation
  React.useEffect(() => {
    if (!open) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filteredItems.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const item = filteredItems[selectedIndex];
        if (item) {
          item.onSelect();
          onClose();
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, filteredItems, selectedIndex, onClose]);
  
  // Focus input when opened
  React.useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      setSearch('');
      setSelectedIndex(0);
    }
  }, [open]);
  
  // Lock body scroll
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);
  
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Palette */}
      <div
        className={`
          relative w-full max-w-2xl
          bg-card
          border border-border
          rounded-xl shadow-2xl
          overflow-hidden
          ${className}
        `}
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search className="w-5 h-5 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="
              flex-1 bg-transparent
              text-base
              placeholder:text-muted-foreground
              focus:outline-none
            "
          />
          <kbd className="
            px-2 py-1
            rounded
            bg-muted
            text-xs font-medium
            text-muted-foreground
          ">
            ESC
          </kbd>
        </div>
        
        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {/* Recent items */}
          {!search && recentItems.length > 0 && (
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Recent
              </div>
              {recentItems.slice(0, 5).map((item, index) => (
                <CommandItemComponent
                  key={item.id}
                  item={item}
                  selected={index === selectedIndex}
                  onClick={() => {
                    item.onSelect();
                    onClose();
                  }}
                />
              ))}
            </div>
          )}
          
          {/* Grouped items */}
          {Object.entries(groupedItems).map(([category, categoryItems]) => (
            <div key={category} className="p-2">
              {showCategories && category && (
                <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {category}
                </div>
              )}
              {categoryItems.map((item) => {
                const itemIndex = filteredItems.indexOf(item);
                return (
                  <CommandItemComponent
                    key={item.id}
                    item={item}
                    selected={itemIndex === selectedIndex}
                    onClick={() => {
                      item.onSelect();
                      onClose();
                    }}
                  />
                );
              })}
            </div>
          ))}
          
          {/* No results */}
          {filteredItems.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              No results found for "{search}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Command Item Component
 */
interface CommandItemComponentProps {
  item: CommandItem;
  selected: boolean;
  onClick: () => void;
}

function CommandItemComponent({ item, selected, onClick }: CommandItemComponentProps) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 px-3 py-2
        rounded-md
        text-left
        transition-colors
        ${selected
          ? 'bg-primary text-primary-foreground'
          : 'hover:bg-muted'
        }
      `}
    >
      {/* Icon */}
      {item.icon && (
        <item.icon className="w-5 h-5 flex-shrink-0" />
      )}
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{item.label}</div>
        {item.description && (
          <div className={`
            text-sm truncate
            ${selected
              ? 'text-primary-foreground/80'
              : 'text-muted-foreground'
            }
          `}>
            {item.description}
          </div>
        )}
      </div>
      
      {/* Shortcut */}
      {item.shortcut && (
        <div className="flex items-center gap-1">
          {item.shortcut.map((key, index) => (
            <kbd
              key={index}
              className={`
                px-2 py-1 rounded
                text-xs font-medium
                ${selected
                  ? 'bg-[var(--color-primary-foreground)]/20 text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
                }
              `}
            >
              {key}
            </kbd>
          ))}
        </div>
      )}
      
      {/* Arrow */}
      {selected && (
        <ArrowRight className="w-4 h-4 flex-shrink-0" />
      )}
    </button>
  );
}

CommandPalette.displayName = 'CommandPalette';
