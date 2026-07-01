import { Link, useNavigate, useLocation } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { Loader2 } from "lucide-react"

import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Checkbox } from "../components/ui/checkbox"
import { useAuth } from "../context/AuthContext"
import { loginSchema, type LoginCredentials } from "../api/auth"

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [authError, setAuthError] = useState<string | null>(null)
  
  const from = location.state?.from?.pathname || "/dashboard"

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginCredentials>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  })

  const onSubmit = async (data: LoginCredentials) => {
    try {
      setAuthError(null)
      await login(data)
      navigate(from, { replace: true })
    } catch (err: any) {
      if (err.response?.status === 401) {
        setAuthError("Invalid email or password.")
      } else {
        setAuthError("An unexpected error occurred. Please try again.")
      }
    }
  }

  return (
    <Card className="w-full shadow-xl">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">Welcome back</CardTitle>
        <CardDescription>
          Enter your email and password to sign in
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          
          {authError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
              {authError}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className={errors.email ? "text-red-500" : ""}>Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="m@example.com" 
              className={errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}
              {...register("email")} 
            />
            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className={errors.password ? "text-red-500" : ""}>Password</Label>
              <Link to="/forgot-password" className="text-sm font-medium text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <Input 
              id="password" 
              type="password" 
              className={errors.password ? "border-red-500 focus-visible:ring-red-500" : ""}
              {...register("password")} 
            />
            {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox id="remember" {...register("rememberMe")} />
            <Label htmlFor="remember" className="text-sm font-normal text-slate-500 cursor-pointer">
              Remember me for 30 days
            </Label>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 pt-4">
          <Button type="submit" className="w-full font-semibold shadow-lg shadow-primary/20" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>
          <div className="text-center text-sm text-slate-500">
            Don't have an account?{" "}
            <Link to="/register" className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}
