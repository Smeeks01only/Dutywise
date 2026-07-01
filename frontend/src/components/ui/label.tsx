import * as React from "react"
import { cn } from "../../lib/utils"

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  error?: boolean;
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, error, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        error ? "text-danger" : "text-foreground",
        className
      )}
      {...props}
    />
  )
)
Label.displayName = "Label"

export interface ErrorMessageProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const ErrorMessage = React.forwardRef<HTMLParagraphElement, ErrorMessageProps>(
  ({ className, children, ...props }, ref) => {
    if (!children) return null;
    return (
      <p
        ref={ref}
        className={cn("text-[0.8rem] font-medium text-danger mt-1.5", className)}
        {...props}
      >
        {children}
      </p>
    )
  }
)
ErrorMessage.displayName = "ErrorMessage"

export { Label, ErrorMessage }
