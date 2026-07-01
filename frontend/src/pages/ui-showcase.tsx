import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { SearchInput } from "../components/ui/search-input"
import { CurrencyInput } from "../components/ui/currency-input"
import { Checkbox } from "../components/ui/checkbox"
import { Switch } from "../components/ui/switch"
import { Radio } from "../components/ui/radio"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { Info, AlertCircle, CheckCircle2 } from "lucide-react"

export function UIShowcasePage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">UI Components Showcase</h1>
        <p className="text-text-secondary mt-2">A preview of the DutyWise ZW design system foundation.</p>
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold border-b pb-2">Buttons</h2>
        <div className="flex flex-wrap gap-4 items-end">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="link">Link</Button>
          <Button isLoading>Loading</Button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold border-b pb-2">Badges</h2>
        <div className="flex flex-wrap gap-4">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="destructive">Destructive</Badge>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold border-b pb-2">Alerts</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Default Alert</AlertTitle>
            <AlertDescription>This is a standard alert message for general information.</AlertDescription>
          </Alert>
          <Alert variant="info">
            <Info className="h-4 w-4" />
            <AlertTitle>Info Alert</AlertTitle>
            <AlertDescription>Here is some helpful information to guide you.</AlertDescription>
          </Alert>
          <Alert variant="success">
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Success!</AlertTitle>
            <AlertDescription>Your calculation was saved successfully.</AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>There was a problem processing your request.</AlertDescription>
          </Alert>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold border-b pb-2">Form Elements</h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label>Standard Input</Label>
            <Input placeholder="Enter text..." />
          </div>
          <div className="space-y-2">
            <Label>Search Input</Label>
            <SearchInput placeholder="Search HS codes..." />
          </div>
          <div className="space-y-2">
            <Label>Currency Input</Label>
            <CurrencyInput placeholder="0.00" />
          </div>
          <div className="space-y-2">
            <Label error>Input with Error</Label>
            <Input error defaultValue="Invalid value" />
          </div>
          <div className="space-y-4 flex flex-col justify-center">
            <div className="flex items-center space-x-2">
              <Checkbox id="terms" />
              <Label htmlFor="terms">Accept terms and conditions</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="airplane-mode" />
              <Label htmlFor="airplane-mode">Airplane Mode</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Radio id="option-1" name="radio-group" defaultChecked />
              <Label htmlFor="option-1">Option 1</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Radio id="option-2" name="radio-group" />
              <Label htmlFor="option-2">Option 2</Label>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold border-b pb-2">Cards</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Standard Card</CardTitle>
              <CardDescription>Card description goes here</CardDescription>
            </CardHeader>
            <CardContent>
              <p>This is the main content of the card. It can contain any elements.</p>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Action</Button>
            </CardFooter>
          </Card>
        </div>
      </section>
    </div>
  )
}
