import { useQuery } from "@tanstack/react-query"
import { Link, useNavigate } from "react-router-dom"
import { Search, Book, Layers, Package, Globe, Shield, ArrowRight, Loader2 } from "lucide-react"
import { explorerApi } from "../api/explorer"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { useState } from "react"
import { Card, CardContent } from "../components/ui/card"

export function TariffExplorerPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['explorer-home'],
    queryFn: explorerApi.getHomeStats
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" size={32} /></div>
  }

  const stats = data?.stats || { hscodes: 0, products: 0, categories: 0, countries: 0 }
  const popular_categories = data?.popular_categories || []
  const popular_products = data?.popular_products || []

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-slate-50">
      {/* Hero Section */}
      <section className="bg-primary/5 py-16 md:py-24 border-b border-slate-200">
        <div className="container px-4 md:px-6 mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-6">
            Customs Tariff Explorer
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-10">
            Browse Zimbabwe's official customs tariff book, find duty rates, explore import restrictions, and understand trade agreements.
          </p>
          
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto relative shadow-xl shadow-primary/5 rounded-2xl">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
              <Search size={20} />
            </div>
            <Input 
              type="text" 
              placeholder="Search products, HS codes, categories or glossary terms..."
              className="pl-12 pr-32 h-16 text-lg rounded-2xl bg-white border-none shadow-none focus-visible:ring-2 focus-visible:ring-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute inset-y-2 right-2 flex items-center">
              <Button type="submit" className="h-12 px-6 rounded-xl font-semibold shadow-md">
                Search
              </Button>
            </div>
          </form>

          <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm text-slate-600 font-medium">
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div>{stats.hscodes.toLocaleString()} HS Codes</div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div>{stats.products.toLocaleString()} Products</div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-orange-500"></div>{stats.categories.toLocaleString()} Categories</div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-purple-500"></div>{stats.countries.toLocaleString()} Countries</div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="container px-4 md:px-6 mx-auto py-12 flex-1">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Left Column: Quick Links */}
          <div className="md:col-span-1 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 mb-4 px-1">Knowledge Hub</h3>
            
            <Link to="/explorer/chapters" className="flex items-center p-4 bg-white rounded-xl border border-slate-200 hover:border-primary/50 hover:shadow-md transition-all group">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 mr-4 group-hover:bg-blue-100 transition-colors">
                <Book size={20} />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-slate-900 group-hover:text-primary transition-colors">HS Chapter Browser</h4>
                <p className="text-xs text-slate-500 mt-1">Drill down through standard classifications</p>
              </div>
              <ArrowRight size={16} className="text-slate-300 group-hover:text-primary transition-colors" />
            </Link>

            <Link to="/categories" className="flex items-center p-4 bg-white rounded-xl border border-slate-200 hover:border-primary/50 hover:shadow-md transition-all group">
              <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600 mr-4 group-hover:bg-orange-100 transition-colors">
                <Layers size={20} />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-slate-900 group-hover:text-primary transition-colors">Category Explorer</h4>
                <p className="text-xs text-slate-500 mt-1">Browse products by visual categories</p>
              </div>
              <ArrowRight size={16} className="text-slate-300 group-hover:text-primary transition-colors" />
            </Link>

            <Link to="/explorer/restrictions" className="flex items-center p-4 bg-white rounded-xl border border-slate-200 hover:border-primary/50 hover:shadow-md transition-all group">
              <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-red-600 mr-4 group-hover:bg-red-100 transition-colors">
                <Shield size={20} />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-slate-900 group-hover:text-primary transition-colors">Import Restrictions</h4>
                <p className="text-xs text-slate-500 mt-1">Check banned or regulated goods</p>
              </div>
              <ArrowRight size={16} className="text-slate-300 group-hover:text-primary transition-colors" />
            </Link>

            <Link to="/explorer/agreements" className="flex items-center p-4 bg-white rounded-xl border border-slate-200 hover:border-primary/50 hover:shadow-md transition-all group">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 mr-4 group-hover:bg-emerald-100 transition-colors">
                <Globe size={20} />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-slate-900 group-hover:text-primary transition-colors">Trade Agreements</h4>
                <p className="text-xs text-slate-500 mt-1">Preferential duty rates and rules</p>
              </div>
              <ArrowRight size={16} className="text-slate-300 group-hover:text-primary transition-colors" />
            </Link>

          </div>

          {/* Middle/Right Columns: Content */}
          <div className="md:col-span-2 space-y-8">
            
            {/* Popular Categories */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Layers size={18} className="text-primary" /> 
                Popular Categories
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {popular_categories.map((cat: any) => (
                  <Link key={cat.id} to={`/categories?parent=${cat.id}`}>
                    <Card className="hover:border-primary/50 hover:shadow-md transition-all cursor-pointer h-full">
                      <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3 text-slate-600">
                          <Package size={24} />
                        </div>
                        <h4 className="font-semibold text-sm text-slate-900 line-clamp-2">{cat.name}</h4>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>

            {/* Popular Products */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Package size={18} className="text-primary" /> 
                Frequently Searched Products
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {popular_products.map((prod: any) => (
                  <Link key={prod.id} to={`/product/${prod.id}`}>
                    <div className="bg-white border border-slate-200 rounded-xl p-4 flex gap-4 hover:border-primary/50 hover:shadow-md transition-all group">
                      <div className="w-16 h-16 rounded-lg bg-slate-100 shrink-0 flex items-center justify-center overflow-hidden">
                        {prod.image ? (
                          <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                        ) : (
                          <Package size={24} className="text-slate-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <h4 className="font-semibold text-slate-900 text-sm truncate group-hover:text-primary transition-colors">{prod.name}</h4>
                        <p className="text-xs text-slate-500 truncate mt-1">HS: {prod.hs_code_str}</p>
                        <p className="text-xs text-slate-400 truncate mt-0.5">{prod.category_name}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  )
}
