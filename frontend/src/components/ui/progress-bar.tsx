import * as React from "react"
import { cn } from "../../lib/utils"

interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0 to 100
  indicatorColor?: string;
}

const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ className, value, indicatorColor, ...props }, ref) => {
    // Clamp value between 0 and 100
    const clampedValue = Math.min(100, Math.max(0, value));
    
    return (
      <div
        ref={ref}
        className={cn("relative h-2 w-full overflow-hidden rounded-full bg-muted", className)}
        {...props}
      >
        <div
          className={cn("h-full w-full flex-1 bg-primary transition-all duration-300 ease-in-out", indicatorColor)}
          style={{ transform: `translateX(-${100 - clampedValue}%)` }}
        />
      </div>
    )
  }
)
ProgressBar.displayName = "ProgressBar"

export { ProgressBar }
