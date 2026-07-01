import { Button } from "../components/ui/button"
import { Link } from "react-router-dom"
import { ArrowRight, Calculator, Globe, Scale, CheckCircle2, FileSearch } from "lucide-react"

export function HomePage() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section with Background */}
      <section className="relative w-full flex-1 flex flex-col bg-[url('/hero-bg.png')] bg-cover bg-top bg-no-repeat pb-12">
        {/* Subtle white fade at the top if needed */}
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white to-transparent pointer-events-none" />
        
        <div className="container px-4 md:px-6 mx-auto relative z-10 pt-16 md:pt-24 lg:pt-32">
          <div className="flex flex-col items-center text-center space-y-6">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-[4rem] text-slate-900 leading-tight">
              <span className="inline-block">Modern Customs Solutions</span> <br className="hidden sm:block" />
              <span className="inline-block">for <span className="text-primary">Zimbabwe</span></span>
            </h1>
            
            <p className="mx-auto max-w-[600px] text-slate-600 md:text-lg lg:text-xl font-medium">
              Estimate import duties, VAT, and surtax instantly. Understand HS codes and regulations without the headache.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
              <Link to="/calculator">
                <Button size="lg" className="h-12 px-8 rounded-lg font-semibold shadow-lg shadow-primary/25">
                  Start Calculating <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="outline" size="lg" className="h-12 px-8 rounded-lg font-semibold bg-white/80 backdrop-blur border-slate-200 text-slate-700 hover:bg-slate-50">
                  Create Account
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Floating Info Cards */}
        <div className="container mx-auto px-4 relative mt-20 md:mt-32 hidden md:flex justify-between max-w-6xl z-10">
          {/* Left Floating Card */}
          <div className="bg-white/90 backdrop-blur-md border border-white/50 shadow-xl rounded-xl p-4 flex items-start gap-4 max-w-xs transform -translate-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="bg-blue-100 p-2 rounded-lg text-primary shrink-0">
              <Calculator className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-slate-900">Accurate Estimates</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">Up-to-date ZIMRA rates and regulations.</p>
            </div>
          </div>

          {/* Right Floating Card */}
          <div className="bg-white/90 backdrop-blur-md border border-white/50 shadow-xl rounded-xl p-4 flex items-start gap-4 max-w-xs transform translate-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150">
            <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600 shrink-0">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-slate-900">Compliant & Reliable</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">Stay compliant with ZIMRA regulations and rules.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section className="w-full bg-slate-50/50 py-16 -mt-8 relative z-20">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {/* Card 1 */}
            <div className="group bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-200 flex flex-col h-full cursor-pointer">
              <div className="bg-blue-50 w-12 h-12 rounded-xl flex items-center justify-center text-blue-600 mb-6">
                <Calculator className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Duty Calculator</h3>
              <p className="text-sm text-slate-500 flex-1">Get accurate estimates for all customs charges.</p>
              <div className="mt-6 flex justify-end">
                <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-colors">
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="group bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-200 flex flex-col h-full cursor-pointer">
              <div className="bg-emerald-50 w-12 h-12 rounded-xl flex items-center justify-center text-emerald-600 mb-6">
                <Globe className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Tariff Explorer</h3>
              <p className="text-sm text-slate-500 flex-1">Browse comprehensive tariff rates for any country.</p>
              <div className="mt-6 flex justify-end">
                <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-colors">
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="group bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-200 flex flex-col h-full cursor-pointer">
              <div className="bg-purple-50 w-12 h-12 rounded-xl flex items-center justify-center text-purple-600 mb-6">
                <FileSearch className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">HS Code Search</h3>
              <p className="text-sm text-slate-500 flex-1">Find the exact classification for your products.</p>
              <div className="mt-6 flex justify-end">
                <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-colors">
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </div>

            {/* Card 4 */}
            <div className="group bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-200 flex flex-col h-full cursor-pointer">
              <div className="bg-orange-50 w-12 h-12 rounded-xl flex items-center justify-center text-orange-600 mb-6">
                <Scale className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Import Rules</h3>
              <p className="text-sm text-slate-500 flex-1">Stay compliant with ZIMRA regulations and restrictions.</p>
              <div className="mt-6 flex justify-end">
                <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-colors">
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
