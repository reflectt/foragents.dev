'use client';

import { useState } from 'react';

interface LandingSearchProps {
  onSearch?: (query: string) => void;
  onFilterChange?: (filter: string) => void;
}

export default function LandingSearch({ onSearch, onFilterChange }: LandingSearchProps) {
  const [activeFilter, setActiveFilter] = useState('All');
  
  const filters = ['All', 'Official', 'Database', 'Browser', 'Files', 'APIs'];
  
  const handleFilterClick = (filter: string) => {
    setActiveFilter(filter);
    onFilterChange?.(filter);
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearch?.(e.target.value);
  };
  
  return (
    <section className="bg-gray-50 py-16 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Search Input */}
        <div className="relative mb-4">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">
            🔍
          </span>
          <input
            type="text"
            placeholder="Search MCP servers by name, category, or functionality..."
            onChange={handleSearchChange}
            className="w-full pl-12 pr-5 py-4 text-base bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all"
          />
        </div>
        
        {/* Filter Tags */}
        <div className="flex flex-wrap gap-2 justify-center">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => handleFilterClick(filter)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md border transition-all ${
                activeFilter === filter
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-blue-600 hover:text-blue-600'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
