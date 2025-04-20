"use client";

import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from './input';
import { Button } from './button';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './popover';
import { Checkbox } from './checkbox';
import { Label } from './label';
import { Badge } from './badge';

interface FilterOption {
  id: string;
  label: string;
}

interface FilterCategory {
  id: string;
  name: string;
  options: FilterOption[];
}

interface AdvancedSearchProps {
  placeholder?: string;
  onSearch?: (query: string, filters: Record<string, string[]>) => void;
  className?: string;
  filterCategories?: FilterCategory[];
}

export const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  placeholder = 'Search...',
  onSearch,
  className,
  filterCategories = [],
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery, activeFilters);
    }
  };

  const handleFilterChange = (categoryId: string, optionId: string, checked: boolean) => {
    setActiveFilters(prev => {
      const newFilters = { ...prev };
      
      if (!newFilters[categoryId]) {
        newFilters[categoryId] = [];
      }
      
      if (checked) {
        newFilters[categoryId] = [...newFilters[categoryId], optionId];
      } else {
        newFilters[categoryId] = newFilters[categoryId].filter(id => id !== optionId);
        
        // Remove empty categories
        if (newFilters[categoryId].length === 0) {
          delete newFilters[categoryId];
        }
      }
      
      return newFilters;
    });
  };

  const removeFilter = (categoryId: string, optionId: string) => {
    handleFilterChange(categoryId, optionId, false);
  };

  const clearAllFilters = () => {
    setActiveFilters({});
  };

  // Count total active filters
  const totalActiveFilters = Object.values(activeFilters).reduce(
    (count, options) => count + options.length, 
    0
  );

  // Get filter option label by id
  const getFilterLabel = (categoryId: string, optionId: string): string => {
    const category = filterCategories.find(c => c.id === categoryId);
    if (!category) return optionId;
    
    const option = category.options.find(o => o.id === optionId);
    return option ? option.label : optionId;
  };

  return (
    <div className={cn('w-full space-y-2', className)}>
      <form onSubmit={handleSubmit} className="flex w-full gap-2">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
        
        {filterCategories.length > 0 && (
          <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                className="gap-2"
                type="button"
              >
                <Filter className="h-4 w-4" />
                <span>Filters</span>
                {totalActiveFilters > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 rounded-full">
                    {totalActiveFilters}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Filters</h4>
                  {totalActiveFilters > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={clearAllFilters}
                      className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                    >
                      Clear all
                    </Button>
                  )}
                </div>
              </div>
              <div className="p-4 max-h-[300px] overflow-auto">
                {filterCategories.map((category) => (
                  <div key={category.id} className="mb-4 last:mb-0">
                    <h5 className="text-sm font-medium mb-2">{category.name}</h5>
                    <div className="space-y-2">
                      {category.options.map((option) => {
                        const isChecked = activeFilters[category.id]?.includes(option.id) || false;
                        return (
                          <div key={option.id} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`${category.id}-${option.id}`} 
                              checked={isChecked}
                              onCheckedChange={(checked) => 
                                handleFilterChange(category.id, option.id, checked === true)
                              }
                            />
                            <Label 
                              htmlFor={`${category.id}-${option.id}`}
                              className="text-sm font-normal cursor-pointer"
                            >
                              {option.label}
                            </Label>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t">
                <Button 
                  className="w-full"
                  onClick={() => setIsFilterOpen(false)}
                >
                  Apply Filters
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        )}
        
        <Button type="submit">
          Search
        </Button>
      </form>
      
      {/* Active filters display */}
      {totalActiveFilters > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {Object.entries(activeFilters).map(([categoryId, optionIds]) => 
            optionIds.map(optionId => (
              <Badge 
                key={`${categoryId}-${optionId}`} 
                variant="secondary"
                className="pl-2 pr-1 py-1 flex items-center gap-1 text-xs"
              >
                {getFilterLabel(categoryId, optionId)}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFilter(categoryId, optionId)}
                  className="h-4 w-4 p-0 rounded-full hover:bg-muted"
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove filter</span>
                </Button>
              </Badge>
            ))
          )}
          
          {totalActiveFilters > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="h-6 text-xs hover:bg-muted"
            >
              Clear all
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
