import { useQuery } from "@tanstack/react-query"
import { explorerApi } from "../../api/explorer"
import { Link } from "react-router-dom"
import { Loader2, Book, ChevronRight, FileCode2 } from "lucide-react"

export function HSChapterBrowser() {
  const { data: chapters, isLoading } = useQuery({
    queryKey: ['explorer-chapters'],
    queryFn: explorerApi.getChapters
  })

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" size={32} /></div>
  }

  const chaptersList = Array.isArray(chapters) ? chapters : chapters?.results || []

  return (
    <div className="bg-slate-50 min-h-screen pb-12">
      <div className="bg-white border-b border-slate-200 py-12 mb-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
            <Book className="text-primary" size={32} />
            HS Chapter Browser
          </h1>
          <p className="text-slate-500 mt-2 text-lg">
            Browse the Harmonized System codes by official chapters. Select a chapter to drill down into headings and subheadings.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {chaptersList.map((chapter: any) => (
            <Link 
              key={chapter.id} 
              to={`/explorer/hscodes?parent=${chapter.id}`}
              className="bg-white border border-slate-200 rounded-xl p-4 flex gap-4 items-center hover:border-primary/50 hover:shadow-md transition-all group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-lg shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                {chapter.chapter || chapter.code.substring(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-slate-900 group-hover:text-primary transition-colors truncate">
                  {chapter.description}
                </h4>
                <p className="text-xs text-slate-400 truncate mt-1 flex items-center gap-1">
                  <FileCode2 size={12} /> Chapter {chapter.chapter || chapter.code.substring(0, 2)}
                </p>
              </div>
              <ChevronRight size={20} className="text-slate-300 group-hover:text-primary transition-colors shrink-0" />
            </Link>
          ))}
          {chaptersList.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-500">
              No chapters found.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
