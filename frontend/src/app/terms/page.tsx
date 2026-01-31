"use client";

import React, { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, ArrowLeft, Shield, FileText, Scale, AlertCircle, ShoppingCart, RefreshCw, XCircle, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function TermsPage() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const sections = [
        {
            id: "general",
            icon: Shield,
            title: "1. Acceptance of Terms",
            content: "By using the services provided by NepoSMM, you agree to be bound by these Terms of Service. By registering or placing an order, you confirm that you have read, understood, and accepted all terms below. NepoSMM will not be responsible for any loss caused by failure to read these terms."
        },
        {
            icon: FileText,
            title: "2. General Terms",
            content: [
                "By placing an order with NepoSMM, you automatically accept all terms listed below, whether you have read them or not.",
                "NepoSMM reserves the right to change these Terms of Service at any time without prior notice. Users are responsible for reviewing the Terms of Service regularly to stay updated.",
                "NepoSMM rates are subject to change at any time without notice. The refund policy remains effective even if rates change.",
                "NepoSMM does not guarantee delivery time for any service. Delivery times shown are estimated only. Orders that are processing will not be refunded due to delays.",
                "NepoSMM reserves the right to modify or replace a service if necessary to complete an order."
            ]
        },
        {
            icon: ShoppingCart,
            title: "3. Service Usage Policy",
            content: [
                "NepoSMM services are intended only to promote social media accounts and improve online appearance.",
                "You agree to use NepoSMM in compliance with the Terms of Service of Instagram, Facebook, Twitter (X), YouTube, and any other social media platform.",
                "NepoSMM does not guarantee engagement (likes, comments, views) from followers. NepoSMM only guarantees delivery of the quantity purchased.",
                "We do not guarantee that all followers will have profile pictures, bios, or posts.",
                "Posting or promoting illegal, adult, hateful, or prohibited content is strictly forbidden.",
                "Private accounts are not eligible for refunds. Please ensure your account is public before ordering."
            ]
        },
        {
            icon: AlertCircle,
            title: "4. Order Rules (Important)",
            content: [
                "Do NOT place multiple orders for the same link at the same time. Always wait for the previous order to be Completed, Canceled, or Partial.",
                "Orders placed simultaneously on the same link will NOT be refunded and will be marked as completed.",
                "Start count is recorded when the order is placed. Orders will be marked completed once the target quantity is reached.",
                "We are not responsible if likes, views, or followers come from other sources during processing."
            ]
        },
        {
            icon: RefreshCw,
            title: "5. Refill & Drop Policy",
            content: [
                "If an order drops, please wait for refill, cancellation, or partial completion before placing a new order.",
                "If you delete content, change username, make the account private, or close the account: No refund or refill will be provided.",
                "Drops below start count after order completion are not eligible for refund or refill.",
                "If you used a No Refill or Drop service, refill requests will be rejected.",
                "If your account already had large numbers (10K / 100K / 200K+) before ordering, old drops are not eligible for refill.",
                "Drip-feed orders with insufficient time intervals may result in incorrect start counts. No refund or refill will be issued in such cases."
            ]
        },
        {
            icon: XCircle,
            title: "6. Liability Disclaimer",
            content: [
                "NepoSMM is not responsible for Account suspension, Content removal, or Any action taken by social media platforms. You use NepoSMM services at your own risk.",
                "NepoSMM is not liable for any damages, losses, or business impact resulting from service use."
            ]
        },
        {
            id: "refund",
            icon: Scale,
            title: "7. Refund Policy",
            content: [
                "Refunds are only provided in cases where NepoSMM fails to deliver the purchased service.",
                "Orders marked as Completed are not refundable.",
                "Violations of these Terms void refund eligibility."
            ]
        }
    ]

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id)
        if (element) {
            const offset = 100 // Navbar height
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
                        <Link href="/terms" className="text-sm font-bold text-white transition-colors">Terms</Link>
                        <a href="/#features" className="text-sm font-bold text-gray-400 hover:text-white transition-colors">About Us</a>
                        <a href="/#contact" className="text-sm font-bold text-gray-400 hover:text-white transition-colors">Contact Us</a>
                        <a href="/#faq" className="text-sm font-bold text-gray-400 hover:text-white transition-colors">FAQ</a>
                    </div>

                    {/* Desktop Actions */}
                    <div className="hidden lg:flex items-center gap-4">
                        <Link href="/login">
                            <Button variant="ghost" className="font-bold text-gray-300 hover:text-white hover:bg-white/5">Sign In</Button>
                        </Link>
                        <Link href="/register">
                            <Button className="bg-primary hover:bg-blue-400 text-white font-black px-6 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.2)] transition-all active:scale-95">
                                Get Started
                            </Button>
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex lg:hidden items-center z-50">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="h-14 w-14 flex items-center justify-center rounded-xl text-white hover:bg-white/10 transition-colors"
                        >
                            {isMenuOpen ? <X className="size-10" strokeWidth={2.5} /> : <Menu className="size-10" strokeWidth={2.5} />}
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
                                <div className="flex flex-col gap-4 border-b border-white/10 pb-6">
                                    <Link href="/" onClick={() => setIsMenuOpen(false)} className="text-lg font-bold text-gray-400 hover:text-white transition-colors">Home</Link>
                                    <Link href="/terms" onClick={() => setIsMenuOpen(false)} className="text-lg font-bold text-white transition-colors">Terms</Link>
                                    <a href="/#features" onClick={() => setIsMenuOpen(false)} className="text-lg font-bold text-gray-400 hover:text-white transition-colors">About Us</a>
                                    <a href="/#contact" onClick={() => setIsMenuOpen(false)} className="text-lg font-bold text-gray-400 hover:text-white transition-colors">Contact Us</a>
                                    <a href="/#faq" onClick={() => setIsMenuOpen(false)} className="text-lg font-bold text-gray-400 hover:text-white transition-colors">FAQ</a>
                                </div>

                                <div className="flex flex-col gap-4">
                                    <Link href="/login" onClick={() => setIsMenuOpen(false)} className="w-full h-12 rounded-xl border border-white/10 flex items-center justify-center font-bold text-white hover:bg-white/5 transition-all">
                                        Sign In
                                    </Link>
                                    <Link href="/register" onClick={() => setIsMenuOpen(false)} className="w-full">
                                        <Button className="w-full h-12 rounded-xl bg-primary hover:bg-blue-400 text-white font-black shadow-lg shadow-primary/20">
                                            Get Started
                                        </Button>
                                    </Link>
                                </div>
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
                            Legal Documentation
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-5xl lg:text-7xl font-black mb-6 tracking-tight"
                        >
                            Terms of <span className="text-primary text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-400">Service</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-gray-400 text-lg font-medium mb-10"
                        >
                            Last updated: January 27, 2026
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="flex flex-wrap items-center justify-center gap-4"
                        >
                            <Button
                                onClick={() => scrollToSection('general')}
                                className="rounded-xl bg-primary hover:bg-blue-600 text-white font-bold h-12 px-8 shadow-lg shadow-primary/20 transition-all hover:scale-105"
                            >
                                General
                            </Button>
                            <Button
                                onClick={() => scrollToSection('general')}
                                className="rounded-xl bg-primary hover:bg-blue-600 text-white font-bold h-12 px-8 shadow-lg shadow-primary/20 transition-all hover:scale-105"
                            >
                                Privacy
                            </Button>
                            <Button
                                onClick={() => scrollToSection('refund')}
                                className="rounded-xl bg-primary hover:bg-blue-600 text-white font-bold h-12 px-8 shadow-lg shadow-primary/20 transition-all hover:scale-105"
                            >
                                Refund Policy
                            </Button>
                        </motion.div>
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
                                    <div className="flex flex-row items-center gap-4 md:gap-6 mb-4 sm:mb-6">
                                        <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-inner">
                                            <section.icon className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
                                        </div>
                                        <h2 className="text-xl sm:text-2xl font-black group-hover:text-primary transition-colors italic uppercase tracking-tight text-left flex-1">
                                            {section.title}
                                        </h2>
                                    </div>
                                    <div className="space-y-4">
                                        {Array.isArray(section.content) ? (
                                            <ul className="space-y-4">
                                                {section.content.map((item, itemIdx) => (
                                                    <li key={itemIdx} className="flex gap-3 text-gray-400 leading-relaxed text-lg font-medium transition-colors hover:text-gray-300">
                                                        <div className="h-2 w-2 rounded-full bg-primary/40 mt-3 flex-shrink-0" />
                                                        <span>{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-gray-400 leading-relaxed text-lg font-medium text-left">
                                                {section.content}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Final Agreement */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="mt-16 p-10 rounded-[3rem] bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 text-center relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-primary/5 blur-3xl -z-10" />
                        <h3 className="text-2xl font-black mb-4 uppercase italic tracking-tight">Final Agreement</h3>
                        <p className="text-gray-300 text-lg mb-8 font-medium leading-relaxed">
                            By using NepoSMM, you acknowledge that you fully understand and agree to all terms above.
                        </p>
                        <Link href="/register">
                            <Button className="rounded-2xl px-12 h-14 bg-primary hover:bg-blue-600 font-black text-lg shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                                I AGREE & JOIN NOW
                            </Button>
                        </Link>
                    </motion.div>
                </div>
            </main>

            {/* Footer */}
            {/* Footer */}
            <footer className="py-16 border-t border-white/5 bg-white/[0.01]">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                        {/* Brand */}
                        <div className="md:col-span-1">
                            <div className="flex items-center gap-2 mb-4">
                                <Sparkles className="h-6 w-6 text-primary" />
                                <span className="text-lg font-black tracking-tighter">NepoSMM</span>
                            </div>
                            <p className="text-gray-500 text-sm font-medium">
                                The world's most trusted SMM panel for social media growth.
                            </p>
                        </div>

                        {/* Links */}
                        <div>
                            <h4 className="text-white font-black mb-4 text-sm uppercase tracking-wider">Links</h4>
                            <div className="flex flex-col gap-3">
                                <Link href="/" className="text-gray-500 hover:text-white transition-colors text-sm font-medium">Home</Link>
                                <a href="/#features" className="text-gray-500 hover:text-white transition-colors text-sm font-medium">About US</a>
                                <a href="/#testimonials" className="text-gray-500 hover:text-white transition-colors text-sm font-medium">Reviews</a>
                                <a href="/#faq" className="text-gray-500 hover:text-white transition-colors text-sm font-medium">FAQ</a>
                                <a href="/#contact" className="text-gray-500 hover:text-white transition-colors text-sm font-medium">Contact US</a>
                            </div>
                        </div>

                        {/* Legal */}
                        <div>
                            <h4 className="text-white font-black mb-4 text-sm uppercase tracking-wider">Legal</h4>
                            <div className="flex flex-col gap-3">
                                <Link href="/terms" className="text-gray-500 hover:text-white transition-colors text-sm font-medium">Terms</Link>
                                <Link href="/terms" className="text-gray-500 hover:text-white transition-colors text-sm font-medium">Privacy</Link>
                                <Link href="/terms#refund" className="text-gray-500 hover:text-white transition-colors text-sm font-medium">Refund Policy</Link>
                            </div>
                        </div>

                        {/* Support */}
                        <div>
                            <h4 className="text-white font-black mb-4 text-sm uppercase tracking-wider">Support</h4>
                            <div className="flex flex-col gap-3">
                                <a href="https://wa.me/9779866887714" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-colors text-sm font-medium">WhatsApp</a>
                                <a href="mailto:support@Neposmm.com" className="text-gray-500 hover:text-white transition-colors text-sm font-medium">Email Support</a>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="pt-8 border-t border-white/5 text-center">
                        <p className="text-sm text-gray-600 font-medium">
                            © 2026 NepoSMM. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    )
}