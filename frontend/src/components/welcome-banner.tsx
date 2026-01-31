"use client"

import { useState, useEffect } from "react"
import { Sparkles, ArrowRight, BadgeCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export function WelcomeBanner() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const savedUser = localStorage.getItem("nepo_user")
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (e) {
        // ignore error
      }
    }
  }, [])

  return (
    <Card className="relative overflow-hidden border-border/10 bg-gradient-to-r from-primary to-primary/90">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <CardContent className="py-3 pr-6 relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-10 bg-white rounded-r-full" />
        <div className="space-y-1 pl-6">
          <div className="flex items-center gap-2">
            <h2 className="text-xl text-white">
              Welcome back, <span className="font-bold">{user?.username || "User"}</span>
            </h2>
            <BadgeCheck className="h-5 w-5 text-emerald-500 fill-white" />
          </div>
          <p className="text-sm text-white/90 font-medium max-w-md">
            We are here to provide you with the best services that you deserve.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
