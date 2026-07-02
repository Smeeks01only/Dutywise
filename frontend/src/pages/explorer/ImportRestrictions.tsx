import { useQuery } from "@tanstack/react-query"
import { explorerApi } from "../../api/explorer"
import { Loader2, Shield, Search, FileText } from "lucide-react"
import { useState } from "react"
import { Input } from "../../components/ui/input"

export function ImportRestrictions() {
  const [searchTerm, setSearchTerm] = useState('')

  const { data: restrictions, isLoading } = useQuery({
    queryKey: ['explorer-restrictions'],
    queryFn: explorerApi.getRestrictions
  })

  const restrictionsList = Array.isArray(restrictions) ? restrictions : restrictions?.results || []
  
  const filteredRestrictions = restrictionsList.filter((r: any) => 
    (r.hs_code_str && r.hs_code_str.includes(searchTerm)) || 
    (r.description && r.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (r.agency_name && r.agency_name.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="bg-slate-50 min-h-screen pb-12">
      <div className="bg-white border-b border-slate-200 py-12 mb-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
            <Shield className="text-red-500" size={32} />
            Import Restrictions
          </h1>
          <p className="text-slate-500 mt-2 text-lg">
            Check restricted, prohibited, or regulated goods and their required permits.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-6 relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input 
            placeholder="Search by description, HS code or agency..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" size={32} /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredRestrictions.map((restriction: any) => (
              <div key={restriction.id} className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-lg text-slate-900 leading-tight">
                    {restriction.description}
                  </h3>
                  <span className={`px-2 py-1 rounded text-xs font-semibold uppercase tracking-wider shrink-0 ml-4 ${
                    restriction.restriction_type === 'Prohibited' ? 'bg-red-100 text-red-700' :
                    restriction.restriction_type === 'Restricted' ? 'bg-orange-100 text-orange-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {restriction.restriction_type}
                  </span>
                </div>
                
                <div className="space-y-3 text-sm text-slate-600">
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-500">HS Code</span>
                    <span className="font-mono font-medium text-slate-900">{restriction.hs_code_str || 'Various'}</span>
                  </div>
                  
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-500">Controlling Agency</span>
                    <span className="font-medium text-slate-900 text-right">{restriction.agency_name || 'Multiple / Unknown'}</span>
                  </div>

                  <div className="pt-2">
                    <span className="text-slate-500 block mb-2">Requirements:</span>
                    <div className="flex flex-wrap gap-2">
                      {restriction.license_required && <span className="bg-slate-100 px-2 py-1 rounded-md text-xs flex items-center gap-1"><FileText size={12}/> License Required</span>}
                      {restriction.permit_required && <span className="bg-slate-100 px-2 py-1 rounded-md text-xs flex items-center gap-1"><FileText size={12}/> Permit Required</span>}
                      {restriction.inspection_required && <span className="bg-slate-100 px-2 py-1 rounded-md text-xs">Inspection Required</span>}
                    </div>
                  </div>

                  {restriction.legal_citation && (
                    <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500">
                      <strong>Legal Ref:</strong> {restriction.legal_citation}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {filteredRestrictions.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-500 bg-white border border-slate-200 rounded-xl">
                No restrictions found matching your search.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
