import { Sun } from "lucide-react"
import { Button } from "./button"

export function ThemeToggle() {
  return (
    <Button
      variant="outline"
      size="icon"
      title="Theme (Light Mode Only)"
      className="text-text-secondary"
    >
      <Sun className="h-4 w-4" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}

