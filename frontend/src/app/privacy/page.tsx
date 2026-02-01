"use client";

import React, { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, ArrowLeft, Shield, Lock, Eye, Database, Globe, Share2, Menu, X, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PrivacyPage() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const sections = [
        {
            id: "collection",
            icon: Database,
            title: "1. Information We Collect",
            content: [
                "Account Information: When you register, we collect your username, email address, and password.",
                "Transaction Data: We collect details of payments and funds added to your account.",
                "Usage Data: We collect information about how you use our services, including order history and interactions.",
                "Technical Data: We may collect your IP address, browser type, and device information for security and optimization."
            ]
        },
        {
            icon: Eye,
            title: "2. How We Use Your Information",
            content: [
                "To provide and maintain our services, including processing orders and managing your account.",
                "To process payments and prevent fraudulent transactions.",
                "To communicate with you about your account, orders, and support requests.",
                "To improve our website, services, and user experience.",
                "To comply with legal obligations and protect our rights."
            ]
        },
        {
            icon: Shield,
            title: "3. Data Protection & Security",
            content: [
                "We implement industry-standard security measures to protect your personal data from unauthorized access, alteration, or disclosure.",
                "Passwords are encrypted using secure hashing algorithms (Bcrypt).",
                "Your payment information is handled through secure payment gateways and is not stored directly on our servers.",
                "While we strive for maximum security, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security."
            ]
        },
        {
            icon: Share2,
            title: "4. Information Sharing",
            content: [
                "We do not sell or rent your personal information to third parties.",
                "Information may be shared with trusted third-party service providers (e.g., payment processors, email services) only as necessary to provide our services.",
                "We may disclose information if required by law or to protect the safety and rights of our users or NepoSMM."
            ]
        },
        {
            icon: Globe,
            title: "5. Cookies & Tracking",
            content: [
                "We use cookies to enhance your browsing experience, remember your preferences, and analyze site traffic.",
                "You can choose to disable cookies through your browser settings, but some features of the site may not function correctly.",
                "We may use third-party analytics tools (like Google Analytics) to understand how users interact with NepoSMM."
            ]
        },
        {
            icon: Lock,
            title: "6. Your Privacy Rights",
            content: [
                "You have the right to access, update, or correct your personal information through your account settings.",
                "You may request the deletion of your account and personal data, subject to legal and contractual obligations.",
                "You can opt-out of promotional communications at any time."
            ]
        }
    ]

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id)
        if (element) {
            const offset = 100
            const bodyRect = document.body.getBoundingClientRect().top
            const elementRect = element.getBoundingClientRect().top
            const elementPosition = elementRect - bodyRect
            const offsetPosition = elementPosition - offset

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            })
        }
    }

    return (
        <div className="min-h-screen bg-[#020617] text-white selection:bg-primary/30 flex flex-col">
            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/20 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between relative z-50">
                    <Link href="/" className="flex items-center gap-2.5 group z-50">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-transform group-hover:rotate-12">
                            <Sparkles className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-xl font-black tracking-tighter">NepoSMM</span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden lg:flex items-center gap-8">
                        <Link href="/" className="text-sm font-bold text-gray-400 hover:text-white transition-colors">Home</Link>
                        <Link href="/terms" className="text-sm font-bold text-gray-400 hover:text-white transition-colors">Terms</Link>
                        <Link href="/privacy" className="text-sm font-bold text-white transition-colors">Privacy</Link>
                        <a href="/#contact" className="text-sm font-bold text-gray-400 hover:text-white transition-colors">Contact</a>
                    </div>

                    {/* Desktop Actions */}
                    <div className="hidden lg:flex items-center gap-4">
                        <Link href="/login">
                            <Button variant="ghost" className="font-bold text-gray-300 hover:text-white hover:bg-white/5">Sign In</Button>
                        </Link>
                        <Link href="/register">
                            <Button className="bg-primary hover:bg-blue-400 text-white font-black px-6 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.2)] transition-all active:scale-95">
                                Join Now
                            </Button>
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex lg:hidden items-center z-50">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="h-14 w-14 flex items-center justify-center rounded-xl text-white hover:bg-white/10 transition-colors"
                        >
                            {isMenuOpen ? <X className="size-10" /> : <Menu className="size-10" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Overlay */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "100vh" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="fixed inset-0 top-0 left-0 w-full bg-[#020617] pt-24 px-6 lg:hidden z-40 overflow-y-auto"
                        >
                            <div className="flex flex-col gap-6">
                                <Link href="/" onClick={() => setIsMenuOpen(false)} className="text-lg font-bold text-gray-400 hover:text-white transition-colors">Home</Link>
                                <Link href="/terms" onClick={() => setIsMenuOpen(false)} className="text-lg font-bold text-gray-400 hover:text-white transition-colors">Terms</Link>
                                <Link href="/privacy" onClick={() => setIsMenuOpen(false)} className="text-lg font-bold text-white transition-colors">Privacy</Link>
                                <Link href="/login" onClick={() => setIsMenuOpen(false)} className="w-full h-12 rounded-xl border border-white/10 flex items-center justify-center font-bold text-white">Sign In</Link>
                                <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                                    <Button className="w-full h-12 rounded-xl bg-primary text-white font-black">Get Started</Button>
                                </Link>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            <main className="flex-grow pt-32 pb-20 px-4">
                <div className="max-w-4xl mx-auto">
                    {/* Hero Section */}
                    <div className="text-center mb-16">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-block px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-widest mb-6"
                        >
                            Security & Trust
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-5xl lg:text-7xl font-black mb-6 tracking-tight"
                        >
                            Privacy <span className="text-primary text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-400">Policy</span>
                        </motion.h1>
                        <p className="text-gray-400 text-lg font-medium mb-10">Last updated: February 1, 2026</p>
                    </div>

                    {/* Content Sections */}
                    <div className="space-y-8">
                        {sections.map((section, idx) => (
                            <motion.div
                                key={idx}
                                id={section.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="p-8 lg:p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/10 hover:border-primary/20 transition-all group"
                            >
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-6 mb-6">
                                        <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <section.icon className="h-7 w-7 text-primary" />
                                        </div>
                                        <h2 className="text-2xl font-black group-hover:text-primary transition-colors italic uppercase tracking-tight">
                                            {section.title}
                                        </h2>
                                    </div>
                                    <div className="space-y-4">
                                        <ul className="space-y-4">
                                            {section.content.map((item, itemIdx) => (
                                                <li key={itemIdx} className="flex gap-3 text-gray-400 leading-relaxed text-lg font-medium transition-colors hover:text-gray-300">
                                                    <div className="h-2 w-2 rounded-full bg-primary/40 mt-3 flex-shrink-0" />
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Data Control Section */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="mt-16 p-10 rounded-[3rem] bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 text-center relative overflow-hidden"
                    >
                        <CheckCircle2 className="h-12 w-12 text-primary mx-auto mb-6" />
                        <h3 className="text-2xl font-black mb-4 uppercase italic tracking-tight">Your Data, Your Control</h3>
                        <p className="text-gray-300 text-lg mb-8 font-medium leading-relaxed">
                            Questions about your privacy? Contact our support team for any data-related inquiries.
                        </p>
                        <a href="mailto:support@neposmm.com">
                            <Button className="rounded-2xl px-12 h-14 bg-primary hover:bg-blue-600 font-black text-lg shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                                CONTACT SUPPORT
                            </Button>
                        </a>
                    </motion.div>
                </div>
            </main>

            {/* Footer */}
            <footer className="py-16 border-t border-white/5 bg-white/[0.01]">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <div className="flex flex-wrap justify-center gap-8 mb-8">
                        <Link href="/" className="text-gray-500 hover:text-white transition-colors text-sm font-medium">Home</Link>
                        <Link href="/terms" className="text-gray-500 hover:text-white transition-colors text-sm font-medium">Terms</Link>
                        <Link href="/privacy" className="text-white transition-colors text-sm font-medium">Privacy</Link>
                        <a href="/#contact" className="text-gray-500 hover:text-white transition-colors text-sm font-medium">Support</a>
                    </div>
                    <p className="text-sm text-gray-600 font-medium italic uppercase tracking-widest">
                        © 2026 NepoSMM. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    )
}
