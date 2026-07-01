import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { Loader2 } from "lucide-react"

import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { useAuth } from "../context/AuthContext"
import { registerSchema, type RegisterCredentials } from "../api/auth"

export function RegisterPage() {
  const { register: authRegister } = useAuth()
  const navigate = useNavigate()
  const [authError, setAuthError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterCredentials>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      country: "",
      password: "",
      confirmPassword: "",
    },
  })

  const onSubmit = async (data: RegisterCredentials) => {
    try {
      setAuthError(null)
      await authRegister(data)
      navigate("/dashboard")
    } catch (err: any) {
      if (err.response?.data?.email) {
        setAuthError(err.response.data.email[0])
      } else {
        setAuthError("Registration failed. Please check your information and try again.")
      }
    }
  }

  return (
    <Card className="w-full shadow-xl">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">Create an account</CardTitle>
        <CardDescription>
          Enter your information to create your account
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          
          {authError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
              {authError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className={errors.firstName ? "text-red-500" : ""}>First name</Label>
              <Input 
                id="firstName" 
                placeholder="John" 
                className={errors.firstName ? "border-red-500 focus-visible:ring-red-500" : ""}
                {...register("firstName")}
              />
              {errors.firstName && <p className="text-xs text-red-500">{errors.firstName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className={errors.lastName ? "text-red-500" : ""}>Last name</Label>
              <Input 
                id="lastName" 
                placeholder="Doe" 
                className={errors.lastName ? "border-red-500 focus-visible:ring-red-500" : ""}
                {...register("lastName")}
              />
              {errors.lastName && <p className="text-xs text-red-500">{errors.lastName.message}</p>}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email" className={errors.email ? "text-red-500" : ""}>Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="m@example.com" 
              className={errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}
              {...register("email")}
            />
            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="country" className={errors.country ? "text-red-500" : ""}>Country</Label>
            <Input 
              id="country" 
              placeholder="Zimbabwe" 
              className={errors.country ? "border-red-500 focus-visible:ring-red-500" : ""}
              {...register("country")}
            />
            {errors.country && <p className="text-xs text-red-500">{errors.country.message}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className={errors.password ? "text-red-500" : ""}>Password</Label>
            <Input 
              id="password" 
              type="password" 
              className={errors.password ? "border-red-500 focus-visible:ring-red-500" : ""}
              {...register("password")}
            />
            {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className={errors.confirmPassword ? "text-red-500" : ""}>Confirm Password</Label>
            <Input 
              id="confirmPassword" 
              type="password" 
              className={errors.confirmPassword ? "border-red-500 focus-visible:ring-red-500" : ""}
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 pt-4">
          <Button type="submit" className="w-full font-semibold shadow-lg shadow-primary/20" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create account"
            )}
          </Button>
          <div className="text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}
