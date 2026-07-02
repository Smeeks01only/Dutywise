import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { globalSearch } from '../../api/search';
import { Input } from '../ui/input';
import { addRecentSearch, getRecentSearches, type RecentSearchItem } from '../../features/search/recentSearches';

export function GlobalSearchBar() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<RecentSearchItem[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Load recent searches
  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, [isOpen]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounce input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: results, isLoading } = useQuery({
    queryKey: ['globalSearch', debouncedQuery],
    queryFn: () => globalSearch(debouncedQuery),
    enabled: debouncedQuery.length > 1,
  });

  const handleSearchSubmit = (e: React.FormEvent | string) => {
    if (typeof e !== 'string') e.preventDefault();
    const finalQuery = typeof e === 'string' ? e : query;
    if (!finalQuery.trim()) return;
    
    addRecentSearch(finalQuery);
    setIsOpen(false);
    navigate(`/search?q=${encodeURIComponent(finalQuery)}`);
  };

  const handleSelectProduct = (id: string) => {
    addRecentSearch(query);
    setIsOpen(false);
    navigate(`/product/${id}`);
  };

  const handleSelectHSCode = (id: string) => {
    addRecentSearch(query);
    setIsOpen(false);
    navigate(`/hs-code/${id}`);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md mx-auto">
      <form onSubmit={handleSearchSubmit} className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="h-4 w-4 text-slate-400" />
        </div>
        <Input
          type="text"
          className="pl-10 pr-4 py-2 w-full bg-slate-100/50 border-transparent focus:bg-white focus:border-primary/50 focus:ring-primary/20 dark:bg-slate-800 dark:focus:bg-slate-900 transition-all duration-300"
          placeholder="Search products, HS codes..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
        {isLoading && debouncedQuery === query && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <Loader2 className="h-4 w-4 text-slate-400 animate-spin" />
          </div>
        )}
      </form>

      {isOpen && (query.length > 0 || recentSearches.length > 0) && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="max-h-[70vh] overflow-y-auto overscroll-contain">
            
            {!query && recentSearches.length > 0 && (
              <div className="p-2">
                <h3 className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Recent Searches</h3>
                <ul>
                  {recentSearches.map((item, i) => (
                    <li key={i}>
                      <button
                        onClick={() => handleSearchSubmit(item.query)}
                        className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md flex items-center gap-2"
                      >
                        <Search className="h-3 w-3 text-slate-400" />
                        {item.query}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {query.length > 1 && !isLoading && results && (
              <div className="p-2 space-y-4">
                {results.products?.length > 0 && (
                  <div>
                    <h3 className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Products</h3>
                    <ul>
                      {results.products.map((p) => (
                        <li key={p.id}>
                          <button
                            onClick={() => handleSelectProduct(p.id)}
                            className="w-full text-left px-3 py-2 text-sm text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md flex flex-col"
                          >
                            <span className="font-medium">{p.name}</span>
                            <span className="text-xs text-slate-500">{p.category_name} &middot; {p.hs_code_str}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {results.hs_codes?.length > 0 && (
                  <div>
                    <h3 className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">HS Codes</h3>
                    <ul>
                      {results.hs_codes.map((h) => (
                        <li key={h.id}>
                          <button
                            onClick={() => handleSelectHSCode(h.id)}
                            className="w-full text-left px-3 py-2 text-sm text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md flex flex-col"
                          >
                            <span className="font-medium">{h.code}</span>
                            <span className="text-xs text-slate-500 line-clamp-1">{h.description}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {results.products?.length === 0 && results.hs_codes?.length === 0 && (
                  <div className="p-4 text-center text-sm text-slate-500">
                    No results found for "{query}"
                  </div>
                )}

                {(results.products?.length > 0 || results.hs_codes?.length > 0) && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => handleSearchSubmit(query)}
                      className="w-full text-center px-3 py-2 text-sm text-primary hover:bg-primary/5 rounded-md font-medium"
                    >
                      View all results
                    </button>
                  </div>
                )}
              </div>
            )}
            
          </div>
        </div>
      )}
    </div>
  );
}
