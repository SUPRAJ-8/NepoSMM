"use client";

import React from "react";
import {
    Bell,
    Search,
    HelpCircle,
    Globe,
    Zap,
    ChevronDown,
    Coins,
    Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/context/CurrencyContext";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { LogOut, User, Settings, Shield } from "lucide-react";

export function AdminTopbar() {
    const { currency, setCurrency, availableCurrencies } = useCurrency();
    const [isCurrencyOpen, setIsCurrencyOpen] = React.useState(false);

    const handleLogout = () => {
        localStorage.removeItem("nepo_admin_token");
        localStorage.removeItem("nepo_admin_user");
        toast.info("Signed out successfully", {
            description: "Admin session terminated."
        });
        window.location.href = "/admin-login";
    };

    return (
        <header className="h-20 bg-[#0f172a]/50 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-8 sticky top-0 z-40">
            {/* Search Bar Area */}
            <div className="flex-1 max-w-xl">
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                    <Input
                        placeholder="Search for orders, users or services... (Cmd + K)"
                        className="w-full pl-11 h-11 bg-[#0a0e17] border-white/5 focus-visible:ring-purple-500/50 rounded-xl text-sm transition-all"
                    />
                </div>
            </div>

            {/* Quick Actions & Status */}
            <div className="flex items-center gap-6">
                {/* Currency Dropdown */}
                <div className="relative">
                    <Button
                        variant="ghost"
                        onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}
                        className={cn(
                            "h-11 px-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 gap-2 font-bold text-sm transition-all",
                            isCurrencyOpen && "bg-white/10 border-purple-500/30"
                        )}
                    >
                        <Coins className="h-4 w-4 text-purple-400" />
                        <span>{currency.code}</span>
                        <ChevronDown className={cn("h-3 w-3 text-gray-500 transition-transform", isCurrencyOpen && "rotate-180")} />
                    </Button>

                    {isCurrencyOpen && (
                        <>
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setIsCurrencyOpen(false)}
                            />
                            <div className="absolute right-0 mt-2 w-48 bg-[#0f172a] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-20 animate-in fade-in zoom-in duration-200">
                                <div className="p-2 space-y-1">
                                    {availableCurrencies.map((c) => (
                                        <button
                                            key={c.code}
                                            onClick={() => {
                                                setCurrency(c.code);
                                                setIsCurrencyOpen(false);
                                            }}
                                            className={cn(
                                                "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                                currency.code === c.code
                                                    ? "bg-purple-500/10 text-purple-400"
                                                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                                            )}
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="opacity-60">{c.symbol}</span>
                                                <span>{c.code}</span>
                                            </div>
                                            {currency.code === c.code && <Check className="h-3 w-3" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* System Status */}
                <div className="hidden lg:flex items-center gap-4 px-4 py-2 bg-green-500/5 border border-green-500/10 rounded-xl">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                    <div className="flex flex-col">
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider leading-none mb-1">System Status</span>
                        <span className="text-xs font-bold text-green-400 leading-none">ALL SYSTEMS LIVE</span>
                    </div>
                </div>

                {/* Vertical Divider */}
                <div className="h-8 w-[1px] bg-white/5 hidden sm:block"></div>

                {/* Icons Area */}
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white relative">
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-2 right-2 h-2 w-2 bg-purple-500 rounded-full border-2 border-[#0b1021]"></span>
                    </Button>
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white">
                        <Globe className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white">
                        <HelpCircle className="h-5 w-5" />
                    </Button>
                </div>

                {/* Profile Toggle */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div className="flex items-center gap-3 pl-4 border-l border-white/5 cursor-pointer group outline-none">
                            <div className="flex flex-col text-right">
                                <span className="text-sm font-bold text-white leading-tight">Super Admin</span>
                                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Administrator</span>
                            </div>
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform">
                                AD
                            </div>
                            <ChevronDown className="h-4 w-4 text-gray-500 group-hover:text-white transition-colors" />
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64 bg-[#0b1021] border-white/10 text-white rounded-2xl p-2 shadow-2xl backdrop-blur-xl">
                        <DropdownMenuLabel className="px-3 py-2">
                            <div className="flex flex-col">
                                <span className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] mb-1">Authenticated As</span>
                                <span className="text-sm font-bold text-white">Super Administrator</span>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-white/5 my-2" />
                        <DropdownMenuItem className="rounded-xl focus:bg-white/5 focus:text-white cursor-pointer flex items-center gap-3 px-3 py-3 transition-colors">
                            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                                <User size={16} />
                            </div>
                            <span className="font-bold text-sm">Admin Profile</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="rounded-xl focus:bg-white/5 focus:text-white cursor-pointer flex items-center gap-3 px-3 py-3 transition-colors">
                            <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                                <Settings size={16} />
                            </div>
                            <span className="font-bold text-sm">System Settings</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="rounded-xl focus:bg-white/5 focus:text-white cursor-pointer flex items-center gap-3 px-3 py-3 transition-colors">
                            <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                                <Shield size={16} />
                            </div>
                            <span className="font-bold text-sm">Security Logs</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-white/5 my-2" />
                        <DropdownMenuItem
                            onClick={handleLogout}
                            className="rounded-xl focus:bg-red-500 focus:text-white cursor-pointer flex items-center gap-3 px-3 py-3 text-red-400 transition-colors"
                        >
                            <div className="h-8 w-8 rounded-lg bg-red-500/10 flex items-center justify-center group-focus:bg-white/20">
                                <LogOut size={16} />
                            </div>
                            <span className="font-bold text-sm">Logout Session</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}