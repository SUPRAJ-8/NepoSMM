"use client";

import { useState } from "react"
import { cn } from "@/lib/utils"
import {
    Layers,
    Instagram,
    Facebook,
    Youtube,
    Apple,
    Music2,
    Video,
    Send,
    Twitter,
    MessageSquare,
    ChevronDown,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const TikTokLogo = ({ className }: { className?: string }) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
)

const categories = [
    { id: "all", icon: Layers, label: "Everything", color: "bg-blue-500" },
    { id: "tiktok", icon: TikTokLogo, label: "TikTok", color: "bg-zinc-800" },
    { id: "instagram", icon: Instagram, label: "Instagram", color: "bg-gradient-to-br from-pink-500 to-orange-400" },
    { id: "facebook", icon: Facebook, label: "Facebook", color: "bg-blue-600" },
    { id: "youtube", icon: Youtube, label: "YouTube", color: "bg-red-600" },
    { id: "telegram", icon: Send, label: "Telegram", color: "bg-sky-500" },
    { id: "twitter", icon: Twitter, label: "X / Twitter", color: "bg-zinc-800" },
    { id: "spotify", icon: Music2, label: "Spotify", color: "bg-emerald-500" },
    { id: "reddit", icon: MessageSquare, label: "Reddit", color: "bg-orange-600" },
    { id: "apple", icon: Apple, label: "Apple Music", color: "bg-zinc-700" },
]

interface CategorySelectorProps {
    selectedCategory: string
    onCategoryChange: (category: string) => void
}

export function CategorySelector({ selectedCategory, onCategoryChange }: CategorySelectorProps) {
    const [isOpen, setIsOpen] = useState(true)

    return (
        <div className="space-y-4">
            {/* Unified Collapsible Header for all devices */}
            <div className="block">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full flex items-center justify-between bg-[#0f172a]/50 border border-white/5 rounded-2xl p-4"
                >
                    <span className="text-xl font-bold text-white tracking-tight">Choose a Category</span>
                    <div className={cn(
                        "h-8 w-8 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/20",
                        isOpen && "rotate-180"
                    )}>
                        <ChevronDown className="h-4 w-4 text-white" />
                    </div>
                </button>
            </div>

            {/* Grid View (Instant Toggle) */}
            {isOpen && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 pt-2">
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => {
                                onCategoryChange(category.id)
                            }}
                            className={cn(
                                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold relative overflow-hidden group",
                                selectedCategory === category.id
                                    ? "bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]"
                                    : "bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10 hover:border-white/10"
                            )}
                        >
                            <div className={cn(
                                "rounded-xl p-2 shrink-0 transition-transform group-hover:scale-110",
                                category.color,
                                selectedCategory === category.id && "bg-white/20"
                            )}>
                                <category.icon className="h-4 w-4 text-white" />
                            </div>
                            <span className="truncate">{category.label}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}