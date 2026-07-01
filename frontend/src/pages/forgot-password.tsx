import { useState } from "react"
import { Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2 } from "lucide-react"

import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { apiClient } from "../api/client"

const forgotSchema = z.object({
  email: z.string().email("Please enter a valid email"),
})

type ForgotData = z.infer<typeof forgotSchema>

export function ForgotPasswordPage() {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotData>({
    resolver: zodResolver(forgotSchema),
  })

  const onSubmit = async (data: ForgotData) => {
    try {
      setStatus("idle")
      await apiClient.post("/auth/password/reset/", data)
      setStatus("success")
    } catch (err) {
      // For security, usually APIs return success even if email doesn't exist
      // But just in case
      setStatus("error")
    }
  }

  return (
    <Card className="w-full shadow-xl">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">Forgot Password</CardTitle>
        <CardDescription>
          Enter your email address and we'll send you a link to reset your password.
        </CardDescription>
      </CardHeader>
      
      {status === "success" ? (
        <CardContent className="space-y-4 pb-6 pt-4 text-center">
          <div className="p-4 bg-green-50 text-green-800 rounded-md">
            If an account with that email exists, we have sent a password reset link. Please check your inbox.
          </div>
          <div className="mt-6">
            <Link to="/login">
              <Button variant="outline" className="w-full">Return to login</Button>
            </Link>
          </div>
        </CardContent>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {status === "error" && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
                An error occurred. Please try again later.
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
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pt-4">
            <Button type="submit" className="w-full font-semibold shadow-lg shadow-primary/20" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending link...
                </>
              ) : (
                "Send Reset Link"
              )}
            </Button>
            <div className="text-center text-sm text-slate-500">
              Remember your password?{" "}
              <Link to="/login" className="font-medium text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </form>
      )}
    </Card>
  )
}
