import { useQuery } from "@tanstack/react-query"
import { explorerApi } from "../../api/explorer"
import { Loader2, Landmark, Search, ExternalLink, Mail, Phone, MapPin } from "lucide-react"
import { useState } from "react"
import { Input } from "../../components/ui/input"

export function GovernmentAgencies() {
  const [searchTerm, setSearchTerm] = useState('')

  const { data: agencies, isLoading } = useQuery({
    queryKey: ['explorer-agencies'],
    queryFn: explorerApi.getAgencies
  })

  const agenciesList = Array.isArray(agencies) ? agencies : agencies?.results || []
  
  const filteredAgencies = agenciesList.filter((a: any) => 
    (a.name && a.name.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (a.description && a.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="bg-slate-50 min-h-screen pb-12">
      <div className="bg-white border-b border-slate-200 py-12 mb-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
            <Landmark className="text-primary" size={32} />
            Government Agencies
          </h1>
          <p className="text-slate-500 mt-2 text-lg">
            Directory of regulatory authorities and government agencies involved in customs.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8 relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input 
            placeholder="Search agencies..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 bg-white"
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" size={32} /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAgencies.map((agency: any) => (
              <div key={agency.id} className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md transition-all flex flex-col h-full">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 mb-4">
                  <Landmark size={24} />
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">{agency.name}</h3>
                <p className="text-sm text-slate-600 mb-6 flex-grow">{agency.description}</p>
                
                <div className="space-y-3 mt-auto pt-4 border-t border-slate-100 text-sm">
                  {agency.website && (
                    <a href={agency.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-primary hover:underline">
                      <ExternalLink size={16} className="text-slate-400" />
                      <span className="truncate">Website</span>
                    </a>
                  )}
                  {agency.email && (
                    <a href={`mailto:${agency.email}`} className="flex items-center gap-3 text-slate-700 hover:text-primary transition-colors">
                      <Mail size={16} className="text-slate-400" />
                      <span className="truncate">{agency.email}</span>
                    </a>
                  )}
                  {agency.phone && (
                    <div className="flex items-center gap-3 text-slate-700">
                      <Phone size={16} className="text-slate-400" />
                      <span>{agency.phone}</span>
                    </div>
                  )}
                  {agency.address && (
                    <div className="flex items-start gap-3 text-slate-700">
                      <MapPin size={16} className="text-slate-400 mt-1 shrink-0" />
                      <span className="text-xs">{agency.address}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {filteredAgencies.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-500 bg-white border border-slate-200 rounded-xl">
                No agencies found matching your search.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
