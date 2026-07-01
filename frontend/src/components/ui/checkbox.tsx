import * as React from "react"
import { cn } from "../../lib/utils"

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="flex items-center">
        <input
          type="checkbox"
          className={cn(
            "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 checked:bg-primary checked:text-white transition-colors accent-primary",
            error && "border-danger checked:bg-danger accent-danger",
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    )
  }
)
Checkbox.displayName = "Checkbox"

export { Checkbox }
