"use client";

import { useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Sidebar } from "@/components/dashboard/Sidebar"
import { WelcomeTour } from "@/components/dashboard/welcome-tour"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { WelcomeBanner } from "@/components/welcome-banner"
import { StatsCards } from "@/components/stats-cards"
import { CategorySelector } from "@/components/category-selector"
import { OrderForm } from "@/components/order-form"
import { WhatsAppFloatButton } from "@/components/whatsapp-float-button"
import { AlertCircle, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useEffect } from "react"

function DashboardContent() {
    const searchParams = useSearchParams()
    const tabParam = searchParams.get("tab")
    const tab = (tabParam === "favorites" ? "recent" : tabParam) as "new" | "recent" | null
    const [selectedCategory, setSelectedCategory] = useState("all")
    const [user, setUser] = useState<any>(null)

    useEffect(() => {
        const savedUser = localStorage.getItem("nepo_user")
        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser))
            } catch (e) { }
        }

        const handleUpdate = () => {
            const updated = localStorage.getItem("nepo_user")
            if (updated) {
                try {
                    setUser(JSON.parse(updated))
                } catch (e) { }
            }
        }
        window.addEventListener('userUpdate', handleUpdate)
        return () => window.removeEventListener('userUpdate', handleUpdate)
    }, [])

    return (
        <div className="min-h-screen bg-background text-foreground font-sans flex relative">
            <WelcomeTour />
            <Sidebar />
            <WhatsAppFloatButton />
            <div className="flex-1 lg:ml-64 flex flex-col min-w-0 transition-all duration-200">
                <Header />
                <main className="p-4 lg:p-6 space-y-6">
                    {user && !user.whatsapp && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4"
                        >
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                                    <AlertCircle className="h-5 w-5 text-amber-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-amber-200 tracking-tight">Missing WhatsApp Number!</p>
                                    <p className="text-xs text-amber-200/60 font-medium">Please provide your WhatsApp number for better support and faster updates.</p>
                                </div>
                            </div>
                            <Link href="/account" className="w-full md:w-auto">
                                <Button size="sm" className="w-full md:w-auto bg-amber-500 hover:bg-amber-600 text-black font-black rounded-xl flex items-center gap-2 group">
                                    <span>Complete Profile</span>
                                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </Button>
                            </Link>
                        </motion.div>
                    )}
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