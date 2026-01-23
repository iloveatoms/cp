"use client";

import { useEffect, useState, FormEvent } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "react-toastify"
import { useAuthContext } from "@/lib/context/auth";
import Link from "next/link"

export default function LoginPage() {
  const {userProfile, setUserProfile} = useAuthContext();
  const [aadhaar, setAadhaar] = useState("")
  const [password, setPassword] = useState("")
  const [redirect, setRedirect] = useState("/")

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setRedirect(params.get("redirect") || "/")
  }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userid: aadhaar,
          password:password
        }),
      });

      const data = await res.json();

      if (data.authenticated === true) {
        localStorage.setItem("userid", String(aadhaar));
        setUserProfile(
          {
            ...userProfile,
            userid : data.userid
          }
        );
        toast.success("Login successful");
        setTimeout( ()=> {window.location.replace(redirect) }, 1000 )

      } else if (data.authenticated === false)
        { toast.error(data.reason ? data.reason : "Wrong password. Try Again") }
      }
      catch {
      toast.error("Network Error..")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center dark">
      <Card className="w-full max-w-md bg-dark shadow-xl rounded-2xl">
        <CardContent className="p-8 space-y-6">
          <h2 className="text-3xl font-semibold text-center text-[#2C6E49]">
            User Login
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Aadhaar</Label>
              <Input
                value={aadhaar}
                pattern="\d{1,}"
                title="Enter Aadhar Number only "
                onChange={(e) => setAadhaar(e.target.value)}
                required
              />
            </div>

            <div>
              <Label>Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full bg-[#2C6E49]">
              Login
            </Button>
          </form>

          <p className="text-center">
            New user?{" "}
            <Link
              className="text-green-600 underline"
              href="/register"
            >
              Register
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
