import * as React from "react"
import { ChevronRight } from "lucide-react"
import { cn } from "../../lib/utils"

export interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  separator?: React.ReactNode;
}

const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
  ({ className, separator = <ChevronRight className="h-4 w-4" />, children, ...props }, ref) => {
    const validChildren = React.Children.toArray(children).filter(Boolean);
    
    return (
      <nav ref={ref} aria-label="breadcrumb" className={cn("flex", className)} {...props}>
        <ol className="flex items-center space-x-2 text-sm text-text-secondary">
          {validChildren.map((child, index) => (
            <li key={index} className="flex items-center">
              {child}
              {index < validChildren.length - 1 && (
                <span className="mx-2 text-muted-foreground/50">{separator}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    )
  }
)
Breadcrumb.displayName = "Breadcrumb"

const BreadcrumbItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("inline-flex items-center gap-1.5", className)} {...props} />
  )
)
BreadcrumbItem.displayName = "BreadcrumbItem"

const BreadcrumbLink = React.forwardRef<HTMLAnchorElement, React.AnchorHTMLAttributes<HTMLAnchorElement>>(
  ({ className, ...props }, ref) => (
    <a
      ref={ref}
      className={cn("transition-colors hover:text-foreground", className)}
      {...props}
    />
  )
)
BreadcrumbLink.displayName = "BreadcrumbLink"

const BreadcrumbPage = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cn("font-normal text-foreground", className)}
      {...props}
    />
  )
)
BreadcrumbPage.displayName = "BreadcrumbPage"

export { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage }
