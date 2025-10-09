/**
 * Drawer Compound Components - Radix UI compatible
 * Exports compound components for Drawer usage
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

'use client';

import React from 'react';

// Re-export main Drawer
export { Drawer } from './Drawer';
export type { DrawerProps } from './Drawer';

// DrawerContent
export interface DrawerContentProps {
  children: React.ReactNode;
  className?: string;
}

export const DrawerContent: React.FC<DrawerContentProps> = ({
  children,
  className,
}) => {
  return (
    <div className={className}>
      {children}
    </div>
  );
};

// DrawerHeader
export interface DrawerHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const DrawerHeader: React.FC<DrawerHeaderProps> = ({
  children,
  className,
}) => {
  return (
    <div className={`border-b border-border pb-4 mb-4 ${className || ''}`}>
      {children}
    </div>
  );
};

// DrawerTitle
export interface DrawerTitleProps {
  children: React.ReactNode;
  className?: string;
}

export const DrawerTitle: React.FC<DrawerTitleProps> = ({
  children,
  className,
}) => {
  return (
    <h2 className={`text-lg font-semibold ${className || ''}`}>
      {children}
    </h2>
  );
};

// DrawerDescription
export interface DrawerDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export const DrawerDescription: React.FC<DrawerDescriptionProps> = ({
  children,
  className,
}) => {
  return (
    <p className={`text-sm text-muted-foreground mt-1 ${className || ''}`}>
      {children}
    </p>
  );
};

// DrawerFooter
export interface DrawerFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const DrawerFooter: React.FC<DrawerFooterProps> = ({
  children,
  className,
}) => {
  return (
    <div className={`border-t border-border pt-4 mt-4 flex gap-2 justify-end ${className || ''}`}>
      {children}
    </div>
  );
};

// DrawerClose
export interface DrawerCloseProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const DrawerClose: React.FC<DrawerCloseProps> = ({
  children,
  onClick,
  className,
}) => {
  return (
    <button onClick={onClick} className={className}>
      {children}
    </button>
  );
};
