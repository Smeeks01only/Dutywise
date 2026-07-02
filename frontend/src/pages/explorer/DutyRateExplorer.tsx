import { useQuery } from "@tanstack/react-query"
import { explorerApi } from "../../api/explorer"
import { Loader2, DollarSign, Search, Filter } from "lucide-react"
import { useState } from "react"
import { Input } from "../../components/ui/input"

export function DutyRateExplorer() {
  const [tariffType, setTariffType] = useState('Duty')
  const [searchTerm, setSearchTerm] = useState('')

  const { data: tariffs, isLoading } = useQuery({
    queryKey: ['explorer-tariffs', tariffType],
    queryFn: () => explorerApi.getTariffs({ type: tariffType })
  })

  const tariffsList = Array.isArray(tariffs) ? tariffs : tariffs?.results || []
  
  const filteredTariffs = tariffsList.filter((t: any) => 
    (t.hs_code_str && t.hs_code_str.includes(searchTerm)) || 
    (t.country_iso && t.country_iso.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="bg-slate-50 min-h-screen pb-12">
      <div className="bg-white border-b border-slate-200 py-12 mb-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
            <DollarSign className="text-primary" size={32} />
            Duty Rate Explorer
          </h1>
          <p className="text-slate-500 mt-2 text-lg">
            Browse and filter duty rates, VAT, excise, and other taxes by HS Code.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl">
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap gap-4 mb-6 shadow-sm">
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input 
              placeholder="Search by HS Code or Country ISO..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="w-48 flex items-center gap-2">
            <Filter size={18} className="text-slate-400" />
            <select 
              value={tariffType}
              onChange={(e) => setTariffType(e.target.value)}
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="Duty">Import Duty</option>
              <option value="VAT">VAT</option>
              <option value="Excise">Excise Duty</option>
              <option value="Surtax">Surtax</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" size={32} /></div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <tr>
                    <th className="px-6 py-4 font-medium">HS Code</th>
                    <th className="px-6 py-4 font-medium">Country of Origin</th>
                    <th className="px-6 py-4 font-medium">Tariff Type</th>
                    <th className="px-6 py-4 font-medium">Rate</th>
                    <th className="px-6 py-4 font-medium">Calculation Basis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredTariffs.map((tariff: any) => (
                    <tr key={tariff.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900 font-mono">
                        {tariff.hs_code_str}
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {tariff.country_iso || 'All (General)'}
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {tariff.tariff_type}
                      </td>
                      <td className="px-6 py-4 text-slate-900 font-semibold">
                        {tariff.percentage_rate ? `${tariff.percentage_rate}%` : `$${tariff.fixed_amount}`}
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs">
                        {tariff.calculation_basis || 'CIF'}
                      </td>
                    </tr>
                  ))}
                  {filteredTariffs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                        No tariff rates found for these filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
