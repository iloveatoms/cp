"use client"
import { useEffect, useState, ChangeEvent, FormEvent } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"


export default function LoginForm() {
  const [formData, setFormData] = useState({
    aadhaar: "",
    password: "",
  })

  useEffect(() => {
  const savedAadhaar = localStorage.getItem("aadhaar") || "000000000000"
    if (savedAadhaar) {
      setFormData((prev) => ({
        ...prev,
        aadhaar: savedAadhaar,
      }))
    }
  }, [])

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    // POST to /api/login
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F9FA] px-4">
      <Card className="w-full max-w-md bg-white border border-[#E1F1E4] rounded-3xl shadow-[0_30px_70px_rgba(0,0,0,0.08)]">
        <CardContent className="p-8 space-y-6">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-[#007ACC]">
              Secure Access
            </p>
            <h2 className="text-3xl font-semibold text-[#2C6E49]">User Login</h2>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4" action={'/api/login'} method="POST">
            <div>
              <Label htmlFor="aadhaar">Aadhaar Number</Label>
              <Input
                id="aadhaar"
                type="number"
                name="aadhaar"
                placeholder="Enter 12-digit Aadhaar"
                value={formData.aadhaar}
                onChange={handleChange}
                maxLength={12}
                minLength={12}
                required
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full rounded-full bg-[#2C6E49] text-white py-3 text-base font-semibold hover:bg-[#24573A]"
            >
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
