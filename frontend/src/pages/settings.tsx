import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, Save } from "lucide-react"

import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Switch } from "../components/ui/switch"
import { useAuth } from "../context/AuthContext"
import { apiClient } from "../api/client"

const passwordSchema = z.object({
  old_password: z.string().min(1, "Current password is required"),
  new_password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  confirm_password: z.string()
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"],
})

export function SettingsPage() {
  const { user, updateProfile } = useAuth()
  const [isSavingPrefs, setIsSavingPrefs] = useState(false)
  const [isSavingPwd, setIsSavingPwd] = useState(false)
  const [pwdError, setPwdError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState("")

  const { handleSubmit: handlePrefsSubmit, setValue, watch } = useForm({
    defaultValues: {
      profile: {
        receive_email_notifications: user?.profile?.receive_email_notifications ?? true,
        receive_marketing_emails: user?.profile?.receive_marketing_emails ?? false,
      }
    }
  })

  const { register: registerPwd, handleSubmit: handlePwdSubmit, reset: resetPwd, formState: { errors: pwdErrors } } = useForm({
    resolver: zodResolver(passwordSchema)
  })

  const onPrefsSubmit = async (data: any) => {
    try {
      setIsSavingPrefs(true)
      await updateProfile(data)
      setSuccessMsg("Preferences saved")
      setTimeout(() => setSuccessMsg(""), 3000)
    } catch (err) {
      console.error(err)
    } finally {
      setIsSavingPrefs(false)
    }
  }

  const onPwdSubmit = async (data: any) => {
    try {
      setIsSavingPwd(true)
      setPwdError(null)
      await apiClient.post("/auth/password/change/", data)
      setSuccessMsg("Password changed successfully")
      resetPwd()
      setTimeout(() => setSuccessMsg(""), 3000)
    } catch (err: any) {
      setPwdError(err.response?.data?.old_password?.[0] || "Failed to change password")
    } finally {
      setIsSavingPwd(false)
    }
  }

  if (!user) return null

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>

      {successMsg && (
        <div className="p-3 bg-green-50 text-green-700 rounded-md text-sm border border-green-200">
          {successMsg}
        </div>
      )}

      <form onSubmit={handlePrefsSubmit(onPrefsSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Configure how you receive notifications.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive emails about your account activity.</p>
              </div>
              <Switch 
                checked={watch("profile.receive_email_notifications")} 
                onChange={(e) => setValue("profile.receive_email_notifications", e.target.checked)} 
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Marketing Emails</Label>
                <p className="text-sm text-muted-foreground">Receive emails about new features and offers.</p>
              </div>
              <Switch 
                checked={watch("profile.receive_marketing_emails")} 
                onChange={(e) => setValue("profile.receive_marketing_emails", e.target.checked)} 
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end border-t pt-4">
            <Button type="submit" disabled={isSavingPrefs}>
              {isSavingPrefs ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Preferences
            </Button>
          </CardFooter>
        </Card>
      </form>

      <form onSubmit={handlePwdSubmit(onPwdSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>Update your password to keep your account secure.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pwdError && (
              <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm border border-red-200">
                {pwdError}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="old_password">Current Password</Label>
              <Input id="old_password" type="password" {...registerPwd("old_password")} />
              {pwdErrors.old_password && <p className="text-xs text-red-500">{pwdErrors.old_password.message as string}</p>}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="new_password">New Password</Label>
                <Input id="new_password" type="password" {...registerPwd("new_password")} />
                {pwdErrors.new_password && <p className="text-xs text-red-500">{pwdErrors.new_password.message as string}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm_password">Confirm New Password</Label>
                <Input id="confirm_password" type="password" {...registerPwd("confirm_password")} />
                {pwdErrors.confirm_password && <p className="text-xs text-red-500">{pwdErrors.confirm_password.message as string}</p>}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end border-t pt-4">
            <Button type="submit" disabled={isSavingPwd}>
              {isSavingPwd ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Change Password
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
