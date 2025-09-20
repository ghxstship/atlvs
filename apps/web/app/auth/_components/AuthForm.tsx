'use client';

import { ReactNode } from 'react';
import { Button, UnifiedInput } from '@ghxstship/ui';
import { Eye, EyeOff } from 'lucide-react';

interface AuthFormProps {
  onSubmit: (e: React.FormEvent) => void;
  children: ReactNode;
  submitText: string;
  loading?: boolean;
  error?: string | null;
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

export function AuthForm({ onSubmit, children, submitText, loading, error }: AuthFormProps) {
  return (
    <form onSubmit={onSubmit} className="stack-lg">
      <div className="brand-ghostship stack-md">
        {children}
      </div>

      {error && (
        <div className="brand-ghostship bg-destructive border border-destructive rounded-md p-md">
          <p className="form-error font-body">{error}</p>
        </div>
      )}

      <Button
        type="submit"
        disabled={loading}
        variant="default"
        className="w-full"
        size="lg"
      >
        {loading ? 'Please wait...' : submitText}
      </Button>
    </form>
  );
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
    <div className="brand-ghostship stack-xs">
      <label htmlFor={id} className="form-label">
        {label}
      </label>
      <div className="brand-ghostship relative">
        <UnifiedInput           id={id}
          name={name}
          type={showPassword ? 'text' : type}
          autoComplete={autoComplete}
          required={required}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
           className="input w-full pr-12"
        />
        {isPassword && onTogglePassword && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-md flex items-center"
            onClick={onTogglePassword}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 color-muted" />
            ) : (
              <Eye className="h-4 w-4 color-muted" />
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
    <a 
      href={href} 
      className={`color-accent hover:underline form-label ${className}`}
    >
      {children}
    </a>
  );
}

interface AuthTextProps {
  children: ReactNode;
  className?: string;
}

export function AuthText({ children, className = '' }: AuthTextProps) {
  return (
    <p className={`text-body-sm color-muted font-body ${className}`}>
      {children}
    </p>
  );
}
