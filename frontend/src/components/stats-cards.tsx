import { API_URL } from '@/lib/api-config'
"use client"

import { Wallet, ShoppingBag, Star, Crown } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import React, { useEffect, useState } from "react"
import { useCurrency } from "@/context/CurrencyContext"
import Link from "next/link"

export function StatsCards() {
  const { formatValue } = useCurrency();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("nepo_token");
        if (!token) return;

        const res = await fetch("${API_URL}/users/profile", {
          headers: { "Authorization": `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data);
          localStorage.setItem("nepo_user", JSON.stringify(data));
          // Dispatch event to update other components listening to storage
          window.dispatchEvent(new Event("userUpdate"));
        }
      } catch (e) {
        console.error("Failed to fetch profile", e);
      }
    };

    fetchProfile();

    const saved = localStorage.getItem("nepo_user");
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch (e) { }
    }

    const handleSync = () => {
      const updated = localStorage.getItem("nepo_user");
      if (updated) {
        try {
          setUser(JSON.parse(updated));
        } catch (e) { }
      }
    };
    window.addEventListener('userUpdate', handleSync);
    return () => window.removeEventListener('userUpdate', handleSync);
  }, []);

  const stats = [
    {
      icon: Wallet,
      label: "Balance",
      value: formatValue(user?.balance || 0),
      subtext: "Fill Balance",
      link: "/add-funds",
      color: "bg-emerald-500/10 text-emerald-500",
    },
    {
      icon: ShoppingBag,
      label: "Spent",
      value: formatValue(user?.spent || 0),
      subtext: "Check Orders",
      link: "/orders",
      color: "bg-amber-500/10 text-amber-500",
    },
    {
      icon: Star,
      label: "Affiliate AMT",
      value: formatValue(user?.affiliate_unpaid || 0),
      subtext: "Redeem Rewards",
      link: "/affiliates",
      color: "bg-blue-500/10 text-blue-500",
    },
    {
      icon: Crown,
      label: "Account Status",
      value: "New",
      subtext: "View Benefits",
      color: "bg-purple-500/10 text-purple-500",
    },
  ]

  return (
    <div className="grid gap-2 lg:gap-4 grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="bg-card border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 cursor-pointer group rounded-xl lg:rounded-2xl">
          <CardContent className="p-3 lg:p-4">
            <div className="flex items-center gap-2 lg:gap-3 mb-2 lg:mb-3">
              <div className={`rounded-lg p-1.5 lg:p-2 ${stat.color}`}>
                <stat.icon className="h-4 w-4 lg:h-5 lg:w-5" />
              </div>
              <p className="text-[10px] lg:text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {stat.label}
              </p>
            </div>
            <div>
              <p className="text-xl lg:text-2xl font-bold mb-1.5 lg:mb-2 text-foreground">{stat.value}</p>
              {stat.link ? (
                <Link href={stat.link} className="text-[10px] lg:text-xs font-bold text-primary hover:underline transition-colors inline-block">
                  {stat.subtext}
                </Link>
              ) : (
                <span className="text-[10px] lg:text-xs font-bold text-muted-foreground transition-colors cursor-default">
                  {stat.subtext}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
