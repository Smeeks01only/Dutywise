import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Loader2, Plus, Edit2, Trash2, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent } from '../../components/ui/card';

export const AdminAgencies = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', description: '', acronym: '', website: '', email: '', phone: '' });
  const queryClient = useQueryClient();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

  const { data: agencies, isLoading, error } = useQuery({
    queryKey: ['admin-agencies'],
    queryFn: async () => {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_URL}/admin/agencies/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const token = localStorage.getItem('access_token');
      const response = await axios.post(`${API_URL}/admin/agencies/`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-agencies'] });
      setIsCreating(false);
      setNewItem({ name: '', description: '', acronym: '', website: '', email: '', phone: '' });
      toast.success('Agency created successfully');
    },
    onError: () => toast.error('Failed to create agency')
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const token = localStorage.getItem('access_token');
      const response = await axios.patch(
        `${API_URL}/admin/agencies/${data.id}/`, 
        { 
          name: data.name, description: data.description, acronym: data.acronym,
          website: data.website, email: data.email, phone: data.phone 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-agencies'] });
      setIsEditing(null);
      toast.success('Agency updated successfully');
    },
    onError: () => toast.error('Failed to update agency')
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem('access_token');
      await axios.delete(`${API_URL}/admin/agencies/${id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-agencies'] });
      toast.success('Agency deleted successfully');
    },
    onError: () => toast.error('Failed to delete agency')
  });

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" size={32} /></div>;
  if (error) return <div className="text-red-500 p-4">Error loading agencies.</div>;

  const itemsList = Array.isArray(agencies) ? agencies : agencies?.results || [];
  const filteredItems = itemsList.filter((a: any) => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (a.acronym && a.acronym.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Government Agencies</h1>
          <p className="text-slate-500">Manage regulatory authorities</p>
        </div>
        <div className="flex gap-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input 
              type="text" placeholder="Search agencies..." 
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={() => setIsCreating(true)} className="flex items-center gap-2">
            <Plus size={18} /> Add Agency
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
                  <th className="px-6 py-4 font-medium">Acronym</th>
                  <th className="px-6 py-4 font-medium">Contact</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {isCreating && (
                  <tr className="bg-blue-50/50">
                    <td className="px-6 py-4">
                      <Input value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} placeholder="Agency Name" className="mb-2" />
                      <Input value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} placeholder="Description" />
                    </td>
                    <td className="px-6 py-4">
                      <Input value={newItem.acronym} onChange={e => setNewItem({...newItem, acronym: e.target.value})} placeholder="Acronym" />
                    </td>
                    <td className="px-6 py-4 space-y-2">
                      <Input value={newItem.email} onChange={e => setNewItem({...newItem, email: e.target.value})} placeholder="Email" />
                      <Input value={newItem.phone} onChange={e => setNewItem({...newItem, phone: e.target.value})} placeholder="Phone" />
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
                        <>
                          <Input value={isEditing.name} onChange={e => setIsEditing({...isEditing, name: e.target.value})} className="mb-2" />
                          <Input value={isEditing.description} onChange={e => setIsEditing({...isEditing, description: e.target.value})} />
                        </>
                      ) : (
                        <div>
                          <div>{item.name}</div>
                          <div className="text-xs text-slate-500 font-normal mt-1 line-clamp-1">{item.description}</div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {isEditing?.id === item.id ? (
                        <Input value={isEditing.acronym || ''} onChange={e => setIsEditing({...isEditing, acronym: e.target.value})} />
                      ) : (item.acronym || '-')}
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {isEditing?.id === item.id ? (
                        <>
                          <Input value={isEditing.email || ''} onChange={e => setIsEditing({...isEditing, email: e.target.value})} className="mb-2" />
                          <Input value={isEditing.phone || ''} onChange={e => setIsEditing({...isEditing, phone: e.target.value})} />
                        </>
                      ) : (
                        <div>
                          <div>{item.email || 'No email'}</div>
                          <div>{item.phone || 'No phone'}</div>
                        </div>
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
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">No agencies found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
