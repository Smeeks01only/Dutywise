import * as React from "react"
import { X } from "lucide-react"
import { cn } from "../../lib/utils"

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  position?: "left" | "right";
  className?: string;
}

export function Drawer({ 
  isOpen, 
  onClose, 
  title, 
  description, 
  children, 
  position = "right",
  className 
}: DrawerProps) {
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer Content */}
      <div 
        className={cn(
          "fixed z-50 h-full w-full max-w-sm bg-surface p-6 shadow-2xl transition-transform duration-300 ease-in-out flex flex-col",
          position === "right" ? "right-0 border-l border-border animate-in slide-in-from-right" : "left-0 border-r border-border animate-in slide-in-from-left",
          className
        )}
      >
        <div className="flex items-center justify-between pb-4">
          <div className="flex flex-col space-y-1">
            {title && <h2 className="text-lg font-semibold leading-none tracking-tight">{title}</h2>}
            {description && <p className="text-sm text-text-secondary">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close drawer</span>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4">
          {children}
        </div>
      </div>
    </div>
  )
}
