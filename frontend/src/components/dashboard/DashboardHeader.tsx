import { API_URL } from '@/lib/api-config'
"use client";

import React from "react";
import {
    Calendar,
    Moon,
    Wallet,
    ChevronDown,
    Activity,
    LayoutGrid,
    Plus,
    LogOut
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/context/CurrencyContext";


export function DashboardHeader() {
    const { currency, setCurrency, formatValue, availableCurrencies } = useCurrency();
    const [isDarkMode, setIsDarkMode] = React.useState(true);
    const [isBalanceOpen, setIsBalanceOpen] = React.useState(false);
    const [isProfileOpen, setIsProfileOpen] = React.useState(false);
    const [user, setUser] = React.useState<any>(null);
    const router = useRouter();

    const [date, setDate] = React.useState("");

    React.useEffect(() => {
        // First, check localStorage for immediate (potentially stale) data
        const savedUser = localStorage.getItem("nepo_user");
        if (savedUser) {
            try {
                const parsed = JSON.parse(savedUser);
                setUser(parsed);
                console.log("DashboardHeader: Initial user from storage:", parsed);
            } catch (e) {
                console.error("DashboardHeader: Failed to parse saved user", e);
            }
        }

        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem("nepo_token");
                if (!token) {
                    console.log("DashboardHeader: No nepo_token found");
                    return;
                }

                const response = await fetch("${API_URL}/users/profile", {
                    headers: { "Authorization": `Bearer ${token}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log("DashboardHeader: Profile fetched:", data);

                    // Force balance to number if it's a string
                    if (data && data.balance !== undefined) {
                        data.balance = typeof data.balance === 'string' ? parseFloat(data.balance) : data.balance;
                    }

                    setUser(data);
                    localStorage.setItem("nepo_user", JSON.stringify(data));

                    // Notify other components (like Sidebar or main Dashboard)
                    window.dispatchEvent(new Event('userUpdate'));
                } else {
                    console.error("DashboardHeader: Profile fetch failed:", response.status);
                }
            } catch (error) {
                console.error("DashboardHeader: Error during fetch:", error);
            }
        };

        fetchProfile();

        // Listen for updates from other components
        const handleSync = () => {
            const updated = localStorage.getItem("nepo_user");
            if (updated) {
                try {
                    setUser(JSON.parse(updated));
                } catch (e) { }
            }
        };
        window.addEventListener('userUpdate', handleSync);

        setDate(new Date().toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }));

        return () => window.removeEventListener('userUpdate', handleSync);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("nepo_token");
        localStorage.removeItem("nepo_user");
        toast.info("Signed out successfully");
        window.location.href = "/";
    };

    return (
        <header className="h-20 bg-[#020617] border-b border-white/5 flex items-center justify-between px-8 sticky top-0 z-30">
            {/* Left: Dashboard Title */}
            <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                    <LayoutGrid className="h-5 w-5 text-emerald-500" />
                </div>
                <h1 className="text-xl font-bold text-white tracking-tight">Dashboard</h1>
            </div>

            {/* Middle: Total Order Pill */}
            <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
                <div className="relative pt-3">
                    {/* Label Badge */}
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 z-10">
                        <div className="bg-white px-2.5 py-0.5 rounded-full border border-gray-200 shadow-sm">
                            <span className="text-[10px] font-black text-[#020617] uppercase tracking-tighter whitespace-nowrap">Total Order</span>
                        </div>
                    </div>

                    {/* Main Pill */}
                    <div className="flex items-center gap-3 bg-[#10b981] px-4 py-2.5 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.3)] border border-white/10">
                        <div className="relative">
                            <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center">
                                <Activity className="h-3.5 w-3.5 text-white" />
                            </div>
                            <motion.div
                                animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute inset-0 rounded-full border-2 border-white/40"
                            />
                        </div>
                        <span className="text-sm font-black text-white tabular-nums tracking-wide">17,485,355</span>
                    </div>
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-4">
                {/* Date */}
                <div className="hidden lg:flex items-center gap-2.5 px-4 py-2 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-colors">
                    <Calendar className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm font-bold text-gray-300">{date}</span>
                </div>

                {/* Theme Toggle */}
                <div className="relative group">
                    <button
                        onClick={() => setIsDarkMode(!isDarkMode)}
                        className="h-10 w-[72px] bg-[#0f172a] border border-white/5 rounded-full relative flex items-center px-1.5 transition-all hover:border-emerald-500/30"
                    >
                        <motion.div
                            animate={{ x: isDarkMode ? 32 : 0 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            className="h-7 w-7 rounded-full bg-[#10b981] flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.4)] relative z-10"
                        >
                            <Moon className="h-4 w-4 text-white" />
                        </motion.div>
                        <div className="absolute inset-0 flex items-center justify-between px-3 text-gray-600">
                            <div className="h-1 w-1 rounded-full bg-gray-600" />
                            <div className="h-1 w-1 rounded-full bg-gray-600" />
                        </div>
                    </button>
                </div>

                {/* Balance & Currency Dropdown */}
                <div className="relative">
                    <div
                        onClick={() => setIsBalanceOpen(!isBalanceOpen)}
                        className={cn(
                            "flex items-center gap-3 px-4 py-2 bg-[#0f172a] border border-white/5 rounded-2xl cursor-pointer hover:bg-white/10 transition-all",
                            isBalanceOpen && "ring-2 ring-emerald-500/20 bg-white/10 border-emerald-500/20"
                        )}
                    >
                        <div className="h-8 w-8 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/10 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                            <Wallet className="h-4.5 w-4.5 text-emerald-500" />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-gray-400">≈</span>
                            <span className="text-sm font-black text-white">{formatValue(user?.balance || 0)}</span>
                        </div>
                        <ChevronDown className={cn("h-3.5 w-3.5 text-gray-500 transition-transform", isBalanceOpen && "rotate-180")} />
                    </div>

                    <AnimatePresence>
                        {isBalanceOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setIsBalanceOpen(false)} />
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute right-0 mt-3 w-60 bg-[#0f172a] border border-white/10 rounded-3xl shadow-2xl overflow-hidden z-50 p-2"
                                >
                                    {/* Add funds button */}
                                    <button
                                        onClick={() => {
                                            router.push('/add-funds');
                                            setIsBalanceOpen(false);
                                        }}
                                        className="w-full flex items-center gap-3 bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-2xl mb-3 transition-all group shadow-lg shadow-blue-600/20"
                                    >
                                        <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center group-hover:rotate-90 transition-transform">
                                            <Plus className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                                        </div>
                                        <span className="text-sm font-black whitespace-nowrap">Add funds</span>
                                    </button>

                                    {/* Currency List */}
                                    <div className="max-h-80 overflow-y-auto custom-scrollbar flex flex-col gap-0.5 relative pr-1">
                                        {/* Emerald side indicator line */}
                                        <div className="absolute right-0 top-0 bottom-0 w-[3px] bg-emerald-500/30 rounded-full" />

                                        {availableCurrencies.map((c) => (
                                            <button
                                                key={c.code}
                                                onClick={() => {
                                                    setCurrency(c.code);
                                                    setIsBalanceOpen(false);
                                                }}
                                                className={cn(
                                                    "w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all group",
                                                    currency.code === c.code
                                                        ? "bg-emerald-500/10 text-emerald-400"
                                                        : "text-gray-400 hover:bg-white/5 hover:text-white"
                                                )}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-sm font-black tabular-nums min-w-[32px]">{c.symbol}</span>
                                                    <span className="text-[11px] font-black uppercase tracking-widest opacity-60"> - {c.code}</span>
                                                </div>
                                                {currency.code === c.code && (
                                                    <motion.div layoutId="active" className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>

                {/* Profile */}
                <div className="relative">
                    <div
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-3 ml-2 cursor-pointer group p-2 rounded-2xl bg-transparent hover:bg-transparent active:bg-transparent"
                    >
                        <div className="hidden sm:flex flex-col items-end">
                            <span className="text-sm font-bold text-white uppercase pr-1 leading-none">{user?.username || "Guest"}</span>
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tight pr-1 mt-1">{user?.email || "guest@example.com"}</span>
                        </div>
                        <div className="relative">
                            <div className="h-11 w-11 rounded-2xl bg-white/5 flex items-center justify-center border-2 border-white/5 overflow-hidden text-gray-300 font-black transition-none">
                                {(user?.username || "G")[0].toUpperCase()}
                            </div>
                            <div className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-500 border-[3px] border-[#020617]" />
                        </div>
                        <ChevronDown className={cn("h-4 w-4 text-gray-500 transition-none", isProfileOpen && "rotate-180")} />
                    </div>

                    <AnimatePresence>
                        {isProfileOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute right-0 mt-3 w-48 bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 p-1.5"
                                >
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all text-sm font-bold"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        Logout Session
                                    </button>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    );
}
