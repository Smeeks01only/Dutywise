import { useState, useRef, useEffect } from 'react';
import type { KeyboardEvent } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { useProductSearch } from '../../hooks/useProductSearch';
import type { SearchResult } from '../../hooks/useProductSearch';

interface ProductSearchInputProps {
  label: string;
  error?: string;
  value: string; // The display value (e.g. product name or query)
  onSelectProduct: (hsCode: string, productName: string) => void;
  onClear: () => void;
  className?: string;
}

export function ProductSearchInput({ label, error, value, onSelectProduct, onClear, className = '' }: ProductSearchInputProps) {
  const [query, setQuery] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { data: results, isLoading, isError } = useProductSearch(query);

  // Sync internal query with external value if external value changes (e.g. cleared)
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Handle clicking outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setIsOpen(true);
    setActiveIndex(-1);
    if (!val.trim()) {
      onClear();
    }
  };

  const handleSelect = (result: SearchResult) => {
    setQuery(result.name);
    setIsOpen(false);
    setActiveIndex(-1);
    onSelectProduct(result.code, result.name);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || !results) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < results.length) {
          handleSelect(results[activeIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
    }
  };

  return (
    <div className={`flex flex-col gap-1.5 relative ${className}`} ref={dropdownRef}>
      <label className="text-sm font-medium text-neutral-600">
        {label}
      </label>
      
      <div className="relative flex items-center">
        <div className="absolute left-1.5 h-9 w-9 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 pointer-events-none">
          <Search className="h-4 w-4" />
        </div>
        <input
          type="text"
          placeholder="Search products or HS codes..."
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (query.trim()) setIsOpen(true); }}
          className={`
            w-full rounded-xl border bg-white pl-14 pr-3 py-2.5 text-sm text-neutral-900 shadow-sm
            transition-all duration-200 focus:outline-none focus:ring-4
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-neutral-300 focus:border-primary-500 focus:ring-primary-500/20 hover:border-neutral-400'}
          `}
          autoComplete="off"
        />
        {isLoading && query.trim() && (
          <Loader2 className="absolute right-3 h-4 w-4 text-neutral-400 animate-spin" />
        )}
      </div>

      {error && <span className="text-sm text-red-500">{error}</span>}

      {/* Dropdown */}
      {isOpen && query.trim() && !isLoading && (
        <div className="absolute top-[calc(100%+4px)] left-0 right-0 z-50 max-h-64 overflow-y-auto rounded-lg border border-neutral-200 bg-white py-1 shadow-lg">
          {isError ? (
            <div className="px-4 py-3 text-sm text-red-500">Failed to load results.</div>
          ) : results && results.length > 0 ? (
            <ul role="listbox">
              {results.map((result, idx) => (
                <li
                  key={result.code}
                  role="option"
                  aria-selected={activeIndex === idx}
                  onClick={() => handleSelect(result)}
                  onMouseEnter={() => setActiveIndex(idx)}
                  className={`
                    flex flex-col cursor-pointer px-4 py-2 transition-colors
                    ${activeIndex === idx ? 'bg-primary-50' : 'hover:bg-neutral-50'}
                  `}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-medium text-neutral-900 text-sm truncate pr-2">
                      {result.name}
                    </span>
                    <span className="font-mono text-xs text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded shrink-0">
                      {result.code}
                    </span>
                  </div>
                  <span className="text-xs text-neutral-500 mt-0.5">
                    {result.category_name}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-3 text-sm text-neutral-500">No products found for "{query}".</div>
          )}
        </div>
      )}
    </div>
  );
}
