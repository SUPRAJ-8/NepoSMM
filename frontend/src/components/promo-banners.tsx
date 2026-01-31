"use client"

import { Gift, Bell, Star, ArrowRight, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useState } from "react"

const banners = [
  {
    id: 1,
    icon: Gift,
    title: "$5 Bonus",
    description: "Get $5 bonus for your first deposit over $20",
    cta: "Claim Now",
    gradient: "from-blue-500/20 to-indigo-500/20",
    iconBg: "bg-blue-500",
  },
  {
    id: 2,
    icon: Star,
    title: "Review Rewards",
    description: "Leave a review and earn $1 balance instantly",
    cta: "Write Review",
    gradient: "from-amber-500/20 to-orange-500/20",
    iconBg: "bg-amber-500",
  },
  {
    id: 3,
    icon: Bell,
    title: "New Services",
    description: "Check out our latest YouTube and TikTok services",
    cta: "View Services",
    gradient: "from-blue-500/20 to-cyan-500/20",
    iconBg: "bg-blue-500",
  },
]

export function PromoBanners() {
  const [dismissedBanners, setDismissedBanners] = useState<number[]>([])

  const visibleBanners = banners.filter((b) => !dismissedBanners.includes(b.id))

  if (visibleBanners.length === 0) return null

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {visibleBanners.map((banner) => (
        <Card
          key={banner.id}
          className={`relative overflow-hidden bg-gradient-to-br ${banner.gradient} border-border hover:border-primary/30 transition-colors`}
        >
          <button
            onClick={() => setDismissedBanners([...dismissedBanners, banner.id])}
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-background/50 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className={`rounded-xl ${banner.iconBg} p-2.5`}>
                <banner.icon className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm">{banner.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                  {banner.description}
                </p>
                <Button
                  variant="link"
                  className="h-auto p-0 text-xs text-primary mt-2"
                >
                  {banner.cta}
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
