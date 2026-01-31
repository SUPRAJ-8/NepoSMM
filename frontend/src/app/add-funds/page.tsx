"use client";

import { Sidebar } from "@/components/dashboard/Sidebar"
import { WelcomeTour } from "@/components/dashboard/welcome-tour"
import { Header } from "@/components/header"
import { AddFundsBanner } from "@/components/add-funds-banner"
import { FillBalanceCard } from "@/components/fill-balance-card"
import { SupportOptionsCard } from "@/components/support-options-card"


export default function AddFundsPage() {
  return (
    <div className="min-h-screen bg-background">
      <WelcomeTour />
      <Sidebar />
      <div className="lg:pl-64">
        <Header title="Add Funds" showBadge={false} />
        <main className="p-3 sm:p-4 lg:p-6 space-y-6">
          <AddFundsBanner />
          <div className="grid gap-6 grid-cols-1 xl:grid-cols-[1fr,380px]">
            <FillBalanceCard />
            <div className="space-y-6">
              <SupportOptionsCard />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}