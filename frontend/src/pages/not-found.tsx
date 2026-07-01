import { Link } from "react-router-dom"
import { Button } from "../components/ui/button"

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center text-center px-4 bg-background">
      <h1 className="text-9xl font-bold tracking-tighter text-primary">404</h1>
      <h2 className="mt-4 text-2xl font-semibold text-foreground tracking-tight sm:text-3xl">Page not found</h2>
      <p className="mt-4 text-text-secondary max-w-[500px]">
        Sorry, we couldn't find the page you're looking for. It might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <div className="mt-8">
        <Link to="/">
          <Button size="lg">Go back home</Button>
        </Link>
      </div>
    </div>
  )
}
