'use client';

import { Check, ChevronsUpDown, User, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../../components/atomic/Button';
import { Badge } from '../../components/Badge';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../../components/Command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../components/Popover';

export interface UserOption {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  role?: string;
}

export interface UserSelectorProps {
  users: UserOption[];
  selectedUsers?: string[];
  onChange?: (selectedIds: string[]) => void;
  placeholder?: string;
  emptyMessage?: string;
  multiple?: boolean;
  className?: string;
  maxDisplay?: number;
}

export function UserSelector({
  users,
  selectedUsers = [],
  onChange,
  placeholder = 'Select users...',
  emptyMessage = 'No users found.',
  multiple = true,
  className = '',
  maxDisplay = 3,
}: UserSelectorProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (userId: string) => {
    if (multiple) {
      const newSelection = selectedUsers.includes(userId)
        ? selectedUsers.filter((id) => id !== userId)
        : [...selectedUsers, userId];
      onChange?.(newSelection);
    } else {
      onChange?.([userId]);
      setOpen(false);
    }
  };

  const handleRemove = (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.(selectedUsers.filter((id) => id !== userId));
  };

  const selectedUserObjects = users.filter((user) =>
    selectedUsers.includes(user.id)
  );

  const displayUsers = selectedUserObjects.slice(0, maxDisplay);
  const remainingCount = selectedUserObjects.length - maxDisplay;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={`w-full justify-between ${className}`}
        >
          <div className="flex items-center gap-2 flex-1 overflow-hidden">
            {selectedUserObjects.length === 0 ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : (
              <div className="flex items-center gap-1 flex-wrap">
                {displayUsers.map((user) => (
                  <Badge
                    key={user.id}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    <User className="h-3 w-3" />
                    <span className="max-w-[100px] truncate">{user.name}</span>
                    {multiple && (
                      <button
                        type="button"
                        onClick={(e) => handleRemove(user.id, e)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </Badge>
                ))}
                {remainingCount > 0 && (
                  <Badge variant="secondary">+{remainingCount} more</Badge>
                )}
              </div>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search users..." />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {users.map((user) => {
                const isSelected = selectedUsers.includes(user.id);
                return (
                  <CommandItem
                    key={user.id}
                    value={user.name}
                    onSelect={() => handleSelect(user.id)}
                  >
                    <Check
                      className={`mr-2 h-4 w-4 ${
                        isSelected ? 'opacity-100' : 'opacity-0'
                      }`}
                    />
                    <div className="flex items-center gap-2 flex-1">
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="h-8 w-8 rounded-full"
                          />
                        ) : (
                          <User className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{user.name}</span>
                        {user.email && (
                          <span className="text-xs text-muted-foreground">
                            {user.email}
                          </span>
                        )}
                      </div>
                      {user.role && (
                        <Badge variant="outline" className="ml-auto">
                          {user.role}
                        </Badge>
                      )}
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
