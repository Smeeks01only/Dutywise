import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Loader2, Plus, Edit2, Trash2, Search, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent } from '../../components/ui/card';

export const AdminProducts = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: products, isLoading, error } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const token = localStorage.getItem('access_token');
      const response = await axios.get('http://localhost:8000/api/admin/products/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    }
  });

  const updateProduct = useMutation({
    mutationFn: async (updatedProduct: any) => {
      const token = localStorage.getItem('access_token');
      const response = await axios.patch(
        `http://localhost:8000/api/admin/products/${updatedProduct.id}/`, 
        { name: updatedProduct.name },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      setIsEditing(null);
      toast.success('Product updated successfully');
    },
    onError: () => {
      toast.error('Failed to update product');
    }
  });

  if (isLoading) {
    return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" size={32} /></div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">Error loading products.</div>;
  }

  const productsList = Array.isArray(products) ? products : products?.results || [];
  
  const filteredProducts = productsList.filter((p: any) => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.hs_code_str && p.hs_code_str.includes(searchTerm))
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 ">Products</h1>
          <p className="text-slate-500">Manage customs reference products</p>
        </div>
        <div className="flex gap-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input 
              type="text" 
              placeholder="Search products..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button className="flex items-center gap-2">
            <Plus size={18} />
            Add Product
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 ">
                <tr>
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">Category</th>
                  <th className="px-6 py-4 font-medium">HS Code</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 ">
                {filteredProducts.map((product: any) => (
                  <tr key={product.id} className="hover:bg-slate-50 :bg-slate-900/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 ">
                      {isEditing?.id === product.id ? (
                        <div className="flex items-center gap-2">
                          <Input 
                            type="text" 
                            value={isEditing.name} 
                            onChange={(e) => setIsEditing({...isEditing, name: e.target.value})}
                            className="h-8 max-w-[200px]"
                          />
                          <Button 
                            size="sm"
                            onClick={() => updateProduct.mutate(isEditing)}
                          >
                            Save
                          </Button>
                          <Button 
                            size="sm"
                            variant="outline"
                            onClick={() => setIsEditing(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        product.name
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500">{product.category_name}</td>
                    <td className="px-6 py-4 text-slate-500 font-mono">{product.hs_code_str || '-'}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => setIsEditing({ id: product.id, name: product.name })}>
                          <Edit2 size={16} />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50 :bg-red-950">
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                      No products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
