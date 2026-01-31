"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
    LayoutGrid,
    Users,
    Server,
    Banknote,
    ScrollText,
    Ticket,
    Settings,
    LogOut,
    Tag,
    CreditCard,
    Mail,
    MessageSquare
} from "lucide-react";

export function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = React.useState<any>(null);

    React.useEffect(() => {
        const savedUser = localStorage.getItem("nepo_admin_user");
        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch (e) {
                localStorage.removeItem("nepo_admin_user");
            }
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("nepo_admin_token");
        localStorage.removeItem("nepo_admin_user");
        toast.info("Signed out successfully");
        window.location.href = "/admin-login";
    };

    const menuGroups = [
        {
            title: "Overview",
            links: [
                { href: "/admin", label: "Dashboard", icon: LayoutGrid },
            ]
        },
        {
            title: "Management",
            links: [
                { href: "/admin/users", label: "Users & Members", icon: Users },
                { href: "/admin/api-config", label: "API Provider Config", icon: Server },
                { href: "/admin/categories", label: "Service Categories", icon: Tag },
            ]
        },
        {
            title: "Financials",
            links: [
                { href: "/admin/financials", label: "Funds & Transactions", icon: Banknote },
                { href: "/admin/financials/fund-manager", label: "Fund Manager", icon: CreditCard },
                { href: "/admin/affiliates", label: "Affiliate Manager", icon: Users },
                { href: "/admin/financials/reports", label: "Revenue Reports", icon: ScrollText },
            ]
        },
        {
            title: "System",
            links: [
                { href: "/admin/contact-links", label: "Contact Links", icon: MessageSquare },
                { href: "/admin/email-testing", label: "Email Testing", icon: Mail },
                { href: "/admin/support", label: "Support Tickets", icon: Ticket, badge: 24 },
                { href: "/admin/settings", label: "System Settings", icon: Settings },
            ]
        }
    ];

    return (
        <div className="w-64 bg-[#0a0e17] border-r border-white/5 h-screen flex flex-col fixed left-0 top-0 z-50">
            <div className="h-20 flex items-center px-6 border-b border-white/5 gap-3">
                <Link href="/admin" className="flex items-center gap-3">
                    <img
                        src="/logo.png"
                        alt="NepoSMM Logo"
                        className="h-9 w-auto object-contain"
                    />
                    <div className="flex flex-col">
                        <span className="font-bold text-white leading-tight">Admin Portal</span>
                        <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">{user?.role === 'admin' ? 'Super Admin' : 'Staff Member'}</span>
                    </div>
                </Link>
            </div>

            <div className="flex-1 py-6 px-4 space-y-8 overflow-y-auto">
                {menuGroups.map((group) => (
                    <div key={group.title} className="space-y-2">
                        <h3 className="px-4 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-3">
                            {group.title}
                        </h3>
                        <div className="space-y-1">
                            {group.links.map((link) => {
                                const isActive = pathname === link.href;
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={cn(
                                            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative",
                                            isActive
                                                ? "text-white"
                                                : "text-gray-400 hover:text-white hover:bg-white/5"
                                        )}
                                    >
                                        {isActive && (
                                            <motion.div
                                                layoutId="admin-sidebar-active"
                                                className="absolute left-0 w-1.5 h-6 bg-purple-500 rounded-r-full shadow-[0_0_15px_rgba(168,85,247,0.5)]"
                                            />
                                        )}
                                        <link.icon className={cn("h-5 w-5 transition-colors", isActive ? "text-purple-400" : "text-gray-500 group-hover:text-white")} />
                                        <span className="font-bold text-sm">{link.label}</span>
                                        {link.badge && (
                                            <span className="absolute right-3 bg-red-500/20 text-red-400 border border-red-500/20 text-[10px] font-black h-5 w-5 rounded-full flex items-center justify-center">
                                                {link.badge}
                                            </span>
                                        )}
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-4 border-t border-white/5">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 w-full px-4 py-3 rounded-xl transition-colors text-sm font-medium"
                >
                    <LogOut className="h-5 w-5" />
                    Logout
                </button>
            </div>
        </div>
    );
}