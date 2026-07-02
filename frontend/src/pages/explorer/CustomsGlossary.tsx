import { useQuery } from "@tanstack/react-query"
import { explorerApi } from "../../api/explorer"
import { Loader2, BookOpen, Search, Quote } from "lucide-react"
import { useState } from "react"
import { Input } from "../../components/ui/input"

export function CustomsGlossary() {
  const [searchTerm, setSearchTerm] = useState('')

  const { data: glossary, isLoading } = useQuery({
    queryKey: ['explorer-glossary'],
    queryFn: explorerApi.getGlossary
  })

  const glossaryList = Array.isArray(glossary) ? glossary : glossary?.results || []
  
  const filteredTerms = glossaryList.filter((g: any) => 
    (g.term && g.term.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (g.definition && g.definition.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  // Group by first letter
  const groupedTerms = filteredTerms.reduce((acc: any, term: any) => {
    const firstLetter = term.term.charAt(0).toUpperCase()
    if (!acc[firstLetter]) acc[firstLetter] = []
    acc[firstLetter].push(term)
    return acc
  }, {})

  const sortedLetters = Object.keys(groupedTerms).sort()

  return (
    <div className="bg-slate-50 min-h-screen pb-12">
      <div className="bg-white border-b border-slate-200 py-12 mb-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
            <BookOpen className="text-primary" size={32} />
            Customs Glossary
          </h1>
          <p className="text-slate-500 mt-2 text-lg">
            Dictionary of common customs terms, acronyms, and legal definitions.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <Input 
            placeholder="Search terms or definitions..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 h-14 text-lg bg-white shadow-sm border-slate-200 rounded-xl"
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" size={32} /></div>
        ) : (
          <div className="space-y-12">
            {sortedLetters.map(letter => (
              <div key={letter} className="relative">
                <div className="sticky top-4 bg-slate-50 py-2 z-10 flex items-center mb-4">
                  <h2 className="text-3xl font-extrabold text-primary w-12">{letter}</h2>
                  <div className="h-px bg-slate-200 flex-1"></div>
                </div>
                
                <div className="space-y-6 pl-12">
                  {groupedTerms[letter].map((item: any) => (
                    <div key={item.id} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                      <h3 className="text-xl font-bold text-slate-900 mb-3">{item.term}</h3>
                      <p className="text-slate-700 leading-relaxed">{item.definition}</p>
                      
                      {item.example && (
                        <div className="mt-4 bg-slate-50 p-4 rounded-lg text-sm text-slate-600 border border-slate-100 flex gap-3">
                          <Quote className="text-slate-300 shrink-0" size={20} />
                          <p className="italic">{item.example}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            
            {sortedLetters.length === 0 && (
              <div className="py-12 text-center text-slate-500 bg-white border border-slate-200 rounded-xl">
                No glossary terms found matching "{searchTerm}".
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
