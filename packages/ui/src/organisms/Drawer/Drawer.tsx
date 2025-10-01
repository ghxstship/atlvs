'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import clsx from 'clsx';

export type DrawerProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: 'sm' | 'md' | 'lg' | 'xl';
  ariaLabel?: string;
};

const widths: Record<NonNullable<DrawerProps['width']>, string> = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-2xl',
  xl: 'max-w-3xl'
};

export function Drawer({ open, onClose, title, description, children, footer, width = 'lg', ariaLabel }: DrawerProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  // Manage focus
  useEffect(() => {
    if (open) {
      previouslyFocusedRef.current = (document.activeElement as HTMLElement) || null;
      // move focus to panel
      setTimeout(() => {
        panelRef.current?.focus();
      }, 0);
    } else if (previouslyFocusedRef.current) {
      previouslyFocusedRef.current.focus();
    }
  }, [open]);

  // ESC to close, trap focus basic
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
      if (e.key === 'Tab' && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50" aria-hidden={!open}>
      <div
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div className={clsx('absolute right-0 top-0 h-full w-full bg-background shadow-modal', widths[width])}
           role="dialog"
           aria-modal="true"
           aria-label={ariaLabel || title}
           aria-describedby={description ? 'drawer-desc' : undefined}
           tabIndex={-1}
           ref={panelRef}
      >
        <div className="flex items-start justify-between border-b p-md">
          <div className="min-w-0">
            {title ? <h2 className="text-xl font-bold tracking-wide uppercase" style={{ fontFamily: 'var(--font-title)' }}>{title}</h2> : null}
            {description ? <p id="drawer-desc" className="text-sm opacity-80">{description}</p> : null}
          </div>
          <button
            type="button"
            aria-label="Close"
            title="Close"
            className="rounded p-xs hover:bg-accent"
            onClick={onClose}
          >
            <X className="h-icon-sm w-icon-sm" aria-hidden="true" />
          </button>
        </div>
        <div className="h-[calc(100%-4rem-3.5rem)] overflow-y-auto p-md">
          {children}
        </div>
        {footer ? (
          <div className="border-t p-sm flex items-center justify-end gap-sm">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
