import { useQuery } from "@tanstack/react-query"
import { explorerApi } from "../../api/explorer"
import { Loader2, Globe, Search, Calendar, FileCheck, CheckCircle2 } from "lucide-react"
import { useState } from "react"
import { Input } from "../../components/ui/input"

export function TradeAgreements() {
  const [searchTerm, setSearchTerm] = useState('')

  const { data: agreements, isLoading } = useQuery({
    queryKey: ['explorer-agreements'],
    queryFn: explorerApi.getAgreements
  })

  const agreementsList = Array.isArray(agreements) ? agreements : agreements?.results || []
  
  const filteredAgreements = agreementsList.filter((a: any) => 
    (a.name && a.name.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="bg-slate-50 min-h-screen pb-12">
      <div className="bg-white border-b border-slate-200 py-12 mb-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
            <Globe className="text-primary" size={32} />
            Trade Agreements
          </h1>
          <p className="text-slate-500 mt-2 text-lg">
            Preferential trade agreements that offer reduced or zero duty rates.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8 relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input 
            placeholder="Search agreements..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 bg-white"
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" size={32} /></div>
        ) : (
          <div className="space-y-6">
            {filteredAgreements.map((agreement: any) => (
              <div key={agreement.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                <div className="bg-slate-50 p-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="font-bold text-xl text-slate-900">{agreement.name}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                      <span className="flex items-center gap-1"><Calendar size={14}/> Effective: {agreement.effective_from}</span>
                      {agreement.effective_to && <span className="flex items-center gap-1">Expires: {agreement.effective_to}</span>}
                    </div>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2">
                    <CheckCircle2 size={16} /> Active
                  </span>
                </div>
                
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <FileCheck size={16} className="text-primary" /> Eligibility Rules
                    </h4>
                    <p className="text-slate-600 text-sm whitespace-pre-line leading-relaxed">
                      {agreement.eligibility_rules || 'Standard rules of origin apply.'}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
                      Required Documents
                    </h4>
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                      <p className="text-slate-700 text-sm font-medium">
                        {agreement.required_certificate || 'Certificate of Origin required.'}
                      </p>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 mt-6">
                      Participating Countries
                    </h4>
                    <p className="text-slate-500 text-sm">
                      {agreement.countries_covered?.length 
                        ? `${agreement.countries_covered.length} countries participating`
                        : 'Select countries in the region'
                      }
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredAgreements.length === 0 && (
              <div className="py-12 text-center text-slate-500 bg-white border border-slate-200 rounded-xl">
                No trade agreements found.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
