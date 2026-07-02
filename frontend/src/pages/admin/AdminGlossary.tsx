import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Loader2, Plus, Edit2, Trash2, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent } from '../../components/ui/card';

export const AdminGlossary = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newTerm, setNewTerm] = useState({ term: '', definition: '', example: '' });
  const queryClient = useQueryClient();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

  const { data: glossary, isLoading, error } = useQuery({
    queryKey: ['admin-glossary'],
    queryFn: async () => {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_URL}/admin/glossary/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    }
  });

  const createTerm = useMutation({
    mutationFn: async (data: any) => {
      const token = localStorage.getItem('access_token');
      const response = await axios.post(`${API_URL}/admin/glossary/`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-glossary'] });
      setIsCreating(false);
      setNewTerm({ term: '', definition: '', example: '' });
      toast.success('Term created successfully');
    },
    onError: () => toast.error('Failed to create term')
  });

  const updateTerm = useMutation({
    mutationFn: async (data: any) => {
      const token = localStorage.getItem('access_token');
      const response = await axios.patch(
        `${API_URL}/admin/glossary/${data.id}/`, 
        { term: data.term, definition: data.definition, example: data.example },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-glossary'] });
      setIsEditing(null);
      toast.success('Term updated successfully');
    },
    onError: () => toast.error('Failed to update term')
  });

  const deleteTerm = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem('access_token');
      await axios.delete(`${API_URL}/admin/glossary/${id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-glossary'] });
      toast.success('Term deleted successfully');
    },
    onError: () => toast.error('Failed to delete term')
  });

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" size={32} /></div>;
  if (error) return <div className="text-red-500 p-4">Error loading glossary terms.</div>;

  const termsList = Array.isArray(glossary) ? glossary : glossary?.results || [];
  const filteredTerms = termsList.filter((t: any) => 
    t.term.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.definition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Customs Glossary</h1>
          <p className="text-slate-500">Manage terms and definitions</p>
        </div>
        <div className="flex gap-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input 
              type="text" placeholder="Search terms..." 
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={() => setIsCreating(true)} className="flex items-center gap-2">
            <Plus size={18} /> Add Term
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <tr>
                  <th className="px-6 py-4 font-medium">Term</th>
                  <th className="px-6 py-4 font-medium">Definition</th>
                  <th className="px-6 py-4 font-medium">Example</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {isCreating && (
                  <tr className="bg-blue-50/50">
                    <td className="px-6 py-4">
                      <Input value={newTerm.term} onChange={e => setNewTerm({...newTerm, term: e.target.value})} placeholder="Term" />
                    </td>
                    <td className="px-6 py-4">
                      <Input value={newTerm.definition} onChange={e => setNewTerm({...newTerm, definition: e.target.value})} placeholder="Definition" />
                    </td>
                    <td className="px-6 py-4">
                      <Input value={newTerm.example} onChange={e => setNewTerm({...newTerm, example: e.target.value})} placeholder="Example (Optional)" />
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <Button size="sm" onClick={() => createTerm.mutate(newTerm)}>Save</Button>
                      <Button size="sm" variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
                    </td>
                  </tr>
                )}
                {filteredTerms.map((term: any) => (
                  <tr key={term.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {isEditing?.id === term.id ? (
                        <Input value={isEditing.term} onChange={e => setIsEditing({...isEditing, term: e.target.value})} />
                      ) : term.term}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {isEditing?.id === term.id ? (
                        <Input value={isEditing.definition} onChange={e => setIsEditing({...isEditing, definition: e.target.value})} />
                      ) : term.definition}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {isEditing?.id === term.id ? (
                        <Input value={isEditing.example || ''} onChange={e => setIsEditing({...isEditing, example: e.target.value})} />
                      ) : (term.example || '-')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {isEditing?.id === term.id ? (
                        <div className="flex justify-end gap-2">
                          <Button size="sm" onClick={() => updateTerm.mutate(isEditing)}>Save</Button>
                          <Button size="sm" variant="outline" onClick={() => setIsEditing(null)}>Cancel</Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => setIsEditing({ ...term })}>
                            <Edit2 size={16} />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => {
                            if(window.confirm('Are you sure?')) deleteTerm.mutate(term.id);
                          }}>
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {!isCreating && filteredTerms.length === 0 && (
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">No glossary terms found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
