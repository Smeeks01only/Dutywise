import { EmptyState } from "../components/ui/empty-state"
import { Globe } from "lucide-react"

export function TariffExplorerPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Tariff Explorer</h1>
        <p className="text-text-secondary mt-2">Browse customs rates by country and HS code</p>
      </div>
      
      <EmptyState 
        icon={Globe}
        title="Tariff Explorer Coming Soon"
        description="The interactive tariff explorer is currently under construction. Please check back later."
        className="bg-surface border border-border rounded-lg min-h-[400px]"
      />
    </div>
  )
}
