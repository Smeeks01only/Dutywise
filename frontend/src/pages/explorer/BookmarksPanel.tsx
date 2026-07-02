import { useQuery } from "@tanstack/react-query"
import { explorerApi } from "../../api/explorer"
import { Loader2, Bookmark, Clock, ArrowRight, ExternalLink } from "lucide-react"
import { Link } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { Button } from "../../components/ui/button"

export function BookmarksPanel() {
  const { user } = useAuth()

  const { data: bookmarks, isLoading: isLoadingBookmarks } = useQuery({
    queryKey: ['explorer-bookmarks'],
    queryFn: explorerApi.getBookmarks,
    enabled: !!user
  })

  const { data: recent, isLoading: isLoadingRecent } = useQuery({
    queryKey: ['explorer-recent'],
    queryFn: explorerApi.getRecent,
    enabled: !!user
  })

  if (!user) {
    return (
      <div className="bg-slate-50 min-h-screen pb-12 flex items-center justify-center">
        <div className="text-center p-8 bg-white border border-slate-200 rounded-xl shadow-sm max-w-md">
          <Bookmark className="mx-auto h-12 w-12 text-slate-300 mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Sign in Required</h2>
          <p className="text-slate-500 mb-6">You need to be signed in to view your bookmarks and history.</p>
          <Link to="/login">
            <Button>Sign In to Account</Button>
          </Link>
        </div>
      </div>
    )
  }

  const bookmarksList = Array.isArray(bookmarks) ? bookmarks : bookmarks?.results || []
  const recentList = Array.isArray(recent) ? recent : recent?.results || []

  return (
    <div className="bg-slate-50 min-h-screen pb-12">
      <div className="bg-white border-b border-slate-200 py-12 mb-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
            <Bookmark className="text-primary" size={32} />
            My Saved Items & History
          </h1>
          <p className="text-slate-500 mt-2 text-lg">
            Quickly access your bookmarked tariffs, HS codes, and recently viewed pages.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Bookmarks Section */}
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-4">
              <Bookmark className="text-primary" size={20} /> Saved Bookmarks
            </h2>
            
            {isLoadingBookmarks ? (
              <div className="flex justify-center p-8 bg-white rounded-xl border border-slate-200"><Loader2 className="animate-spin text-primary" /></div>
            ) : bookmarksList.length > 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="divide-y divide-slate-100">
                  {bookmarksList.map((item: any) => (
                    <div key={item.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div>
                        <h4 className="font-medium text-slate-900">{item.item_name || 'Item'}</h4>
                        <p className="text-xs text-slate-500 mt-1 capitalize">{item.content_type || 'Unknown Type'}</p>
                      </div>
                      {item.url && (
                        <Link to={item.url} className="text-primary hover:text-primary-dark flex items-center gap-1 text-sm font-medium">
                          View <ExternalLink size={14} />
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500">
                You haven't bookmarked any items yet.
              </div>
            )}
          </div>

          {/* History Section */}
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-4">
              <Clock className="text-primary" size={20} /> Recently Viewed
            </h2>
            
            {isLoadingRecent ? (
              <div className="flex justify-center p-8 bg-white rounded-xl border border-slate-200"><Loader2 className="animate-spin text-primary" /></div>
            ) : recentList.length > 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="divide-y divide-slate-100">
                  {recentList.map((item: any) => (
                    <div key={item.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div>
                        <h4 className="font-medium text-slate-900">{item.item_name || 'Item'}</h4>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                          <span className="capitalize">{item.content_type}</span>
                          <span>&middot;</span>
                          <span>{new Date(item.updated_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      {item.url && (
                        <Link to={item.url} className="text-slate-400 hover:text-primary transition-colors">
                          <ArrowRight size={18} />
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500">
                No history found.
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
