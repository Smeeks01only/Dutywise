import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Loader2, Plus, Edit2, Trash2, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent } from '../../components/ui/card';

export const AdminRestrictions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newItem, setNewItem] = useState({ restriction_type: 'Restricted', description: '', hs_code: '', government_agency: '', license_required: false, permit_required: false });
  const queryClient = useQueryClient();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

  const { data: restrictions, isLoading, error } = useQuery({
    queryKey: ['admin-restrictions'],
    queryFn: async () => {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_URL}/admin/restrictions/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    }
  });

  const { data: hscodes } = useQuery({
    queryKey: ['admin-hscodes'],
    queryFn: async () => {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_URL}/admin/hscodes/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data?.results || response.data || [];
    }
  });

  const { data: agencies } = useQuery({
    queryKey: ['admin-agencies'],
    queryFn: async () => {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_URL}/admin/agencies/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data?.results || response.data || [];
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const token = localStorage.getItem('access_token');
      const payload = { ...data };
      if (!payload.hs_code) delete payload.hs_code;
      if (!payload.government_agency) delete payload.government_agency;

      const response = await axios.post(`${API_URL}/admin/restrictions/`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-restrictions'] });
      setIsCreating(false);
      setNewItem({ restriction_type: 'Restricted', description: '', hs_code: '', government_agency: '', license_required: false, permit_required: false });
      toast.success('Restriction created successfully');
    },
    onError: () => toast.error('Failed to create restriction')
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const token = localStorage.getItem('access_token');
      const payload = { ...data };
      if (!payload.hs_code) payload.hs_code = null;
      if (!payload.government_agency) payload.government_agency = null;

      const response = await axios.patch(
        `${API_URL}/admin/restrictions/${data.id}/`, 
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-restrictions'] });
      setIsEditing(null);
      toast.success('Restriction updated successfully');
    },
    onError: () => toast.error('Failed to update restriction')
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem('access_token');
      await axios.delete(`${API_URL}/admin/restrictions/${id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-restrictions'] });
      toast.success('Restriction deleted successfully');
    },
    onError: () => toast.error('Failed to delete restriction')
  });

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" size={32} /></div>;
  if (error) return <div className="text-red-500 p-4">Error loading import restrictions.</div>;

  const itemsList = Array.isArray(restrictions) ? restrictions : restrictions?.results || [];
  const filteredItems = itemsList.filter((t: any) => 
    (t.description && t.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (t.hs_code_str && t.hs_code_str.includes(searchTerm))
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Import Restrictions</h1>
          <p className="text-slate-500">Manage prohibited and restricted goods</p>
        </div>
        <div className="flex gap-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input 
              type="text" placeholder="Search restrictions..." 
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={() => setIsCreating(true)} className="flex items-center gap-2">
            <Plus size={18} /> Add Restriction
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <tr>
                  <th className="px-6 py-4 font-medium">Type</th>
                  <th className="px-6 py-4 font-medium">Description</th>
                  <th className="px-6 py-4 font-medium">HS Code</th>
                  <th className="px-6 py-4 font-medium">Agency</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {isCreating && (
                  <tr className="bg-blue-50/50">
                    <td className="px-4 py-4">
                      <select className="border rounded p-1 w-full" value={newItem.restriction_type} onChange={e => setNewItem({...newItem, restriction_type: e.target.value})}>
                        <option>Prohibited</option>
                        <option>Restricted</option>
                        <option>Regulated</option>
                      </select>
                    </td>
                    <td className="px-4 py-4">
                      <Input value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} placeholder="Description" />
                    </td>
                    <td className="px-4 py-4">
                      <select className="border rounded p-1 w-full" value={newItem.hs_code} onChange={e => setNewItem({...newItem, hs_code: e.target.value})}>
                        <option value="">-- All / General --</option>
                        {hscodes?.map((h: any) => <option key={h.id} value={h.id}>{h.code}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-4">
                      <select className="border rounded p-1 w-full" value={newItem.government_agency} onChange={e => setNewItem({...newItem, government_agency: e.target.value})}>
                        <option value="">-- None --</option>
                        {agencies?.map((a: any) => <option key={a.id} value={a.id}>{a.name}</option>)}
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
                        <select className="border rounded p-1" value={isEditing.restriction_type} onChange={e => setIsEditing({...isEditing, restriction_type: e.target.value})}>
                          <option>Prohibited</option>
                          <option>Restricted</option>
                          <option>Regulated</option>
                        </select>
                      ) : (
                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                          item.restriction_type === 'Prohibited' ? 'bg-red-100 text-red-700' : 
                          item.restriction_type === 'Restricted' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {item.restriction_type}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {isEditing?.id === item.id ? (
                        <Input value={isEditing.description} onChange={e => setIsEditing({...isEditing, description: e.target.value})} />
                      ) : item.description}
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-mono">
                      {isEditing?.id === item.id ? (
                        <select className="border rounded p-1 max-w-[150px]" value={isEditing.hs_code || ''} onChange={e => setIsEditing({...isEditing, hs_code: e.target.value})}>
                          <option value="">-- All --</option>
                          {hscodes?.map((h: any) => <option key={h.id} value={h.id}>{h.code}</option>)}
                        </select>
                      ) : (item.hs_code_str || 'General')}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {isEditing?.id === item.id ? (
                        <select className="border rounded p-1 max-w-[150px]" value={isEditing.government_agency || ''} onChange={e => setIsEditing({...isEditing, government_agency: e.target.value})}>
                          <option value="">-- None --</option>
                          {agencies?.map((a: any) => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                      ) : (item.agency_name || '-')}
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
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No restrictions found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
