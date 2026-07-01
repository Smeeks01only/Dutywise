import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { Loader2, Save } from "lucide-react"

import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { useAuth } from "../context/AuthContext"

export function ProfilePage() {
  const { user, updateProfile } = useAuth()
  const [isSaving, setIsSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState("")

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      first_name: "",
      last_name: "",
      phone_number: "",
      country: "",
      preferred_currency: "USD",
      preferred_theme: "light",
      profile: {
        company_name: "",
        business_type: "",
        preferred_language: "en"
      }
    }
  })

  useEffect(() => {
    if (user) {
      reset({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        phone_number: (user as any).phone_number || "",
        country: user.country || "",
        preferred_currency: user.preferred_currency || "USD",
        preferred_theme: user.preferred_theme || "light",
        profile: {
          company_name: user.profile?.company_name || "",
          business_type: user.profile?.business_type || "",
          preferred_language: user.profile?.preferred_language || "en"
        }
      })
    }
  }, [user, reset])

  const onSubmit = async (data: any) => {
    try {
      setIsSaving(true)
      setSuccessMsg("")
      await updateProfile(data)
      setSuccessMsg("Profile updated successfully")
      setTimeout(() => setSuccessMsg(""), 3000)
    } catch (err) {
      console.error("Update failed", err)
    } finally {
      setIsSaving(false)
    }
  }

  if (!user) return null

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Profile</h2>
        <p className="text-muted-foreground">Manage your personal and business information.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your personal details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input id="first_name" {...register("first_name")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input id="last_name" {...register("last_name")} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone_number">Phone Number</Label>
                <Input id="phone_number" {...register("phone_number")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input id="country" {...register("country")} />
              </div>
            </div>
          </CardContent>

          <CardHeader className="pt-0">
            <CardTitle>Business Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company_name">Company Name</Label>
                <Input id="company_name" {...register("profile.company_name")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="business_type">Business Type</Label>
                <Input id="business_type" {...register("profile.business_type")} />
              </div>
            </div>
          </CardContent>

          <CardHeader className="pt-0">
            <CardTitle>Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="preferred_currency">Currency</Label>
                <Input id="preferred_currency" {...register("preferred_currency")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="preferred_theme">Theme</Label>
                <Input id="preferred_theme" {...register("preferred_theme")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="preferred_language">Language</Label>
                <Input id="preferred_language" {...register("profile.preferred_language")} />
              </div>
            </div>
            
            {successMsg && (
              <div className="p-3 bg-green-50 text-green-700 rounded-md text-sm mt-4">
                {successMsg}
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-end border-t pt-4">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Changes
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
