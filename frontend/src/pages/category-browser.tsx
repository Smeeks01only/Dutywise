import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getCategories, getProducts } from '../api/search';
import { FolderTree, Package, ArrowRight, ChevronRight, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

export function CategoryBrowserPage() {
  const [searchParams] = useSearchParams();
  const selectedCategoryId = searchParams.get('id');
  const navigate = useNavigate();

  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => getCategories(),
  });

  const { data: categoryProducts, isLoading: productsLoading } = useQuery({
    queryKey: ['categoryProducts', selectedCategoryId],
    queryFn: () => getProducts({ category: selectedCategoryId }),
    enabled: !!selectedCategoryId,
  });

  const categories = categoriesData?.results || categoriesData || [];
  const products = categoryProducts?.results || categoryProducts || [];

  const selectedCategory = categories.find((c: any) => c.id === selectedCategoryId);
  const rootCategories = categories.filter((c: any) => !c.parent_category);
  const subCategories = selectedCategoryId ? categories.filter((c: any) => c.parent_category === selectedCategoryId) : [];

  if (categoriesLoading) return <div className="p-12 flex justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
          <FolderTree className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Category Browser</h1>
          <p className="text-slate-500">Explore products by category to find correct HS Codes</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Category Tree Sidebar */}
        <div className="w-full md:w-80 shrink-0">
          <Card className="shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-base font-semibold">All Categories</CardTitle>
            </CardHeader>
            <CardContent className="p-2 h-[calc(100vh-250px)] overflow-y-auto">
              <ul className="space-y-1 py-2">
                <li>
                  <button
                    onClick={() => navigate('/categories')}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${!selectedCategoryId ? 'bg-primary/10 text-primary' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                  >
                    All Categories Overview
                  </button>
                </li>
                {rootCategories.map((cat: any) => (
                  <li key={cat.id}>
                    <button
                      onClick={() => navigate(`/categories?id=${cat.id}`)}
                      className={`w-full flex items-center justify-between text-left px-3 py-2 rounded-md text-sm transition-colors ${selectedCategoryId === cat.id ? 'bg-primary text-primary-foreground font-medium shadow-sm' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                    >
                      <span className="truncate pr-2">{cat.name}</span>
                      <ChevronRight className={`h-4 w-4 shrink-0 ${selectedCategoryId === cat.id ? 'opacity-100' : 'opacity-50'}`} />
                    </button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 space-y-6">
          {!selectedCategoryId ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {rootCategories.map((cat: any) => (
                <button
                  key={cat.id}
                  onClick={() => navigate(`/categories?id=${cat.id}`)}
                  className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 text-left hover:border-primary hover:shadow-md transition-all h-full flex flex-col"
                >
                  <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                    <FolderTree className="h-5 w-5 text-slate-600 dark:text-slate-400 group-hover:text-primary transition-colors" />
                  </div>
                  <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-2">{cat.name}</h3>
                  <p className="text-sm text-slate-500 line-clamp-2 mt-auto">
                    {cat.description || "Browse products in this category"}
                  </p>
                </button>
              ))}
            </div>
          ) : (
            <>
              {selectedCategory && (
                <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
                  <h2 className="text-2xl font-bold mb-2">{selectedCategory.name}</h2>
                  {selectedCategory.description && (
                    <p className="text-slate-600 dark:text-slate-400">{selectedCategory.description}</p>
                  )}
                </div>
              )}

              {subCategories.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Subcategories</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {subCategories.map((sub: any) => (
                      <button
                        key={sub.id}
                        onClick={() => navigate(`/categories?id=${sub.id}`)}
                        className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-primary transition-colors text-left group"
                      >
                        <span className="font-medium group-hover:text-primary">{sub.name}</span>
                        <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-primary transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" /> Products in this Category
                </h3>
                
                {productsLoading ? (
                  <div className="py-8 flex justify-center"><Loader2 className="animate-spin h-6 w-6 text-slate-400" /></div>
                ) : products.length === 0 ? (
                  <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                    <Package className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">No products found</p>
                    <p className="text-sm text-slate-400 mt-1">This category doesn't have any products directly assigned to it.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map((p: any) => (
                      <button
                        key={p.id}
                        onClick={() => navigate(`/product/${p.id}`)}
                        className="group flex flex-col p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-primary hover:shadow-md transition-all text-left h-full"
                      >
                        <h4 className="font-medium text-slate-900 dark:text-white mb-1 group-hover:text-primary line-clamp-1">{p.name}</h4>
                        <p className="text-xs font-mono text-slate-500 mb-2">HS: {p.hs_code_str}</p>
                        {p.description && (
                          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mt-auto">
                            {p.description}
                          </p>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
