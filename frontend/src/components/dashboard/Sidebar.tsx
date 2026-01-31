"use client";

import React, { useEffect } from "react"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import {
    Plus,
    History,
    Wallet,
    Package,
    Layers,
    UserCheck,
    MessageCircle,
    Menu,
    X,
    LogOut,
    Shield,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useContactLinks } from "@/contexts/ContactLinksContext"
import { useCurrency } from "@/context/CurrencyContext"

interface NavItem {
    icon: React.ElementType
    label: string
    href?: string
    active?: boolean
    badge?: string
}

const navItems: NavItem[] = [
    { icon: Plus, label: "New Order", href: "/" },
    { icon: Wallet, label: "Add Funds", href: "/add-funds" },
    { icon: History, label: "Orders History", href: "/orders" },
    { icon: Layers, label: "Mass Order", href: "/mass-order" },
    { icon: Package, label: "Services", href: "/services" },
    { icon: UserCheck, label: "Affiliates", href: "/affiliates" },
    { icon: MessageCircle, label: "Tickets", href: "/tickets" },
]
export function Sidebar() {
    const { contactLinks } = useContactLinks()
    const [mobileOpen, setMobileOpen] = useState(false)
    const [user, setUser] = useState<any>(null)
    const router = useRouter()
    const pathname = usePathname()
    const { currency } = useCurrency()

    useEffect(() => {
        const handleOpen = () => setMobileOpen(true)
        const handleClose = () => setMobileOpen(false)
        window.addEventListener("openSidebar", handleOpen)
        window.addEventListener("closeSidebar", handleClose)
        return () => {
            window.removeEventListener("openSidebar", handleOpen)
            window.removeEventListener("closeSidebar", handleClose)
        }
    }, [])

    useEffect(() => {
        const savedUser = localStorage.getItem("nepo_user")
        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser))
            } catch (e) {
                localStorage.removeItem("nepo_user")
            }
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
    }, [])

    const handleLogout = () => {
        localStorage.removeItem("nepo_token")
        localStorage.removeItem("nepo_user")
        toast.info("Signed out successfully")
        window.location.href = "/"
    }

    return (
        <>
            <Button
                variant="ghost"
                id="tour-mobile-menu-trigger"
                className={cn(
                    "fixed top-[10.5px] left-4 z-50 lg:hidden h-11 w-11 p-0 flex items-center justify-center hover:bg-primary/10 transition-all duration-300",
                    mobileOpen ? "opacity-0 pointer-events-none" : "opacity-100"
                )}
                onClick={() => setMobileOpen(true)}
            >
                <Menu className="size-9" strokeWidth={2.5} />
            </Button>

            {/* Overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed left-0 top-0 z-[60] flex h-screen w-64 flex-col border-r border-border/50 dark:border-white/5 bg-sidebar transition-transform duration-300 lg:translate-x-0 lg:z-40",
                    mobileOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                {/* Logo */}
                <div className="flex h-16 items-center justify-between px-4 border-b border-border/50 dark:border-white/5">
                    <Link href="/" className="flex items-center gap-2">
                        <img
                            src="/logo.png"
                            alt="NepoSMM Logo"
                            className="h-8 w-auto object-contain"
                        />
                        <h1 className="text-xl font-bold text-foreground">NepoSMM</h1>
                    </Link>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setMobileOpen(false)}
                        className="lg:hidden h-10 w-10 min-w-[40px] flex items-center justify-center -mr-1"
                    >
                        <X className="size-7" strokeWidth={2.5} />
                    </Button>
                </div>

                {/* User info */}
                <div className="px-4 py-6 border-b border-border/50 dark:border-white/5">
                    <div className="mb-4">
                        <p className="text-lg font-black text-foreground ml-1">{user?.username || "Guest User"}</p>
                    </div>
                    {/* Balance Card */}
                    <div className="bg-primary rounded-3xl p-5 shadow-lg shadow-primary/20 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/70 mb-1">
                            Balance: ≈ {currency.symbol}
                        </p>
                        <p className="text-2xl font-black text-white leading-tight">
                            {Number(user?.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const id = `tour-sidebar-${item.label.toLowerCase().replace(/\s+/g, '-')}`;
                        return (
                            <Link
                                key={`${item.label}-${item.href}`}
                                href={item.href || "#"}
                                id={id}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-4 py-2.5 text-base transition-all relative group",
                                    isActive
                                        ? "text-primary font-bold bg-primary/5"
                                        : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                                )}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="sidebar-active-indicator"
                                        className="absolute left-0 w-1 h-5 bg-primary rounded-r-full"
                                    />
                                )}
                                <item.icon className={cn("h-4 w-4 transition-colors", isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary")} />
                                <span>{item.label}</span>
                                {item.badge && (
                                    <span className="ml-auto rounded-full bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 text-[10px] font-black uppercase tracking-tighter shrink-0">
                                        {item.badge}
                                    </span>
                                )}
                            </Link>
                        )
                    })}
                </nav>

                {/* Support CTA */}
                <div className="p-4 border-t border-border/50 dark:border-white/5">
                    <div className="rounded-xl bg-primary/10 p-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                                <MessageCircle className="h-5 w-5 text-primary-foreground" />
                            </div>
                            <div>
                                <p className="text-sm font-medium">Need Help?</p>
                                <p className="text-xs text-muted-foreground">24/7 Support</p>
                            </div>
                        </div>
                        <Button
                            className="w-full mt-3"
                            size="sm"
                            onClick={() => {
                                if (contactLinks.whatsapp_number) {
                                    window.open(`https://wa.me/${contactLinks.whatsapp_number}`, '_blank');
                                }
                            }}
                        >
                            Contact Us
                        </Button>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 w-full px-4 py-3 rounded-xl transition-colors text-base font-bold mt-2"
                    >
                        <LogOut className="size-5" />
                        Logout
                    </button>
                </div>
            </aside>
        </>
    )
}