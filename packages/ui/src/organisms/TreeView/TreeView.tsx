/**
 * TreeView Component — Hierarchical Tree
 * Display hierarchical data in a tree structure
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

'use client';

import React from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface TreeNode {
  id: string;
  label: string;
  icon?: LucideIcon;
  children?: TreeNode[];
  disabled?: boolean;
}

export interface TreeViewProps {
  /** Tree data */
  data: TreeNode[];
  
  /** Node click handler */
  onNodeClick?: (node: TreeNode) => void;
  
  /** Default expanded nodes */
  defaultExpanded?: string[];
  
  /** Selected node */
  selected?: string;
}

/**
 * TreeView Component
 */
export const TreeView: React.FC<TreeViewProps> = ({
  data,
  onNodeClick,
  defaultExpanded = [],
  selected,
}) => {
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set(defaultExpanded));
  
  const toggleExpanded = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };
  
  const renderNode = (node: TreeNode, level = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expanded.has(node.id);
    const isSelected = selected === node.id;
    
    return (
      <div key={node.id}>
        <div
          className={`
            flex items-center gap-2 px-2 py-1.5 rounded
            ${isSelected ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}
            ${node.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            transition-colors
          `}
          style={{ paddingLeft: `${level * 1.5 + 0.5}rem` }}
          onClick={() => !node.disabled && onNodeClick?.(node)}
        >
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpanded(node.id);
              }}
              className="p-0.5 hover:bg-muted rounded"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          ) : (
            <div className="w-5" />
          )}
          
          {node.icon && <node.icon className="w-4 h-4" />}
          <span className="text-sm">{node.label}</span>
        </div>
        
        {hasChildren && isExpanded && (
          <div>
            {node.children!.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="py-2">
      {data.map(node => renderNode(node))}
    </div>
  );
};

TreeView.displayName = 'TreeView';
