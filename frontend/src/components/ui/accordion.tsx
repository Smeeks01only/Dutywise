import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "../../lib/utils"

export interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {}

const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("w-full", className)} {...props} />
  )
)
Accordion.displayName = "Accordion"

interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

const AccordionItem = React.forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("border-b", className)} {...props} />
  )
)
AccordionItem.displayName = "AccordionItem"

interface AccordionTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isOpen?: boolean;
  onToggle?: () => void;
}

const AccordionTrigger = React.forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  ({ className, children, isOpen, onToggle, ...props }, ref) => (
    <div className="flex">
      <button
        ref={ref}
        type="button"
        onClick={onToggle}
        className={cn(
          "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
          className
        )}
        data-state={isOpen ? "open" : "closed"}
        {...props}
      >
        {children}
        <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
      </button>
    </div>
  )
)
AccordionTrigger.displayName = "AccordionTrigger"

const AccordionContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { isOpen?: boolean }>(
  ({ className, children, isOpen, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "overflow-hidden text-sm transition-all",
        isOpen ? "animate-accordion-down" : "hidden",
        className
      )}
      {...props}
    >
      <div className={cn("pb-4 pt-0", className)}>{children}</div>
    </div>
  )
)
AccordionContent.displayName = "AccordionContent"

// Wrapper for an uncontrolled simple accordion
export function SimpleAccordion({ 
  items, 
  className 
}: { 
  items: { title: string; content: React.ReactNode; value: string }[],
  className?: string 
}) {
  const [openItem, setOpenItem] = React.useState<string | null>(null);

  return (
    <Accordion className={className}>
      {items.map((item) => (
        <AccordionItem key={item.value} value={item.value}>
          <AccordionTrigger 
            isOpen={openItem === item.value} 
            onToggle={() => setOpenItem(openItem === item.value ? null : item.value)}
          >
            {item.title}
          </AccordionTrigger>
          <AccordionContent isOpen={openItem === item.value}>
            {item.content}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
