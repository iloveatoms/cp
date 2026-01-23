"use client";

import { useEffect, useState, FormEvent } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "react-toastify"
import { useAuthContext } from "@/lib/context/auth";

export default function RegisterPage() {
  const {userProfile, setUserProfile} = useAuthContext();
  const [form, setForm] = useState({
    name: "",
    aadhaar: "",
    password: "",
    confirm: "",
  })

  const [redirect, setRedirect] = useState("/")

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setRedirect(params.get("redirect") || "/")
  }, [])

  const submit = async (e: FormEvent) => {
    e.preventDefault()

    if (form.password !== form.confirm) {
      toast.error("Passwords do not match")
      return
    }

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userid: form.aadhaar,
          name: form.name,
          password: form.password,
          aadhaar: form.aadhaar,
        }),
      });

      const data = await res.json();
      console.log(data);
      if (data.status === "created") {

        localStorage.setItem("userid", form.aadhaar);
        setUserProfile(
          {
            ...userProfile,
            userid : Number(form.aadhaar)
          }
        );

        toast.success("Registered successfully ");
        setTimeout(()=>{window.location.href = redirect},1500);
      }
      else if (data.status === "exists") { toast.error("User already exists") }
    }
     catch (err) { console.log(err) ; toast.error("Registration failed")
    }
  }

  return (
    <div className="dark min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 space-y-4">
          <h2 className="text-3xl font-semibold text-center">Register</h2>

          <form onSubmit={submit} className="space-y-4">
            <Input placeholder="Name" onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input placeholder="Aadhaar" onChange={(e) => setForm({ ...form, aadhaar: e.target.value })} />
            <Input type="password" placeholder="Password" onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <Input type="password" placeholder="Confirm Password" onChange={(e) => setForm({ ...form, confirm: e.target.value })} />
            <Button className="w-full">Register</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
