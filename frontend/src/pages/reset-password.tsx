import { useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2 } from "lucide-react"

import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { apiClient } from "../api/client"

const resetSchema = z.object({
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

type ResetData = z.infer<typeof resetSchema>

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  
  const uidb64 = searchParams.get("uid")
  const token = searchParams.get("token")
  
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetData>({
    resolver: zodResolver(resetSchema),
  })

  // If missing token or uid, show error
  if (!uidb64 || !token) {
    return (
      <Card className="w-full shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight text-red-600">Invalid Link</CardTitle>
          <CardDescription>
            This password reset link is invalid or has expired.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Link to="/forgot-password" className="w-full">
            <Button className="w-full">Request a new link</Button>
          </Link>
        </CardFooter>
      </Card>
    )
  }

  const onSubmit = async (data: ResetData) => {
    try {
      setStatus("idle")
      setErrorMsg(null)
      await apiClient.post("/auth/password/reset/confirm/", {
        uidb64,
        token,
        new_password: data.password
      })
      setStatus("success")
      setTimeout(() => navigate("/login"), 3000)
    } catch (err: any) {
      setStatus("error")
      setErrorMsg(err.response?.data?.detail || "An error occurred setting your new password.")
    }
  }

  return (
    <Card className="w-full shadow-xl">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">Set New Password</CardTitle>
        <CardDescription>
          Please enter your new password below.
        </CardDescription>
      </CardHeader>
      
      {status === "success" ? (
        <CardContent className="space-y-4 pb-6 pt-4 text-center">
          <div className="p-4 bg-green-50 text-green-800 rounded-md">
            Your password has been successfully reset. Redirecting to login...
          </div>
          <div className="mt-6">
            <Link to="/login">
              <Button variant="outline" className="w-full">Go to login now</Button>
            </Link>
          </div>
        </CardContent>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {status === "error" && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
                {errorMsg}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="password" className={errors.password ? "text-red-500" : ""}>New Password</Label>
              <Input 
                id="password" 
                type="password" 
                className={errors.password ? "border-red-500 focus-visible:ring-red-500" : ""}
                {...register("password")} 
              />
              {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className={errors.confirmPassword ? "text-red-500" : ""}>Confirm Password</Label>
              <Input 
                id="confirmPassword" 
                type="password" 
                className={errors.confirmPassword ? "border-red-500 focus-visible:ring-red-500" : ""}
                {...register("confirmPassword")} 
              />
              {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>}
            </div>

          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pt-4">
            <Button type="submit" className="w-full font-semibold shadow-lg shadow-primary/20" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Password"
              )}
            </Button>
          </CardFooter>
        </form>
      )}
    </Card>
  )
}
