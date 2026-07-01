import { EmptyState } from "../components/ui/empty-state"
import { Scale } from "lucide-react"

export function ImportRulesPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Import Rules & Regulations</h1>
        <p className="text-text-secondary mt-2">Learn about restricted and prohibited goods</p>
      </div>
      
      <EmptyState 
        icon={Scale}
        title="Import Rules Coming Soon"
        description="The import rules and regulations explorer is currently under construction. Please check back later."
        className="bg-surface border border-border rounded-lg min-h-[400px]"
      />
    </div>
  )
}
