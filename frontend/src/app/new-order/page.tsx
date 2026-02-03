"use client";

import { useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Sidebar } from "@/components/dashboard/Sidebar"
import { WelcomeTour } from "@/components/dashboard/welcome-tour"
import { Header } from "@/components/header"
import { WelcomeBanner } from "@/components/welcome-banner"
import { StatsCards } from "@/components/stats-cards"
import { CategorySelector } from "@/components/category-selector"
import { OrderForm } from "@/components/order-form"
import { WhatsAppFloatButton } from "@/components/whatsapp-float-button"

function DashboardContent() {
    const searchParams = useSearchParams()
    const tabParam = searchParams.get("tab")
    const tab = (tabParam === "favorites" ? "recent" : tabParam) as "new" | "recent" | null
    const [selectedCategory, setSelectedCategory] = useState("all")

    return (
        <div className="min-h-screen bg-background text-foreground font-sans flex relative">
            <WelcomeTour />
            <Sidebar />
            <WhatsAppFloatButton />
            <div className="flex-1 lg:ml-64 flex flex-col min-w-0 transition-all duration-200">
                <Header />
                <main className="p-4 lg:p-6 space-y-6">
                    <WelcomeBanner />
                    <StatsCards />
                    <CategorySelector
                        selectedCategory={selectedCategory}
                        onCategoryChange={setSelectedCategory}
                    />
                    <OrderForm
                        defaultTab={tab || "new"}
                        selectedPlatform={selectedCategory}
                    />
                </main>
            </div>
        </div>
    )
}

export default function NewOrderPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        }>
            <DashboardContent />
        </Suspense>
    )
}