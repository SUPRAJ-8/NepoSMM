"use client";

import React from "react";
import { Zap, AlertCircle, RefreshCw, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

export function DashboardTopBar() {
    const [currentTime, setCurrentTime] = React.useState("");

    React.useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            setCurrentTime(now.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            }));
        };
        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="h-10 bg-[#020617] border-b border-white/5 flex items-center justify-between px-8 relative overflow-hidden select-none">
            {/* Background Subtle Gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/[0.02] to-transparent pointer-events-none" />

            {/* Left: Status & Update Info */}
            <div className="flex items-center gap-6 z-10">
                <div className="flex items-center gap-2.5">
                    <div className="relative">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    </div>
                    <span className="text-[11px] font-black text-[#10b981] uppercase tracking-[0.1em]">
                        System Live
                    </span>
                </div>

                <div className="h-4 w-[1px] bg-white/5 hidden sm:block" />

                <div className="hidden md:flex items-center gap-2.5">
                    <div className="h-5 w-5 rounded-lg bg-purple-500/10 flex items-center justify-center border border-purple-500/10">
                        <RefreshCw className="h-3 w-3 text-purple-400" />
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Prices:</span>
                        <span className="text-[10px] font-black text-white uppercase tracking-wider bg-emerald-500/20 px-1.5 py-0.5 rounded-sm">Updated</span>
                    </div>
                    <span className="text-[10px] font-medium text-gray-600 tabular-nums">@{currentTime}</span>
                </div>
            </div>

            {/* Right: Ticker/News */}
            <div className="flex items-center gap-5 z-10">
                <div className="hidden lg:flex items-center gap-3 px-3 py-1 bg-white/[0.02] border border-white/5 rounded-lg">
                    <TrendingUp className="h-3.5 w-3.5 text-blue-400" />
                    <div className="overflow-hidden w-64">
                        <motion.div
                            animate={{ x: [256, -400] }}
                            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                            className="whitespace-nowrap text-[10px] font-black text-gray-400 uppercase tracking-widest"
                        >
                            New Service: Instagram Reels Views High Speed Added • Deposit Bonus 5% On Crypto • UPI Payments Now Active
                        </motion.div>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-orange-500/10 px-2.5 py-1 rounded-lg border border-orange-500/10 group cursor-pointer hover:bg-orange-500/20 transition-colors">
                    <Zap className="h-3 w-3 text-orange-400 fill-orange-400 group-hover:scale-110 transition-transform" />
                    <span className="text-[9px] font-black text-orange-400 uppercase italic tracking-tighter">Support: Online</span>
                </div>
            </div>
        </div>
    );
}