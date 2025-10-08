/**
 * WorkspaceSwitcher Component — Workspace/Organization Selector
 * Switch between workspaces/organizations
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

'use client';

import React from 'react';
import { Check, ChevronsUpDown, Plus, Settings } from 'lucide-react';

export interface Workspace {
  id: string;
  name: string;
  avatar?: string;
  role?: string;
  plan?: string;
}

export interface WorkspaceSwitcherProps {
  /** Current workspace */
  currentWorkspace: Workspace;
  
  /** Available workspaces */
  workspaces: Workspace[];
  
  /** Workspace change callback */
  onWorkspaceChange: (workspace: Workspace) => void;
  
  /** Create workspace callback */
  onCreateWorkspace?: () => void;
  
  /** Workspace settings callback */
  onWorkspaceSettings?: (workspace: Workspace) => void;
  
  /** Show create button */
  showCreate?: boolean;
  
  /** Show settings button */
  showSettings?: boolean;
  
  /** Custom className */
  className?: string;
}

/**
 * WorkspaceSwitcher Component
 * 
 * @example
 * ```tsx
 * <WorkspaceSwitcher
 *   currentWorkspace={currentWorkspace}
 *   workspaces={workspaces}
 *   onWorkspaceChange={handleWorkspaceChange}
 *   onCreateWorkspace={handleCreate}
 *   showCreate
 * />
 * ```
 */
export function WorkspaceSwitcher({
  currentWorkspace,
  workspaces,
  onWorkspaceChange,
  onCreateWorkspace,
  onWorkspaceSettings,
  showCreate = true,
  showSettings = true,
  className = '',
}: WorkspaceSwitcherProps) {
  const [open, setOpen] = React.useState(false);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  
  // Close on outside click
  React.useEffect(() => {
    if (!open) return;
    
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);
  
  // Close on escape
  React.useEffect(() => {
    if (!open) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open]);
  
  const handleWorkspaceSelect = (workspace: Workspace) => {
    onWorkspaceChange(workspace);
    setOpen(false);
  };
  
  return (
    <div className={`relative ${className}`}>
      {/* Trigger button */}
      <button
        ref={buttonRef}
        onClick={() => setOpen(!open)}
        className="
          flex items-center gap-2 w-full px-3 py-2
          rounded-md
          hover:bg-[var(--color-muted)]
          transition-colors
        "
        aria-expanded={open}
        aria-haspopup="true"
      >
        {/* Workspace avatar */}
        {currentWorkspace.avatar ? (
          <img
            src={currentWorkspace.avatar}
            alt={currentWorkspace.name}
            className="w-6 h-6 rounded"
          />
        ) : (
          <div className="
            w-6 h-6 rounded
            bg-[var(--color-primary)]
            text-[var(--color-primary-foreground)]
            flex items-center justify-center
            text-xs font-medium
          ">
            {currentWorkspace.name.charAt(0).toUpperCase()}
          </div>
        )}
        
        {/* Workspace info */}
        <div className="flex-1 text-left min-w-0">
          <div className="font-medium text-sm truncate">
            {currentWorkspace.name}
          </div>
          {currentWorkspace.plan && (
            <div className="text-xs text-[var(--color-foreground-secondary)] truncate">
              {currentWorkspace.plan}
            </div>
          )}
        </div>
        
        {/* Icon */}
        <ChevronsUpDown className="w-4 h-4 text-[var(--color-foreground-muted)] flex-shrink-0" />
      </button>
      
      {/* Dropdown */}
      {open && (
        <div
          ref={dropdownRef}
          className="
            absolute top-full left-0 mt-1
            w-full min-w-[16rem]
            rounded-lg border border-[var(--color-border)]
            bg-[var(--color-surface)]
            shadow-lg
            py-1
            z-50
          "
        >
          {/* Workspaces list */}
          <div className="max-h-64 overflow-y-auto">
            {workspaces.map((workspace) => {
              const isCurrent = workspace.id === currentWorkspace.id;
              
              return (
                <button
                  key={workspace.id}
                  onClick={() => handleWorkspaceSelect(workspace)}
                  className="
                    w-full flex items-center gap-3 px-3 py-2
                    hover:bg-[var(--color-muted)]
                    transition-colors
                  "
                >
                  {/* Avatar */}
                  {workspace.avatar ? (
                    <img
                      src={workspace.avatar}
                      alt={workspace.name}
                      className="w-6 h-6 rounded"
                    />
                  ) : (
                    <div className="
                      w-6 h-6 rounded
                      bg-[var(--color-primary)]
                      text-[var(--color-primary-foreground)]
                      flex items-center justify-center
                      text-xs font-medium
                    ">
                      {workspace.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  
                  {/* Info */}
                  <div className="flex-1 text-left min-w-0">
                    <div className="font-medium text-sm truncate">
                      {workspace.name}
                    </div>
                    {workspace.role && (
                      <div className="text-xs text-[var(--color-foreground-secondary)] truncate">
                        {workspace.role}
                      </div>
                    )}
                  </div>
                  
                  {/* Check icon */}
                  {isCurrent && (
                    <Check className="w-4 h-4 text-[var(--color-primary)] flex-shrink-0" />
                  )}
                  
                  {/* Settings icon */}
                  {showSettings && isCurrent && onWorkspaceSettings && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onWorkspaceSettings(workspace);
                        setOpen(false);
                      }}
                      className="
                        p-1 rounded
                        hover:bg-[var(--color-muted)]
                        transition-colors
                      "
                      aria-label="Workspace settings"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                  )}
                </button>
              );
            })}
          </div>
          
          {/* Create workspace */}
          {showCreate && onCreateWorkspace && (
            <>
              <div className="h-px bg-[var(--color-border)] my-1" />
              <button
                onClick={() => {
                  onCreateWorkspace();
                  setOpen(false);
                }}
                className="
                  w-full flex items-center gap-3 px-3 py-2
                  hover:bg-[var(--color-muted)]
                  transition-colors
                "
              >
                <div className="
                  w-6 h-6 rounded
                  bg-[var(--color-muted)]
                  flex items-center justify-center
                ">
                  <Plus className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">Create workspace</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

WorkspaceSwitcher.displayName = 'WorkspaceSwitcher';
