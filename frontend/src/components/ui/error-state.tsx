import * as React from "react"
import { AlertTriangle } from "lucide-react"
import { cn } from "../../lib/utils"
import { Button } from "./button"

interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export function ErrorState({ 
  title = "Something went wrong", 
  description = "An error occurred while loading this content. Please try again.", 
  onRetry,
  className, 
  ...props 
}: ErrorStateProps) {
  return (
    <div 
      className={cn("flex flex-col items-center justify-center p-8 text-center rounded-lg border border-danger/20 bg-danger/5", className)}
      {...props}
    >
      <AlertTriangle className="h-10 w-10 text-danger mb-4" />
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm text-text-secondary max-w-sm mb-6">
        {description}
      </p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}
