'use client';

import Link from 'next/link';
import { FormEvent, ReactNode } from 'react';
import { Button, Input } from '@ghxstship/ui';
import { Eye, EyeOff } from 'lucide-react';

interface AuthFormProps {
  onSubmit: (e: FormEvent<HTMLFormElement>) => void | Promise<void>;
  children: ReactNode;
  submitText: string;
  loading?: boolean;
  error?: string | null;
}

export function AuthForm({ onSubmit, children, submitText, loading, error }: AuthFormProps) {
  return (
    <form onSubmit={onSubmit} className="stack-lg">
      <div className="stack-md">{children}</div>

      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-md">
          <p className="form-error font-body text-destructive">{error}</p>
        </div>
      )}

      <Button type="submit" disabled={loading} size="lg" className="w-full">
        {loading ? 'Please wait…' : submitText}
      </Button>
    </form>
  );
}

interface AuthInputProps {
  id: string;
  name: string;
  type: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  autoComplete?: string;
  showPassword?: boolean;
  onTogglePassword?: () => void;
}

export function AuthInput({ 
  id, 
  name, 
  type, 
  label, 
  placeholder, 
  value, 
  onChange, 
  required = false,
  autoComplete,
  showPassword,
  onTogglePassword 
}: AuthInputProps) {
  const isPassword = type === 'password' || (type === 'text' && onTogglePassword);
  return (
    <div className="stack-xs">
      <label htmlFor={id} className="form-label text-muted-foreground">
        {label}
      </label>
      <div className="relative">
        <Input
          id={id}
          name={name}
          type={showPassword ? 'text' : type}
          autoComplete={autoComplete}
          required={required}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="pr-12"
        />
        {isPassword && onTogglePassword && (
          <button
            type="button"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute inset-y-0 right-0 flex items-center pr-md text-muted-foreground transition hover:text-foreground"
            onClick={onTogglePassword}
          >
            {showPassword ? (
              <EyeOff className="h-icon-xs w-icon-xs" />
            ) : (
              <Eye className="h-icon-xs w-icon-xs" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}

interface AuthLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
}

export function AuthLink({ href, children, className = '' }: AuthLinkProps) {
  return (
    <Link
      href={href}
      className={`color-accent hover:underline font-medium transition-colors ${className}`}
    >
      {children}
    </Link>
  );
}

interface AuthTextProps {
  children: ReactNode;
  className?: string;
}

export function AuthText({ children, className = '' }: AuthTextProps) {
  return <p className={`text-body-sm text-muted-foreground ${className}`}>{children}</p>;
}
