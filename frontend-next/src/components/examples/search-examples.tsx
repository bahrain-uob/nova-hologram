"use client";

import React from 'react';
import { SearchBar } from '@/components/ui/search-bar';
import { AdvancedSearch } from '@/components/ui/advanced-search';

export const SearchExamples = () => {
  // Basic search handler
  const handleBasicSearch = (query: string) => {
    console.log('Basic search for:', query);
    // Implement your search logic here
  };

  // Advanced search handler
  const handleAdvancedSearch = (query: string, filters: Record<string, string[]>) => {
    console.log('Advanced search for:', query, 'with filters:', filters);
    // Implement your search logic with filters here
  };

  // Example filter categories for books
  const bookFilterCategories = [
    {
      id: 'genre',
      name: 'Genre',
      options: [
        { id: 'fiction', label: 'Fiction' },
        { id: 'non-fiction', label: 'Non-Fiction' },
        { id: 'mystery', label: 'Mystery' },
        { id: 'sci-fi', label: 'Science Fiction' },
        { id: 'fantasy', label: 'Fantasy' },
      ],
    },
    {
      id: 'language',
      name: 'Language',
      options: [
        { id: 'english', label: 'English' },
        { id: 'arabic', label: 'Arabic' },
        { id: 'french', label: 'French' },
      ],
    },
    {
      id: 'availability',
      name: 'Availability',
      options: [
        { id: 'available', label: 'Available' },
        { id: 'borrowed', label: 'Borrowed' },
      ],
    },
  ];

  return (
    <div className="space-y-8 p-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Basic Search Bar</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Default</h3>
            <SearchBar onSearch={handleBasicSearch} />
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-2">With Button</h3>
            <SearchBar 
              onSearch={handleBasicSearch} 
              showButton={true} 
              placeholder="Search books..."
            />
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-2">Pill Variant</h3>
            <SearchBar 
              onSearch={handleBasicSearch} 
              variant="pill" 
              placeholder="Search authors..."
            />
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-2">Large Size with Button</h3>
            <SearchBar 
              onSearch={handleBasicSearch} 
              size="lg" 
              showButton={true} 
              placeholder="Find your next read..."
            />
          </div>
        </div>
      </div>
      
      <div>
        <h2 className="text-xl font-semibold mb-4">Advanced Search with Filters</h2>
        <AdvancedSearch 
          onSearch={handleAdvancedSearch} 
          placeholder="Search the library catalog..."
          filterCategories={bookFilterCategories}
        />
      </div>
    </div>
  );
};
