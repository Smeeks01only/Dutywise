import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Package, FileText, FolderTree } from 'lucide-react';
import { globalSearch } from '../api/search';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const [query, setQuery] = useState(q);
  const [activeTab, setActiveTab] = useState<'all' | 'products' | 'hscodes' | 'categories'>('all');

  const { data: results, isLoading } = useQuery({
    queryKey: ['globalSearch', q],
    queryFn: () => globalSearch(q),
    enabled: !!q,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query.trim() });
    }
  };

  const getFilteredResults = () => {
    if (!results) return { products: [], hs_codes: [], categories: [] };
    if (activeTab === 'all') return results;
    return {
      products: activeTab === 'products' ? results.products : [],
      hs_codes: activeTab === 'hscodes' ? results.hs_codes : [],
      categories: activeTab === 'categories' ? results.categories : [],
    };
  };

  const filtered = getFilteredResults();
  const totalResults = (filtered.products?.length || 0) + (filtered.hs_codes?.length || 0) + (filtered.categories?.length || 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Search Results</h1>
      
      <form onSubmit={handleSearch} className="relative max-w-2xl mb-8">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="h-5 w-5 text-slate-400" />
        </div>
        <Input
          type="text"
          className="pl-10 pr-24 py-3 w-full text-lg shadow-sm"
          placeholder="Search for products or HS codes..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button type="submit" className="absolute right-1.5 top-1.5 bottom-1.5 h-auto">
          Search
        </Button>
      </form>

      {!q ? (
        <div className="text-center py-12 text-slate-500">
          <Search className="h-12 w-12 mx-auto mb-4 text-slate-300" />
          <p>Enter a search term to find products, HS codes, or categories.</p>
        </div>
      ) : isLoading ? (
        <div className="text-center py-12 text-slate-500">
          <p>Loading results for "{q}"...</p>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-8">
          
          <div className="w-full md:w-64 shrink-0">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Filters</h3>
            <div className="space-y-1">
              <button 
                onClick={() => setActiveTab('all')}
                className={`w-full text-left px-3 py-2 rounded-md text-sm ${activeTab === 'all' ? 'bg-primary text-primary-foreground' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                All Results ({(results?.products?.length || 0) + (results?.hs_codes?.length || 0) + (results?.categories?.length || 0)})
              </button>
              <button 
                onClick={() => setActiveTab('products')}
                className={`w-full text-left px-3 py-2 rounded-md text-sm ${activeTab === 'products' ? 'bg-primary text-primary-foreground' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                <Package className="h-4 w-4 inline-block mr-2" />
                Products ({results?.products?.length || 0})
              </button>
              <button 
                onClick={() => setActiveTab('hscodes')}
                className={`w-full text-left px-3 py-2 rounded-md text-sm ${activeTab === 'hscodes' ? 'bg-primary text-primary-foreground' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                <FileText className="h-4 w-4 inline-block mr-2" />
                HS Codes ({results?.hs_codes?.length || 0})
              </button>
              <button 
                onClick={() => setActiveTab('categories')}
                className={`w-full text-left px-3 py-2 rounded-md text-sm ${activeTab === 'categories' ? 'bg-primary text-primary-foreground' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                <FolderTree className="h-4 w-4 inline-block mr-2" />
                Categories ({results?.categories?.length || 0})
              </button>
            </div>
          </div>

          <div className="flex-1">
            {totalResults === 0 ? (
              <div className="text-center py-12 text-slate-500 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                <p>No results found for "{q}".</p>
                <p className="text-sm mt-2">Try checking your spelling or using different keywords.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {filtered.products?.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                      <Package className="mr-2" /> Products
                    </h2>
                    <div className="grid gap-4">
                      {filtered.products.map(p => (
                        <Card key={p.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                              <h3 className="font-bold text-lg text-primary">
                                <Link to={`/product/${p.id}`} className="hover:underline">{p.name}</Link>
                              </h3>
                              <p className="text-sm text-slate-500 mb-1">{p.category_name} &middot; HS: {p.hs_code_str}</p>
                              {p.description && <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{p.description}</p>}
                            </div>
                            <Link to={`/product/${p.id}`}>
                              <Button variant="outline" size="sm">View Details</Button>
                            </Link>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {filtered.hs_codes?.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                      <FileText className="mr-2" /> HS Codes
                    </h2>
                    <div className="grid gap-4">
                      {filtered.hs_codes.map(h => (
                        <Card key={h.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                              <h3 className="font-bold text-lg text-primary">
                                <Link to={`/hs-code/${h.id}`} className="hover:underline">{h.code}</Link>
                              </h3>
                              <p className="text-sm text-slate-500 mb-1">Chapter {h.chapter} &middot; Heading {h.heading}</p>
                              <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{h.description}</p>
                            </div>
                            <Link to={`/hs-code/${h.id}`}>
                              <Button variant="outline" size="sm">View Rules</Button>
                            </Link>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {filtered.categories?.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                      <FolderTree className="mr-2" /> Categories
                    </h2>
                    <div className="grid gap-4">
                      {filtered.categories.map(c => (
                        <Card key={c.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                              <h3 className="font-bold text-lg text-primary">
                                <Link to={`/categories?id=${c.id}`} className="hover:underline">{c.name}</Link>
                              </h3>
                              {c.description && <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{c.description}</p>}
                            </div>
                            <Link to={`/categories?id=${c.id}`}>
                              <Button variant="outline" size="sm">Browse</Button>
                            </Link>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
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
