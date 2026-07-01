import * as React from "react"
import { Search } from "lucide-react"
import { cn } from "../../lib/utils"

export interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="relative flex items-center w-full">
        <Search className="absolute left-3 h-4 w-4 text-text-secondary" />
        <input
          type="search"
          className={cn(
            "flex h-10 w-full rounded-md border border-border bg-background py-2 pl-9 pr-3 text-sm ring-offset-background placeholder:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
            error && "border-danger focus-visible:ring-danger",
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    )
  }
)
SearchInput.displayName = "SearchInput"

export { SearchInput }
