"use client";

import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from './input';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
  buttonText?: string;
  showButton?: boolean;
  variant?: 'default' | 'minimal' | 'pill';
  size?: 'sm' | 'md' | 'lg';
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search...',
  onSearch,
  className,
  buttonText = 'Search',
  showButton = false,
  variant = 'default',
  size = 'md',
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  const sizeClasses = {
    sm: 'h-8 text-xs',
    md: 'h-10 text-sm',
    lg: 'h-12 text-base',
  };

  const variantClasses = {
    default: 'bg-background border border-input',
    minimal: 'bg-transparent',
    pill: 'bg-background border border-input rounded-full',
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className={cn(
        'flex w-full max-w-md relative', 
        className
      )}
    >
      <div className="relative w-full">
        <Search 
          className={cn(
            "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground",
            size === 'lg' && "h-5 w-5"
          )} 
        />
        <Input
          type="search"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={cn(
            "pl-10 w-full pr-4",
            variantClasses[variant],
            sizeClasses[size],
            variant === 'pill' && 'rounded-full',
            showButton && 'rounded-r-none'
          )}
        />
      </div>
      
      {showButton && (
        <Button 
          type="submit" 
          className={cn(
            "rounded-l-none",
            sizeClasses[size]
          )}
        >
          {buttonText}
        </Button>
      )}
    </form>
  );
};
