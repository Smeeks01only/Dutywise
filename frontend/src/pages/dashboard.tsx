import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { FolderHeart, Calculator, Settings, ArrowRight, Loader2 } from "lucide-react"
import { Button } from "../components/ui/button"
import { useQuery } from '@tanstack/react-query'
import { getSavedCalculations } from '../api/calculator'
import { Link } from "react-router-dom"

export function DashboardPage() {
  const { data: calculations, isLoading } = useQuery({
    queryKey: ['savedCalculations', 'history'],
    queryFn: () => getSavedCalculations(true),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const history = calculations || [];
  const savedCalculationsCount = history.filter((c: any) => c.is_explicitly_saved).length;
  
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentEstimatesCount = history.filter((c: any) => new Date(c.created_at) > sevenDaysAgo).length;

  const recentActivity = history.slice(0, 3);

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: "USD",
    }).format(typeof amount === 'string' ? parseFloat(amount) : amount);
  };

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
            <div className="text-2xl font-bold">{savedCalculationsCount}</div>
            <p className="text-xs text-text-secondary mt-1">
              Total explicitly saved
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Estimates</CardTitle>
            <Calculator className="h-4 w-4 text-text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentEstimatesCount}</div>
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
              Standard User
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
            {recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent activity found.</p>
            ) : (
              <div className="space-y-8">
                {recentActivity.map((calc: any) => (
                  <div key={calc.id} className="flex items-center">
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {calc.product_name || calc.hs_code_str || "Custom Calculation"}
                        {calc.is_explicitly_saved && <span className="ml-2 text-xs text-blue-500 font-normal">(Saved)</span>}
                      </p>
                      <p className="text-sm text-text-secondary">
                        Estimated duty: {formatCurrency(parseFloat(calc.grand_total) - parseFloat(calc.total_customs_value))}
                      </p>
                    </div>
                    <div className="ml-auto font-medium">
                      <Button variant="ghost" size="icon" asChild>
                        <Link to="/dashboard/history">
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/calculator">
                <Calculator className="mr-2 h-4 w-4" /> New Calculation
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/dashboard/saved">
                <FolderHeart className="mr-2 h-4 w-4" /> View Saved Items
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
