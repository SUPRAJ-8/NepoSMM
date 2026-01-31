import { API_URL } from '@/lib/api-config'
"use client"

import { useState, Suspense, useEffect } from "react"
import { Sidebar } from "@/components/dashboard/Sidebar"
import { WelcomeTour } from "@/components/dashboard/welcome-tour"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
    Users,
    Wallet,
    TrendingUp,
    UserCheck,
    Eye,
    ExternalLink,
    Copy,
    CheckCircle2,
    Sparkles,
    MessageCircle
} from "lucide-react"
import { toast } from "sonner"
import { useCurrency } from "@/context/CurrencyContext"

function AffiliatesContent() {
    const { formatValue } = useCurrency()
    const [user, setUser] = useState<any>(null)
    const [referralLink, setReferralLink] = useState("https://neposmm.com/ref/loading...")
    const [unpaidEarnings, setUnpaidEarnings] = useState(0)
    const [commissionRate, setCommissionRate] = useState("2")

    const [stats, setStats] = useState<any>({
        unpaid_earnings: 0,
        total_referrals: 0,
        total_earnings: 0,
        conversions: 0,
        paid_referrals: 0
    })

    useEffect(() => {
        const savedUser = localStorage.getItem("nepo_user")
        if (savedUser) {
            try {
                const parsedUser = JSON.parse(savedUser)
                setUser(parsedUser)
                setReferralLink(`https://neposmm.com/ref/${parsedUser.username || parsedUser.id || 'user'}`)

                const token = localStorage.getItem("nepo_token")
                const headers = { "Authorization": `Bearer ${token}` }

                // Fetch stats
                fetch(`${API_URL}/affiliates/user/${parsedUser.id}/stats`, { headers })
                    .then(res => res.json())
                    .then(data => {
                        if (data) {
                            setStats(data)
                            setUnpaidEarnings(Number(data.unpaid_earnings || 0))
                        }
                    })
                    .catch(err => console.error("Error fetching affiliate stats", err))

                // Fetch public settings for commission rate
                fetch("${API_URL}/settings/public-contact-links")
                    .then(res => res.json())
                    .then(data => {
                        if (data && data.affiliate_commission_percentage) {
                            setCommissionRate(data.affiliate_commission_percentage)
                        }
                    })
                    .catch(err => console.error("Error fetching settings", err))
            } catch (e) {
                console.error("Failed to parse user", e)
            }
        }
    }, [])

    const copyToClipboard = () => {
        navigator.clipboard.writeText(referralLink)
        toast.success("Referral link copied to clipboard!")
    }

    const handlePayoutRequest = async () => {
        if (unpaidEarnings < 100) {
            toast.error(`Minimum payout is ${formatValue(100)}`);
            return;
        }

        const whatsapp = localStorage.getItem("nepo_contact_whatsapp") || "Not provided";

        try {
            const token = localStorage.getItem("nepo_token")
            const response = await fetch("${API_URL}/affiliates/request", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    userId: user.id,
                    amount: unpaidEarnings,
                    paymentInfo: `WhatsApp: ${whatsapp}`
                })
            });

            if (response.ok) {
                toast.success("Payout request submitted successfully!");
                setUnpaidEarnings(0); // Reset UI
            } else {
                toast.error("Failed to submit payout request");
            }
        } catch (error) {
            toast.error("An error occurred. Please try again later.");
        }
    }

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
            <WelcomeTour />
            <Sidebar />
            <div className="lg:pl-64 flex flex-col min-h-screen">
                <Header title="Referrals" />
                <main className="flex-1 p-4 lg:p-8 space-y-12 max-w-7xl mx-auto w-full">
                    {/* Header Section with subtle gradient background */}
                    <div className="relative overflow-hidden rounded-3xl bg-primary/5 p-8 lg:p-12 text-center border border-primary/10">
                        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-primary/10 blur-3xl opacity-50" />
                        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 h-64 w-64 rounded-full bg-primary/10 blur-3xl opacity-50" />

                        <div className="relative z-10 space-y-4">
                            <h1 className="text-4xl lg:text-6xl font-black tracking-tight text-foreground">
                                Refer & Earn
                            </h1>
                            <p className="text-muted-foreground text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed">
                                Share the <span className="text-primary font-semibold">NepoSMM</span> experience with your friends and earn <span className="text-primary font-bold">{commissionRate}% commission</span> on every single deposit they make.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 xl:items-start">
                        {/* 1. Referral Info Card */}
                        <div className="xl:col-span-7 order-1 space-y-8">
                            <Card className="border-border bg-card/40 backdrop-blur-md overflow-hidden border-2 shadow-2xl shadow-primary/5 transition-all hover:border-primary/20">
                                <CardContent className="p-8 space-y-8">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 rounded-lg bg-primary/10">
                                                <ExternalLink className="h-4 w-4 text-primary" />
                                            </div>
                                            <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Your Referral Link</p>
                                        </div>
                                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                            <div className="flex-1 px-4 py-3 rounded-xl bg-muted/50 border border-border font-mono text-primary font-medium break-all flex items-center justify-between">
                                                {referralLink}
                                            </div>
                                            <Button
                                                className="transition-all rounded-xl py-6"
                                                onClick={copyToClipboard}
                                            >
                                                <Copy className="h-4 w-4 mr-2" />
                                                Copy Link
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-8 border-t border-border/50">
                                        <div className="space-y-2">
                                            <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Commission Rate</p>
                                            <div className="flex items-center gap-3">
                                                <span className="text-4xl font-black text-primary">{commissionRate}%</span>
                                                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">Lifetime</Badge>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Minimum Payout</p>
                                            <p className="text-4xl font-black">{formatValue(100)}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* 2. Performance Stats Card (Mobile Order 2, Desktop Right Side) */}
                        <div className="xl:col-span-5 xl:col-start-8 xl:row-start-1 xl:row-span-2 order-2 sm:order-2">
                            <Card className="border-border bg-card shadow-2xl border-2 overflow-hidden xl:sticky xl:top-24 hover:border-primary/20 transition-all">
                                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
                                <CardHeader className="pt-10">
                                    <CardTitle className="text-xl font-bold text-center text-muted-foreground uppercase tracking-widest">Performance Stats</CardTitle>
                                </CardHeader>
                                <CardContent className="p-8 pt-4 space-y-10">
                                    {/* Stats List */}
                                    <div className="space-y-6">
                                        {[
                                            { label: "Total Earnings", value: formatValue(stats.total_earnings), icon: Wallet, color: "text-primary" },
                                            { label: "Unpaid Earnings", value: formatValue(unpaidEarnings), icon: Wallet, color: "text-orange-500" },
                                            { label: "Conversion Rate", value: `${stats.total_referrals > 0 ? ((stats.conversions / stats.total_referrals) * 100).toFixed(2) : '0.00'}%`, icon: TrendingUp, color: "text-emerald-500" },
                                            { label: "Paid Referrals", value: stats.paid_referrals.toString(), icon: UserCheck, color: "text-blue-500" },
                                            { label: "Total Referrals", value: stats.total_referrals.toString(), icon: Eye, color: "text-purple-500" },
                                        ].map((stat, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-muted/20 border border-border/50 group hover:border-primary/50 transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className={cn("h-12 w-12 rounded-xl bg-muted flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shadow-sm", stat.color)}>
                                                        <stat.icon className="h-6 w-6" />
                                                    </div>
                                                    <span className="font-bold text-muted-foreground group-hover:text-foreground transition-colors">{stat.label}</span>
                                                </div>
                                                <span className="text-2xl font-black">{stat.value}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Action Button */}
                                    <div className="pt-4">
                                        <Button
                                            className={cn(
                                                "w-full py-8 text-xl font-black text-white transition-all rounded-2xl group flex flex-col items-center justify-center gap-0.5",
                                                unpaidEarnings < 100 && "opacity-50 cursor-not-allowed grayscale"
                                            )}
                                            size="lg"
                                            onClick={handlePayoutRequest}
                                            disabled={unpaidEarnings < 100}
                                        >
                                            <span className="flex items-center gap-2">Request Payout <ExternalLink className="h-5 w-5" /></span>
                                            <span className="text-[10px] opacity-70 font-medium uppercase tracking-widest">
                                                Minimum Payout {formatValue(100)}
                                            </span>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* 3. How It Works Card */}
                        <div className="xl:col-span-7 order-3 space-y-8">
                            <Card className="border-border bg-card/40 backdrop-blur-md border-2 shadow-xl hover:border-primary/20 transition-all">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-2xl font-black flex items-center gap-3">
                                        <div className="h-8 w-1 bg-primary rounded-full" />
                                        How it works?
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-8 pt-4 space-y-8">
                                    <p className="text-muted-foreground text-lg leading-relaxed">
                                        Invite new clients to <span className="text-foreground font-semibold">NepoSMM</span> using your unique link. When they deposit funds, you automatically receive <span className="text-primary font-bold">{commissionRate}%</span> of their deposit amount as a reward.
                                    </p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {[
                                            { text: "Each member must be unique and authentic", icon: CheckCircle2 },
                                            { text: `Withdraw to balance after reaching ${formatValue(100)}`, icon: Wallet },
                                            { text: "to cash out click on request payout", icon: MessageCircle },
                                            { text: "Earnings are only for NepoSMM services", icon: Sparkles }
                                        ].map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border/50 group hover:bg-muted/50 transition-colors">
                                                <div className="shrink-0 h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                                    <item.icon className="h-5 w-5" />
                                                </div>
                                                <span className="text-sm font-medium leading-tight">{item.text}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-8 border-t border-border/10">
                                        <div className="flex items-center gap-3">
                                            <div className="h-12 w-12 flex items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/30">
                                                <Sparkles className="h-6 w-6 text-primary-foreground" />
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-black tracking-tighter text-foreground italic">NEPOSMM</h2>
                                                <p className="text-[10px] text-muted-foreground font-bold tracking-[0.2em] uppercase">Premium Referrals</p>
                                            </div>
                                        </div>

                                        <Button
                                            className="rounded-full bg-blue-500 hover:bg-blue-600 text-white font-bold px-10 py-6"
                                            onClick={() => {
                                                const whatsapp = localStorage.getItem("nepo_contact_whatsapp") || "9800000000";
                                                window.open(`https://wa.me/${whatsapp}?text=I%20want%20to%20request%20an%20affiliate%20payout.`, '_blank');
                                            }}
                                        >
                                            Support Ticket
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}

export default function AffiliatesPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        }>
            <AffiliatesContent />
        </Suspense>
    )
}
