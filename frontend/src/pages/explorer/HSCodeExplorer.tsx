import { useQuery } from "@tanstack/react-query"
import { explorerApi } from "../../api/explorer"
import { Link, useSearchParams, useNavigate } from "react-router-dom"
import { Loader2, ArrowLeft, FileCode2, ChevronRight, PackageSearch } from "lucide-react"
import { Button } from "../../components/ui/button"

export function HSCodeExplorer() {
  const [searchParams] = useSearchParams()
  const parentId = searchParams.get("parent")
  const navigate = useNavigate()

  const { data: hscodes, isLoading } = useQuery({
    queryKey: ['explorer-hscodes', parentId],
    queryFn: () => explorerApi.getHSCodes({ parent: parentId || '' })
  })

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" size={32} /></div>
  }

  const hscodesList = Array.isArray(hscodes) ? hscodes : hscodes?.results || []

  return (
    <div className="bg-slate-50 min-h-screen pb-12">
      <div className="bg-white border-b border-slate-200 py-8 mb-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 -ml-4 text-slate-500 hover:text-slate-900">
            <ArrowLeft size={16} className="mr-2" /> Back
          </Button>
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
            <FileCode2 className="text-primary" size={32} />
            HS Code Explorer
          </h1>
          <p className="text-slate-500 mt-2 text-lg">
            Browse headings, subheadings, and terminal HS codes. Select a specific code to view its duty rates and restrictions.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl">
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="divide-y divide-slate-100">
            {hscodesList.map((hscode: any) => {
              // Determine if it's a leaf node (terminal HS code) or intermediate
              // If code length >= 8 or 10, usually terminal, but we can just link to details vs explorer
              const isTerminal = hscode.code && hscode.code.length >= 8;
              
              return (
                <Link 
                  key={hscode.id} 
                  to={isTerminal ? `/hs-code/${hscode.id}` : `/explorer/hscodes?parent=${hscode.id}`}
                  className="p-4 flex gap-4 items-center hover:bg-slate-50 transition-colors group"
                >
                  <div className="w-16 text-center font-mono font-bold text-slate-700 group-hover:text-primary transition-colors">
                    {hscode.code}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-slate-900 group-hover:text-primary transition-colors line-clamp-2">
                      {hscode.description}
                    </h4>
                    {hscode.notes && (
                      <p className="text-xs text-slate-500 line-clamp-1 mt-1">{hscode.notes}</p>
                    )}
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    {isTerminal ? (
                      <span className="text-xs font-semibold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full flex items-center gap-1">
                        <PackageSearch size={12} /> View Details
                      </span>
                    ) : (
                      <ChevronRight size={20} className="text-slate-300 group-hover:text-primary transition-colors" />
                    )}
                  </div>
                </Link>
              )
            })}
            {hscodesList.length === 0 && (
              <div className="p-8 text-center text-slate-500">
                No items found in this section.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
