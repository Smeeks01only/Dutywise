import * as React from "react"
import { cn } from "../../lib/utils"

export interface CurrencyInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  currencySymbol?: string;
}

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ className, error, currencySymbol = "$", ...props }, ref) => {
    return (
      <div className="relative flex items-center w-full">
        <span className="absolute left-3 text-text-secondary text-sm">{currencySymbol}</span>
        <input
          type="number"
          step="0.01"
          className={cn(
            "flex h-10 w-full rounded-md border border-border bg-background py-2 pl-7 pr-3 text-sm ring-offset-background placeholder:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
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
CurrencyInput.displayName = "CurrencyInput"

export { CurrencyInput }
