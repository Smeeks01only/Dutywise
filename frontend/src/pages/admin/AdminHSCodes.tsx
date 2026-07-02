import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Loader2, Plus, Edit2, Trash2, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent } from '../../components/ui/card';

export const AdminHSCodes = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: hscodes, isLoading, error } = useQuery({
    queryKey: ['admin-hscodes'],
    queryFn: async () => {
      const token = localStorage.getItem('access_token');
      const response = await axios.get('http://localhost:8000/api/admin/hscodes/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    }
  });

  const updateHSCode = useMutation({
    mutationFn: async (updatedHSCode: any) => {
      const token = localStorage.getItem('access_token');
      const response = await axios.patch(
        `http://localhost:8000/api/admin/hscodes/${updatedHSCode.id}/`, 
        { description: updatedHSCode.description },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-hscodes'] });
      setIsEditing(null);
      toast.success('HS Code updated successfully');
    },
    onError: () => {
      toast.error('Failed to update HS Code');
    }
  });

  if (isLoading) {
    return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" size={32} /></div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">Error loading HS Codes.</div>;
  }

  const hscodesList = Array.isArray(hscodes) ? hscodes : hscodes?.results || [];
  
  const filteredHSCodes = hscodesList.filter((h: any) => 
    (h.code && h.code.includes(searchTerm)) || 
    (h.description && h.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">HS Codes</h1>
          <p className="text-slate-500">Manage Harmonized System Codes</p>
        </div>
        <div className="flex gap-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input 
              type="text" 
              placeholder="Search HS Codes..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button className="flex items-center gap-2">
            <Plus size={18} />
            Add HS Code
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <tr>
                  <th className="px-6 py-4 font-medium">HS Code</th>
                  <th className="px-6 py-4 font-medium">Description</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredHSCodes.map((hscode: any) => (
                  <tr key={hscode.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 font-mono">
                      {hscode.code}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {isEditing?.id === hscode.id ? (
                        <div className="flex items-center gap-2">
                          <Input 
                            type="text" 
                            value={isEditing.description} 
                            onChange={(e) => setIsEditing({...isEditing, description: e.target.value})}
                            className="h-8 min-w-[300px]"
                          />
                          <Button 
                            size="sm"
                            onClick={() => updateHSCode.mutate(isEditing)}
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
                        hscode.description
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => setIsEditing({ id: hscode.id, description: hscode.description })}>
                          <Edit2 size={16} />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredHSCodes.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-slate-500">
                      No HS Codes found.
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
