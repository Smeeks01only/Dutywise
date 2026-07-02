import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Loader2, Plus, Edit2, Trash2, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent } from '../../components/ui/card';

export const AdminAgreements = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', description: '', active: true });
  const queryClient = useQueryClient();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

  const { data: agreements, isLoading, error } = useQuery({
    queryKey: ['admin-agreements'],
    queryFn: async () => {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_URL}/admin/agreements/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const token = localStorage.getItem('access_token');
      const response = await axios.post(`${API_URL}/admin/agreements/`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-agreements'] });
      setIsCreating(false);
      setNewItem({ name: '', description: '', active: true });
      toast.success('Agreement created successfully');
    },
    onError: () => toast.error('Failed to create agreement')
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const token = localStorage.getItem('access_token');
      const response = await axios.patch(
        `${API_URL}/admin/agreements/${data.id}/`, 
        { name: data.name, description: data.description, active: data.active },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-agreements'] });
      setIsEditing(null);
      toast.success('Agreement updated successfully');
    },
    onError: () => toast.error('Failed to update agreement')
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem('access_token');
      await axios.delete(`${API_URL}/admin/agreements/${id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-agreements'] });
      toast.success('Agreement deleted successfully');
    },
    onError: () => toast.error('Failed to delete agreement')
  });

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" size={32} /></div>;
  if (error) return <div className="text-red-500 p-4">Error loading agreements.</div>;

  const itemsList = Array.isArray(agreements) ? agreements : agreements?.results || [];
  const filteredItems = itemsList.filter((a: any) => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Trade Agreements</h1>
          <p className="text-slate-500">Manage preferential trade agreements</p>
        </div>
        <div className="flex gap-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input 
              type="text" placeholder="Search agreements..." 
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={() => setIsCreating(true)} className="flex items-center gap-2">
            <Plus size={18} /> Add Agreement
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <tr>
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">Description</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {isCreating && (
                  <tr className="bg-blue-50/50">
                    <td className="px-6 py-4">
                      <Input value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} placeholder="Agreement Name" />
                    </td>
                    <td className="px-6 py-4">
                      <Input value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} placeholder="Description" />
                    </td>
                    <td className="px-6 py-4">
                      <select className="border rounded p-1" value={newItem.active ? 'true' : 'false'} onChange={e => setNewItem({...newItem, active: e.target.value === 'true'})}>
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <Button size="sm" onClick={() => createMutation.mutate(newItem)}>Save</Button>
                      <Button size="sm" variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
                    </td>
                  </tr>
                )}
                {filteredItems.map((item: any) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {isEditing?.id === item.id ? (
                        <Input value={isEditing.name} onChange={e => setIsEditing({...isEditing, name: e.target.value})} />
                      ) : item.name}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {isEditing?.id === item.id ? (
                        <Input value={isEditing.description || ''} onChange={e => setIsEditing({...isEditing, description: e.target.value})} />
                      ) : (item.description || '-')}
                    </td>
                    <td className="px-6 py-4">
                      {isEditing?.id === item.id ? (
                        <select className="border rounded p-1" value={isEditing.active ? 'true' : 'false'} onChange={e => setIsEditing({...isEditing, active: e.target.value === 'true'})}>
                          <option value="true">Active</option>
                          <option value="false">Inactive</option>
                        </select>
                      ) : (
                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${item.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                          {item.active ? 'Active' : 'Inactive'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {isEditing?.id === item.id ? (
                        <div className="flex justify-end gap-2">
                          <Button size="sm" onClick={() => updateMutation.mutate(isEditing)}>Save</Button>
                          <Button size="sm" variant="outline" onClick={() => setIsEditing(null)}>Cancel</Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => setIsEditing({ ...item })}>
                            <Edit2 size={16} />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => {
                            if(window.confirm('Are you sure?')) deleteMutation.mutate(item.id);
                          }}>
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {!isCreating && filteredItems.length === 0 && (
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">No agreements found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
