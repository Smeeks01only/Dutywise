import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getProduct, getProducts } from '../api/search';
import { Package, ArrowLeft, Calculator, FileText } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';

export function ProductDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['product', id],
    queryFn: () => getProduct(id as string),
    enabled: !!id,
  });

  const { data: relatedProducts } = useQuery({
    queryKey: ['relatedProducts', product?.category],
    queryFn: () => getProducts({ category: product?.category }),
    enabled: !!product?.category,
  });

  if (isLoading) return <div className="p-12 text-center">Loading product...</div>;
  if (isError || !product) return <div className="p-12 text-center text-red-500">Error loading product or product not found.</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          <div className="flex items-start gap-6">
            <div className="w-32 h-32 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
              {product.image ? (
                <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded-xl" />
              ) : (
                <Package className="h-12 w-12 text-slate-400" />
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{product.name}</h1>
              <p className="text-primary font-medium mb-4">{product.category_name}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full text-sm font-medium flex items-center">
                  <FileText className="h-3 w-3 mr-1" />
                  HS Code: {product.hs_code_str}
                </span>
                {product.status === 'Active' && (
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    Active
                  </span>
                )}
              </div>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                {product.description || "No description provided for this product."}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Customs Classification</CardTitle>
              <CardDescription>How this product is classified by customs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
                  <p className="text-sm text-slate-500 mb-1">Harmonized System Code</p>
                  <Link to={`/hs-code/${product.hs_code}`} className="text-lg font-bold text-primary hover:underline">
                    {product.hs_code_str}
                  </Link>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
                  <p className="text-sm text-slate-500 mb-1">Default Country of Origin</p>
                  <p className="text-lg font-semibold">{product.default_country ? product.default_country.name : "Not specified"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="border-primary/20 shadow-md">
            <CardHeader>
              <CardTitle>Ready to calculate?</CardTitle>
              <CardDescription>Estimate duties for {product.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full" 
                size="lg" 
                onClick={() => navigate(`/calculator?product_id=${product.id}`)}
              >
                <Calculator className="mr-2 h-5 w-5" /> Calculate Import Cost
              </Button>
            </CardContent>
          </Card>

          {relatedProducts && relatedProducts.results?.length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Related Products</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {relatedProducts.results.filter((p: any) => p.id !== product.id).slice(0, 5).map((rp: any) => (
                  <Link key={rp.id} to={`/product/${rp.id}`} className="block group">
                    <div className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                      <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded flex items-center justify-center shrink-0 group-hover:bg-primary/10">
                        <Package className="h-5 w-5 text-slate-500 group-hover:text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100 group-hover:text-primary line-clamp-1">{rp.name}</p>
                        <p className="text-xs text-slate-500">{rp.hs_code_str}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
