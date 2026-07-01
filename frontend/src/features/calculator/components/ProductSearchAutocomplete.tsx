import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { searchHSCodes, searchProducts } from '../../../api/calculator';
import { Input } from '../../../components/ui/input';

interface ProductSearchProps {
  onSelectProduct: (product: any) => void;
  onSelectHSCode: (hsCode: any) => void;
  error?: string;
}

export const ProductSearchAutocomplete: React.FC<ProductSearchProps> = ({ onSelectProduct, onSelectHSCode, error }) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 400);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: hsCodes = [], isLoading: isLoadingHS } = useQuery({
    queryKey: ['search-hs', debouncedQuery],
    queryFn: () => searchHSCodes(debouncedQuery),
    enabled: debouncedQuery.length > 2,
  });

  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ['search-products', debouncedQuery],
    queryFn: () => searchProducts(debouncedQuery),
    enabled: debouncedQuery.length > 2,
  });

  const isLoading = isLoadingHS || isLoadingProducts;
  const hasResults = hsCodes.length > 0 || products.length > 0;

  const handleSelect = (item: any, type: 'product' | 'hs') => {
    setQuery(item.name || `${item.code} - ${item.description}`);
    setIsOpen(false);
    if (type === 'product') {
      onSelectProduct(item);
    } else {
      onSelectHSCode(item);
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search by product name or HS Code..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className={`pl-9 ${error ? 'border-red-500' : ''}`}
        />
      </div>
      
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}

      {isOpen && debouncedQuery.length > 2 && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md shadow-lg max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-slate-500">Searching...</div>
          ) : !hasResults ? (
            <div className="p-4 text-center text-sm text-slate-500">No results found for "{debouncedQuery}"</div>
          ) : (
            <div className="py-2">
              {products.length > 0 && (
                <div>
                  <div className="px-3 py-1 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50 dark:bg-slate-800/50">
                    Products
                  </div>
                  {products.map((p: any) => (
                    <div 
                      key={p.id} 
                      className="px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer text-sm"
                      onClick={() => handleSelect(p, 'product')}
                    >
                      <div className="font-medium">{p.name}</div>
                      <div className="text-xs text-slate-500">HS Code: {p.hs_code?.code} | Category: {p.category?.name}</div>
                    </div>
                  ))}
                </div>
              )}
              
              {hsCodes.length > 0 && (
                <div>
                  <div className="px-3 py-1 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50 dark:bg-slate-800/50">
                    HS Codes
                  </div>
                  {hsCodes.map((hs: any) => (
                    <div 
                      key={hs.id} 
                      className="px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer text-sm"
                      onClick={() => handleSelect(hs, 'hs')}
                    >
                      <div className="font-medium">{hs.code}</div>
                      <div className="text-xs text-slate-500 line-clamp-1">{hs.description}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
