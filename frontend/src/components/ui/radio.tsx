import * as React from "react"
import { cn } from "../../lib/utils"

export interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="flex items-center">
        <input
          type="radio"
          className={cn(
            "peer h-4 w-4 shrink-0 rounded-full border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 checked:bg-primary checked:border-primary transition-colors accent-primary",
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
Radio.displayName = "Radio"

export { Radio }
