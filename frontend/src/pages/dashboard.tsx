import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { FolderHeart, Calculator, Settings, ArrowRight } from "lucide-react"
import { Button } from "../components/ui/button"

export function DashboardPage() {
  return (
    <div className="flex flex-col space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Overview</h1>
        <p className="text-text-secondary mt-2">Welcome back to your DutyWise dashboard.</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saved Calculations</CardTitle>
            <FolderHeart className="h-4 w-4 text-text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-text-secondary mt-1">
              +2 from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Estimates</CardTitle>
            <Calculator className="h-4 w-4 text-text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-text-secondary mt-1">
              In the last 7 days
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Account Settings</CardTitle>
            <Settings className="h-4 w-4 text-text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Active</div>
            <p className="text-xs text-text-secondary mt-1">
              Pro plan
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your recent calculations and searches
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center">
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">Vehicle Import - Toyota Hilux</p>
                    <p className="text-sm text-text-secondary">
                      Estimated duty: $4,500.00
                    </p>
                  </div>
                  <div className="ml-auto font-medium">
                    <Button variant="ghost" size="icon">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
            <CardDescription>
              Helpful resources
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start">
              <Calculator className="mr-2 h-4 w-4" /> New Calculation
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <FolderHeart className="mr-2 h-4 w-4" /> View Saved Items
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
