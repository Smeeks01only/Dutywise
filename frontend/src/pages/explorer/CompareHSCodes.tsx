import { useQuery } from "@tanstack/react-query"
import { explorerApi } from "../../api/explorer"
import { getHSCode } from "../../api/search"
import { Loader2, GitCompare, Search, DollarSign, Shield } from "lucide-react"
import { useState } from "react"
import { Input } from "../../components/ui/input"
import { Button } from "../../components/ui/button"

export function CompareHSCodes() {
  const [code1, setCode1] = useState('')
  const [code2, setCode2] = useState('')
  const [compareIds, setCompareIds] = useState<[string, string] | null>(null)

  const { data: hscodesList, isLoading: isSearchLoading } = useQuery({
    queryKey: ['explorer-hscodes'],
    queryFn: explorerApi.getHSCodes
  })

  // To find IDs by code text
  const handleCompare = () => {
    if (!hscodesList?.results) return;
    const items = hscodesList.results;
    const item1 = items.find((i: any) => i.code === code1);
    const item2 = items.find((i: any) => i.code === code2);
    
    if (item1 && item2) {
      setCompareIds([item1.id, item2.id]);
    } else {
      alert("One or both HS Codes not found. Please check and try again.");
    }
  }

  const { data: data1, isLoading: isLoading1 } = useQuery({
    queryKey: ['hscode-full', compareIds?.[0]],
    queryFn: async () => {
      if (!compareIds) return null;
      const [details, tariffs, restrictions] = await Promise.all([
        getHSCode(compareIds[0]),
        explorerApi.getTariffs({ hs_code: compareIds[0] }),
        explorerApi.getRestrictions({ hs_code: compareIds[0] })
      ]);
      return { details, tariffs: tariffs.results, restrictions: restrictions.results };
    },
    enabled: !!compareIds
  })

  const { data: data2, isLoading: isLoading2 } = useQuery({
    queryKey: ['hscode-full', compareIds?.[1]],
    queryFn: async () => {
      if (!compareIds) return null;
      const [details, tariffs, restrictions] = await Promise.all([
        getHSCode(compareIds[1]),
        explorerApi.getTariffs({ hs_code: compareIds[1] }),
        explorerApi.getRestrictions({ hs_code: compareIds[1] })
      ]);
      return { details, tariffs: tariffs.results, restrictions: restrictions.results };
    },
    enabled: !!compareIds
  })

  return (
    <div className="bg-slate-50 min-h-screen pb-12">
      <div className="bg-white border-b border-slate-200 py-12 mb-8">
        <div className="container mx-auto px-4 max-w-6xl text-center">
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center justify-center gap-3">
            <GitCompare className="text-primary" size={32} />
            Compare HS Codes
          </h1>
          <p className="text-slate-500 mt-2 text-lg">
            Side-by-side comparison of duties, restrictions, and descriptions.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 max-w-2xl mx-auto">
            <div className="flex-1 relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <Input 
                placeholder="HS Code 1 (e.g. 8703.23)" 
                value={code1}
                onChange={(e) => setCode1(e.target.value)}
                className="pl-10 text-center font-mono"
              />
            </div>
            <div className="bg-slate-100 rounded-full p-2 text-slate-400 shrink-0 hidden sm:block">
              <GitCompare size={16} />
            </div>
            <div className="flex-1 relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <Input 
                placeholder="HS Code 2 (e.g. 8703.24)" 
                value={code2}
                onChange={(e) => setCode2(e.target.value)}
                className="pl-10 text-center font-mono"
              />
            </div>
            <Button onClick={handleCompare} disabled={!code1 || !code2 || isSearchLoading} className="w-full sm:w-auto">
              Compare
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl">
        {(isLoading1 || isLoading2) && (
          <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" size={32} /></div>
        )}

        {data1 && data2 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Column 1 */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <div className="bg-slate-50 p-6 border-b border-slate-200 text-center">
                <h2 className="text-2xl font-bold font-mono text-slate-900">{data1.details.code}</h2>
                <p className="text-slate-500 mt-1 line-clamp-2" title={data1.details.description}>{data1.details.description}</p>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-3"><DollarSign size={18} className="text-primary"/> Duties & Taxes</h3>
                  {data1.tariffs.length > 0 ? (
                    <ul className="space-y-2">
                      {data1.tariffs.map((t: any) => (
                        <li key={t.id} className="flex justify-between items-center text-sm border-b border-slate-100 pb-2">
                          <span className="text-slate-600">{t.tariff_type} <span className="text-xs text-slate-400">({t.country_iso || 'General'})</span></span>
                          <span className="font-semibold">{t.percentage_rate ? `${t.percentage_rate}%` : `$${t.fixed_amount}`}</span>
                        </li>
                      ))}
                    </ul>
                  ) : <p className="text-sm text-slate-500">No duties found.</p>}
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-3"><Shield size={18} className="text-red-500"/> Restrictions</h3>
                  {data1.restrictions.length > 0 ? (
                    <ul className="space-y-3">
                      {data1.restrictions.map((r: any) => (
                        <li key={r.id} className="text-sm bg-slate-50 p-3 rounded">
                          <div className="font-semibold">{r.restriction_type}</div>
                          <div className="text-slate-600 mt-1">{r.description}</div>
                        </li>
                      ))}
                    </ul>
                  ) : <p className="text-sm text-slate-500">No restrictions.</p>}
                </div>
              </div>
            </div>

            {/* Column 2 */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <div className="bg-slate-50 p-6 border-b border-slate-200 text-center">
                <h2 className="text-2xl font-bold font-mono text-slate-900">{data2.details.code}</h2>
                <p className="text-slate-500 mt-1 line-clamp-2" title={data2.details.description}>{data2.details.description}</p>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-3"><DollarSign size={18} className="text-primary"/> Duties & Taxes</h3>
                  {data2.tariffs.length > 0 ? (
                    <ul className="space-y-2">
                      {data2.tariffs.map((t: any) => (
                        <li key={t.id} className="flex justify-between items-center text-sm border-b border-slate-100 pb-2">
                          <span className="text-slate-600">{t.tariff_type} <span className="text-xs text-slate-400">({t.country_iso || 'General'})</span></span>
                          <span className="font-semibold">{t.percentage_rate ? `${t.percentage_rate}%` : `$${t.fixed_amount}`}</span>
                        </li>
                      ))}
                    </ul>
                  ) : <p className="text-sm text-slate-500">No duties found.</p>}
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-3"><Shield size={18} className="text-red-500"/> Restrictions</h3>
                  {data2.restrictions.length > 0 ? (
                    <ul className="space-y-3">
                      {data2.restrictions.map((r: any) => (
                        <li key={r.id} className="text-sm bg-slate-50 p-3 rounded">
                          <div className="font-semibold">{r.restriction_type}</div>
                          <div className="text-slate-600 mt-1">{r.description}</div>
                        </li>
                      ))}
                    </ul>
                  ) : <p className="text-sm text-slate-500">No restrictions.</p>}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
