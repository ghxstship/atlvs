/**
 * DetailLayout Template
 * Layout template for detail/view pages
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

'use client';

import React from 'react';
import { ArrowLeft, Edit, Trash2, MoreVertical } from 'lucide-react';
import { Button } from '../../atoms/Button/Button';

export interface DetailLayoutProps {
  /** Page title */
  title: string;
  
  /** Page subtitle/breadcrumb */
  subtitle?: string;
  
  /** Back button handler */
  onBack?: () => void;
  
  /** Edit button handler */
  onEdit?: () => void;
  
  /** Delete button handler */
  onDelete?: () => void;
  
  /** More actions menu */
  onMore?: () => void;
  
  /** Sidebar content */
  sidebar?: React.ReactNode;
  
  /** Main content */
  children: React.ReactNode;
}

/**
 * DetailLayout Component
 */
export const DetailLayout: React.FC<DetailLayoutProps> = ({
  title,
  subtitle,
  onBack,
  onEdit,
  onDelete,
  onMore,
  sidebar,
  children,
}) => {
  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* Header */}
      <div className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="container mx-auto px-6 py-4">
          {subtitle && (
            <div className="text-sm text-[var(--color-foreground-secondary)] mb-2">
              {subtitle}
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {onBack && (
                <Button
                  variant="ghost"
                  size="sm"
                  icon={ArrowLeft}
                  onClick={onBack}
                />
              )}
              <h1 className="text-2xl font-bold text-[var(--color-foreground)]">{title}</h1>
            </div>
            
            <div className="flex items-center gap-2">
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  icon={Edit}
                  onClick={onEdit}
                >
                  Edit
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  icon={Trash2}
                  onClick={onDelete}
                />
              )}
              {onMore && (
                <Button
                  variant="ghost"
                  size="sm"
                  icon={MoreVertical}
                  onClick={onMore}
                />
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="container mx-auto px-6 py-6">
        <div className="flex gap-6">
          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
          
          {/* Sidebar */}
          {sidebar && (
            <aside className="w-80 flex-shrink-0">
              <div className="sticky top-6">
                {sidebar}
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
};

DetailLayout.displayName = 'DetailLayout';
