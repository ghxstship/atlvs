/**
 * Accordion Component — Collapsible Sections
 * Expandable/collapsible content sections
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
  disabled?: boolean;
}

export interface AccordionProps {
  /** Accordion items */
  items: AccordionItem[];
  
  /** Allow multiple open */
  multiple?: boolean;
  
  /** Default open items */
  defaultOpen?: string[];
  
  /** Variant */
  variant?: 'default' | 'bordered' | 'separated';
}

/**
 * Accordion Component
 * 
 * @example
 * ```tsx
 * <Accordion
 *   items={[
 *     { id: '1', title: 'Section 1', content: <div>Content 1</div> },
 *     { id: '2', title: 'Section 2', content: <div>Content 2</div> },
 *   ]}
 * />
 * ```
 */
export const Accordion: React.FC<AccordionProps> = ({
  items,
  multiple = false,
  defaultOpen = [],
  variant = 'default',
}) => {
  const [openItems, setOpenItems] = React.useState<Set<string>>(new Set(defaultOpen));
  
  const toggleItem = (id: string) => {
    setOpenItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (!multiple) {
          next.clear();
        }
        next.add(id);
      }
      return next;
    });
  };
  
  const variantClasses = {
    default: 'border-t border-border last:border-b',
    bordered: 'border border-border rounded-lg overflow-hidden',
    separated: 'space-y-2',
  };
  
  const itemClasses = {
    default: 'border-b border-border last:border-b-0',
    bordered: 'border-b border-border last:border-b-0',
    separated: 'border border-border rounded-lg overflow-hidden',
  };
  
  return (
    <div className={variantClasses[variant]}>
      {items.map((item) => {
        const isOpen = openItems.has(item.id);
        
        return (
          <div key={item.id} className={itemClasses[variant]}>
            <button
              onClick={() => !item.disabled && toggleItem(item.id)}
              disabled={item.disabled}
              className="
                w-full flex items-center justify-between
                px-4 py-3
                text-left font-medium
                hover:bg-muted
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors
              "
              aria-expanded={isOpen}
            >
              <span>{item.title}</span>
              <ChevronDown
                className={`
                  w-5 h-5
                  transition-transform duration-200
                  ${isOpen ? 'rotate-180' : ''}
                `}
              />
            </button>
            
            {isOpen && (
              <div className="px-4 py-3 text-sm text-muted-foreground">
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

Accordion.displayName = 'Accordion';
