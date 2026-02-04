"use client";

import React, { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence, useMotionValue, animate, useInView } from "framer-motion"
import {
    Sparkles, ArrowRight, Zap, ShieldCheck, Globe,
    TrendingUp, Star, Users, CheckCircle2,
    Mail, Lock, Eye, EyeOff, Phone, MapPin,
    Menu, X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { toast } from "sonner"
import NewOrderPage from "./new-order/page"
import { API_URL } from "@/lib/api-config"
import { useContactLinks } from "@/contexts/ContactLinksContext"
import { GoogleLogin, CredentialResponse } from "@react-oauth/google"


export default function LandingPage() {
    const { contactLinks } = useContactLinks()
    const router = useRouter()
    const [showPassword, setShowPassword] = useState(false)
    const [user, setUser] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [isForgotMode, setIsForgotMode] = useState(false)
    const [forgotIdentifier, setForgotIdentifier] = useState("")
    const [isForgotLoading, setIsForgotLoading] = useState(false)
    const [is2FAMode, setIs2FAMode] = useState(false)
    const [otp, setOtp] = useState("")
    const [tempUserId, setTempUserId] = useState<number | null>(null)

    const [isMounted, setIsMounted] = useState(false)
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    useEffect(() => {
        setIsMounted(true)
        const savedUser = localStorage.getItem("nepo_user")
        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser))
            } catch (e) {
                localStorage.removeItem("nepo_user")
            }
        }

        // Handle hash scrolling on page load
        if (typeof window !== 'undefined' && window.location.hash) {
            const id = window.location.hash.substring(1)
            setTimeout(() => {
                const element = document.getElementById(id)
                if (element) {
                    element.scrollIntoView({ behavior: "smooth" })
                }
            }, 500)
        }
    }, [])

    function NumberTicker({ value, decimals = 0, suffix = "" }: { value: number; decimals?: number; suffix?: string }) {
        const ref = useRef(null)
        const isInView = useInView(ref, { once: true, margin: "-100px" })
        const [displayValue, setDisplayValue] = useState("0")

        useEffect(() => {
            if (isInView) {
                const controls = animate(0, value, {
                    duration: 2,
                    ease: "easeOut",
                    onUpdate: (latest) => {
                        const formatted = latest.toFixed(decimals)
                        if (decimals === 0) {
                            setDisplayValue(parseInt(formatted).toLocaleString())
                        } else {
                            setDisplayValue(formatted)
                        }
                    }
                })
                return () => controls.stop()
            }
        }, [isInView, value, decimals])

        return <span ref={ref}>{displayValue}{suffix}</span>
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const response = await fetch(`${API_URL}/users/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    password,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Login failed")
            }

            if (data.twoFactorRequired) {
                setIs2FAMode(true)
                setTempUserId(data.userId)
                toast.info("2-Step Verification Required", {
                    description: "An OTP has been sent to your registered email address.",
                })
                setIsLoading(false)
                return
            }

            localStorage.setItem("nepo_token", data.token)
            localStorage.setItem("nepo_user", JSON.stringify(data.user))
            setUser(data.user)

            toast.success("Welcome back!", {
                description: `Successfully signed in as ${data.user.username || data.user.email}.`,
            })

            router.push("/")
        } catch (error: any) {
            toast.error(error.message || "Invalid credentials. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    const handleVerify2FA = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const response = await fetch(`${API_URL}/users/verify-2fa`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId: tempUserId,
                    otp,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Verification failed")
            }

            localStorage.setItem("nepo_token", data.token)
            localStorage.setItem("nepo_user", JSON.stringify(data.user))
            setUser(data.user)

            toast.success("Welcome back!", {
                description: `Successfully signed in as ${data.user.username || data.user.email}.`,
            })

            router.push("/")
        } catch (error: any) {
            toast.error(error.message || "Invalid OTP. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsForgotLoading(true)

        try {
            const response = await fetch(`${API_URL}/users/forgot-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    identifier: forgotIdentifier,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Failed to process request")
            }

            toast.success("Reset link sent!", {
                description: data.message,
            })
            setIsForgotMode(false)
            setForgotIdentifier("")
        } catch (error: any) {
            toast.error(error.message || "Something went wrong. Please try again.")
        } finally {
            setIsForgotLoading(false)
        }
    }

    const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
        if (!credentialResponse.credential) return;

        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/users/google-login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ credential: credentialResponse.credential }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Google login failed");

            localStorage.setItem("nepo_token", data.token);
            localStorage.setItem("nepo_user", JSON.stringify(data.user));
            setUser(data.user);

            toast.success("Welcome back!", {
                description: `Successfully signed in as ${data.user.username || data.user.email} with Google.`,
            });

            router.push("/");
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("nepo_token")
        localStorage.removeItem("nepo_user")
        setUser(null)
        toast.info("Signed out successfully")
    }
    if (!isMounted) return <div className="min-h-screen bg-[#020617]" />

    if (user) {
        return <NewOrderPage />
    }

    return (
        <div className="min-h-screen bg-[#020617] text-white selection:bg-emerald-500/30 overflow-x-hidden">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "WebSite",
                        "name": "NepoSMM",
                        "url": "https://neposmm.com",
                        "description": "Boost your social media presence with NepoSMM. High-quality Followers, Likes, Views, and Watch Time.",
                        "potentialAction": {
                            "@type": "SearchAction",
                            "target": "https://neposmm.com/services?search={search_term_string}",
                            "query-input": "required name=search_term_string"
                        }
                    })
                }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Organization",
                        "name": "NepoSMM",
                        "url": "https://neposmm.com",
                        "logo": "https://neposmm.com/logo.png",
                        "contactPoint": {
                            "@type": "ContactPoint",
                            "telephone": "+977-9866887714",
                            "contactType": "customer service",
                            "availableLanguage": ["English", "Nepali"]
                        }
                    })
                }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "FAQPage",
                        "mainEntity": [
                            {
                                "@type": "Question",
                                "name": "What is an SMM Panel?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "An SMM (Social Media Marketing) panel is an online platform where you can purchase social media services like followers, likes, views, and comments to boost your online presence effectively and affordably."
                                }
                            },
                            {
                                "@type": "Question",
                                "name": "Is it safe to use NepoSMM services?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "Yes, absolutely! We prioritize your account's safety. We use high-quality accounts and safe delivery methods that comply with social media platform guidelines to ensure your account remains secure."
                                }
                            },
                            {
                                "@type": "Question",
                                "name": "How can I deposit funds?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "We offer a wide range of payment methods including Credit/Debit Cards, Cryptocurrency, and various local Nepalese payment options like Khalti, eSewa, and IME Pay for your convenience."
                                }
                            },
                            {
                                "@type": "Question",
                                "name": "What happens if my followers drop?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "Many of our 'Guaranteed' services come with a refill warranty. If you experience any drops within the guarantee period, simply use the refill button on your order page, and we'll restore the lost numbers for free."
                                }
                            },
                            {
                                "@type": "Question",
                                "name": "Do you offer API support for resellers?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "Yes, we provide a robust and fully documented API that allows you to resell our services directly through your own panel or website. It's perfectly designed for scaling your own SMM business."
                                }
                            }
                        ]
                    })
                }}
            />
            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/20 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between relative z-50">
                    <Link href="/" className="flex items-center gap-2.5 group z-50">
                        <img
                            src="/logo.png"
                            alt="NepoSMM - #1 SMM Panel in Nepal"
                            className="h-10 w-auto object-contain transition-transform group-hover:scale-110"
                        />
                        <span className="text-xl font-black tracking-tighter">NepoSMM</span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden xl:flex items-center gap-8">
                        <Link href="/" className="text-sm font-bold text-gray-400 hover:text-white transition-colors">Home</Link>
                        <Link href="/terms" className="text-sm font-bold text-gray-400 hover:text-white transition-colors">Terms</Link>
                        <a
                            href="#features"
                            onClick={(e) => {
                                e.preventDefault();
                                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="text-sm font-bold text-gray-400 hover:text-white transition-colors cursor-pointer"
                        >
                            About US
                        </a>
                        <a
                            href="#contact"
                            onClick={(e) => {
                                e.preventDefault();
                                document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="text-sm font-bold text-gray-400 hover:text-white transition-colors cursor-pointer"
                        >
                            Contact US
                        </a>
                        <a
                            href="#faq"
                            onClick={(e) => {
                                e.preventDefault();
                                document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="text-sm font-bold text-gray-400 hover:text-white transition-colors cursor-pointer"
                        >
                            FAQ
                        </a>
                    </div>

                    {/* Desktop Actions */}
                    <div className="hidden xl:flex items-center gap-4">
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
                    <div className="flex xl:hidden items-center z-50">
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
                    {
                        isMenuOpen && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "100vh" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                className="fixed inset-0 top-0 left-0 w-full bg-[#020617] pt-24 px-6 xl:hidden z-40 overflow-y-auto"
                            >
                                <div className="flex flex-col gap-6">
                                    <div className="flex flex-col gap-4 border-b border-white/10 pb-6">
                                        <Link href="/" onClick={() => setIsMenuOpen(false)} className="text-lg font-bold text-gray-400 hover:text-white transition-colors">Home</Link>
                                        <Link href="/terms" onClick={() => setIsMenuOpen(false)} className="text-lg font-bold text-gray-400 hover:text-white transition-colors">Terms</Link>
                                        <a
                                            href="#features"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setIsMenuOpen(false);
                                                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                                            }}
                                            className="text-lg font-bold text-gray-400 hover:text-white transition-colors cursor-pointer"
                                        >
                                            About US
                                        </a>
                                        <a
                                            href="#contact"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setIsMenuOpen(false);
                                                document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                                            }}
                                            className="text-lg font-bold text-gray-400 hover:text-white transition-colors cursor-pointer"
                                        >
                                            Contact US
                                        </a>
                                        <a
                                            href="#faq"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setIsMenuOpen(false);
                                                document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' });
                                            }}
                                            className="text-lg font-bold text-gray-400 hover:text-white transition-colors cursor-pointer"
                                        >
                                            FAQ
                                        </a>
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
                        )
                    }
                </AnimatePresence >
            </nav >

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
                {/* Background Gradients */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[120px] rounded-full" />
                    <div className="absolute bottom-0 right-[-10%] w-[50%] h-[50%] bg-purple-500/10 blur-[120px] rounded-full" />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                        {/* Left Content */}
                        <div className="text-left">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-wider mb-8"
                            >
                                <Zap className="h-3 w-3 fill-primary" />
                                Fast & Reliable Panel
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-5xl lg:text-7xl xl:text-8xl font-black tracking-tight mb-8 leading-[0.9]"
                            >
                                Grow Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">Social Media</span> Instantly
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-lg lg:text-xl text-gray-400 mb-8 leading-relaxed max-w-xl font-bold"
                            >
                                Followers, Likes & Views for Instagram, TikTok & YouTube
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.25 }}
                                className="flex flex-wrap gap-4 mb-10"
                            >
                                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                                    <CheckCircle2 className="h-5 w-5 text-primary" />
                                    <span className="text-sm font-bold">Fast Delivery</span>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                                    <CheckCircle2 className="h-5 w-5 text-primary" />
                                    <span className="text-sm font-bold">24/7 Support</span>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                                    <CheckCircle2 className="h-5 w-5 text-primary" />
                                    <span className="text-sm font-bold">Lowest Price</span>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="flex flex-wrap gap-4 lg:hidden"
                            >
                                <Link href="/login">
                                    <Button variant="outline" className="h-12 px-8 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold transition-all active:scale-95">
                                        Sign In
                                    </Button>
                                </Link>
                                <Link href="/register">
                                    <Button className="h-12 px-8 rounded-xl bg-primary hover:bg-blue-600 text-white font-black shadow-lg shadow-primary/20 transition-all active:scale-95">
                                        Register Now
                                    </Button>
                                </Link>
                            </motion.div>
                        </div>

                        {/* Right Content - Sign In Card */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="relative"
                        >
                            {/* Decorative background for card */}
                            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-purple-500/20 blur-2xl rounded-[2.5rem]" />

                            <Card className="relative border-white/10 bg-[#020617]/60 backdrop-blur-2xl shadow-2xl overflow-hidden rounded-[2.5rem] border-[1px]">
                                <CardContent className="p-8 lg:p-10">
                                    {user ? (
                                        <div className="text-center py-10">
                                            <div className="h-20 w-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                                                <Users className="h-10 w-10 text-primary" />
                                            </div>
                                            <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Active Session</h2>
                                            <p className="text-gray-400 font-medium mb-8">You are logged in as <span className="text-primary">@{user.username || user.email}</span></p>

                                            <div className="space-y-4">
                                                <Link href={user.role === 'admin' ? "/admin" : "/"}>
                                                    <Button className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary to-blue-600 hover:from-blue-500 hover:to-blue-600 text-white font-black text-lg shadow-[0_10px_30px_rgba(37,99,235,0.3)] transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                                                        <span>Go to Dashboard</span>
                                                        <ArrowRight className="h-5 w-5" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    onClick={handleLogout}
                                                    variant="outline"
                                                    className="w-full h-14 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-gray-400 font-bold transition-all"
                                                >
                                                    Switch Account
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <AnimatePresence mode="wait">
                                                {is2FAMode ? (
                                                    <motion.div
                                                        key="2fa"
                                                        initial={{ opacity: 0, scale: 0.95 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        exit={{ opacity: 0, scale: 0.95 }}
                                                        transition={{ duration: 0.3 }}
                                                    >
                                                        <div className="mb-8">
                                                            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                                                                <ShieldCheck className="h-7 w-7 text-primary" />
                                                            </div>
                                                            <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Security Check</h2>
                                                            <p className="text-sm text-gray-400 font-medium">Please enter the 6-digit OTP sent to your email</p>
                                                        </div>

                                                        <form onSubmit={handleVerify2FA} className="space-y-6">
                                                            <div className="space-y-2">
                                                                <Label htmlFor="otp" className="text-gray-300 ml-1 font-bold text-xs uppercase tracking-wider">Verification Code</Label>
                                                                <div className="relative group">
                                                                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-focus-within:text-primary transition-colors" />
                                                                    <Input
                                                                        id="otp"
                                                                        type="text"
                                                                        inputMode="numeric"
                                                                        autoComplete="one-time-code"
                                                                        placeholder="000 000"
                                                                        required
                                                                        maxLength={6}
                                                                        value={otp}
                                                                        onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                                                                        className="bg-white/5 border-white/10 h-16 pl-12 rounded-2xl text-white placeholder:text-gray-600 focus-visible:ring-primary/50 focus-visible:border-primary/50 transition-all font-black text-2xl tracking-[0.5em] text-center"
                                                                    />
                                                                </div>
                                                            </div>

                                                            <Button
                                                                type="submit"
                                                                disabled={isLoading || otp.length < 6}
                                                                className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary to-blue-600 hover:from-blue-500 hover:to-blue-600 text-white font-black text-lg shadow-[0_10px_30px_rgba(37,99,235,0.3)] transition-all active:scale-[0.98] group"
                                                            >
                                                                {isLoading ? (
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                                        <span>Verifying...</span>
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex items-center justify-center gap-2">
                                                                        <span>Verify Code</span>
                                                                        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                                                    </div>
                                                                )}
                                                            </Button>

                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setIs2FAMode(false)
                                                                    setOtp("")
                                                                }}
                                                                className="w-full text-center text-sm font-bold text-gray-400 hover:text-white transition-colors"
                                                            >
                                                                Try another account
                                                            </button>
                                                        </form>
                                                    </motion.div>
                                                ) : !isForgotMode ? (
                                                    <motion.div
                                                        key="login"
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: 20 }}
                                                        transition={{ duration: 0.3 }}
                                                    >
                                                        <div className="mb-8">
                                                            <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Welcome Back</h2>
                                                            <p className="text-sm text-gray-400 font-medium">Log in to start your next campaign</p>
                                                        </div>

                                                        <form onSubmit={handleLogin} className="space-y-5">
                                                            <div className="space-y-2">
                                                                <Label htmlFor="email" className="text-gray-300 ml-1 font-bold text-xs uppercase tracking-wider">User name or Email</Label>
                                                                <div className="relative group">
                                                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-focus-within:text-primary transition-colors" />
                                                                    <Input
                                                                        id="email"
                                                                        type="text"
                                                                        placeholder="Username or email"
                                                                        required
                                                                        value={email}
                                                                        onChange={(e) => setEmail(e.target.value.toLowerCase())}
                                                                        className="bg-white/5 border-white/10 h-14 pl-12 rounded-2xl text-white placeholder:text-gray-600 focus-visible:ring-primary/50 focus-visible:border-primary/50 transition-all font-medium"
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div className="space-y-2">
                                                                <div className="flex items-center justify-between ml-1">
                                                                    <Label htmlFor="password" title="password" className="text-gray-300 font-bold text-xs uppercase tracking-wider">Password</Label>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setIsForgotMode(true)}
                                                                        className="text-xs font-bold text-primary hover:text-blue-400 transition-colors"
                                                                    >
                                                                        Forgot?
                                                                    </button>
                                                                </div>
                                                                <div className="relative group">
                                                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-focus-within:text-primary transition-colors" />
                                                                    <Input
                                                                        id="password"
                                                                        type={showPassword ? "text" : "password"}
                                                                        placeholder="••••••••"
                                                                        required
                                                                        value={password}
                                                                        onChange={(e) => setPassword(e.target.value)}
                                                                        className="bg-white/5 border-white/10 h-14 pl-12 pr-12 rounded-2xl text-white placeholder:text-gray-600 focus-visible:ring-primary/50 focus-visible:border-primary/50 transition-all font-medium"
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setShowPassword(!showPassword)}
                                                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                                                                    >
                                                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center space-x-2 ml-1">
                                                                <input
                                                                    type="checkbox"
                                                                    id="remember"
                                                                    className="h-4 w-4 rounded border-white/10 bg-white/5 text-primary focus:ring-primary/50"
                                                                />
                                                                <label htmlFor="remember" className="text-xs text-gray-400 font-medium cursor-pointer">
                                                                    Remember me
                                                                </label>
                                                            </div>

                                                            <Button
                                                                type="submit"
                                                                disabled={isLoading}
                                                                className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary to-blue-600 hover:from-blue-500 hover:to-blue-600 text-white font-black text-lg shadow-[0_10px_30px_rgba(37,99,235,0.3)] transition-all active:scale-[0.98] group"
                                                            >
                                                                {isLoading ? (
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                                        <span>Connecting...</span>
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex items-center justify-center gap-2">
                                                                        <span>Sign In To Dashboard</span>
                                                                        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                                                    </div>
                                                                )}
                                                            </Button>

                                                            <div className="relative my-6">
                                                                <div className="absolute inset-0 flex items-center">
                                                                    <div className="w-full border-t border-white/5"></div>
                                                                </div>
                                                                <div className="relative flex justify-center text-xs uppercase">
                                                                    <span className="bg-[#020617] px-2 text-gray-500 font-bold">Or continue with</span>
                                                                </div>
                                                            </div>

                                                            <div className="google-login-wrapper flex justify-center">
                                                                <GoogleLogin
                                                                    onSuccess={handleGoogleSuccess}
                                                                    onError={() => toast.error("Google sign in failed")}
                                                                    theme="filled_blue"
                                                                    shape="pill"
                                                                    width="320"
                                                                />
                                                            </div>
                                                        </form>

                                                        <div className="mt-8 pt-6 border-t border-white/5 text-center">
                                                            <p className="text-sm text-gray-400 font-medium">
                                                                New here?{" "}
                                                                <Link href="/register" className="font-black text-primary hover:text-blue-400 transition-colors">
                                                                    Create Account
                                                                </Link>
                                                            </p>
                                                        </div>
                                                    </motion.div>
                                                ) : (
                                                    <motion.div
                                                        key="forgot"
                                                        initial={{ opacity: 0, x: 20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: -20 }}
                                                        transition={{ duration: 0.3 }}
                                                    >
                                                        <div className="mb-8">
                                                            <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Reset Password</h2>
                                                            <p className="text-sm text-gray-400 font-medium">Enter your username or email to receive a reset link</p>
                                                        </div>

                                                        <form onSubmit={handleForgotPassword} className="space-y-6">
                                                            <div className="space-y-2">
                                                                <Label htmlFor="forgot-email" className="text-gray-300 ml-1 font-bold text-xs uppercase tracking-wider">Username or Email</Label>
                                                                <div className="relative group">
                                                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-focus-within:text-primary transition-colors" />
                                                                    <Input
                                                                        id="forgot-email"
                                                                        type="text"
                                                                        placeholder="Username or email"
                                                                        required
                                                                        value={forgotIdentifier}
                                                                        onChange={(e) => setForgotIdentifier(e.target.value.toLowerCase())}
                                                                        className="bg-white/5 border-white/10 h-14 pl-12 rounded-2xl text-white placeholder:text-gray-600 focus-visible:ring-primary/50 focus-visible:border-primary/50 transition-all font-medium"
                                                                    />
                                                                </div>
                                                            </div>

                                                            <Button
                                                                type="submit"
                                                                disabled={isForgotLoading}
                                                                className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary to-blue-600 hover:from-blue-500 hover:to-blue-600 text-white font-black text-lg shadow-[0_10px_30px_rgba(37,99,235,0.3)] transition-all active:scale-[0.98]"
                                                            >
                                                                {isForgotLoading ? (
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                                        <span>Sending...</span>
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex items-center justify-center gap-2">
                                                                        <span>Send Reset Link</span>
                                                                        <ArrowRight className="h-5 w-5" />
                                                                    </div>
                                                                )}
                                                            </Button>

                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                onClick={() => setIsForgotMode(false)}
                                                                className="w-full h-14 text-gray-400 hover:text-white hover:bg-white/5 transition-all font-bold"
                                                            >
                                                                Back to Login
                                                            </Button>
                                                        </form>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>

                    {/* Stats */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="mt-12 sm:mt-20 grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 pt-12 border-t border-white/5"
                    >
                        {[
                            { label: "Orders Delivered", value: 17458921, suffix: "+" },
                            { label: "Support Available", value: 24, suffix: "/7" },
                            { label: "Active Services", value: 2499, suffix: "+" },
                            { label: "Service Uptime", value: 99.9, suffix: "%", decimals: 1 }
                        ].map((stat, i) => (
                            <div key={i} className="text-center">
                                <div className="text-3xl sm:text-4xl font-black text-white mb-1">
                                    <NumberTicker value={stat.value} suffix={stat.suffix} decimals={stat.decimals} />
                                </div>
                                <div className="text-xs sm:text-sm font-bold text-gray-500 uppercase tracking-wide sm:tracking-widest">{stat.label}</div>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Platforms Scrolling Section */}
            <section className="py-20 bg-white/[0.01] border-y border-white/5 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 text-center mb-12">
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-[0.3em]">Supported Platforms</p>
                </div>

                <div className="flex flex-col gap-12 relative">
                    {/* Row 1 - Scrolling Right */}
                    <div className="flex overflow-hidden">
                        <motion.div
                            animate={{ x: ["-50%", "0%"] }}
                            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                            className="flex gap-20 items-center pr-20"
                        >
                            {[...Array(4)].map((_, idx) => (
                                <div key={idx} className="flex gap-20 items-center hover:scale-110 transition-transform duration-300">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-pink-500/20 text-pink-500">
                                            <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                                        </div>
                                        <span className="text-xl font-black tracking-tight text-white">Instagram</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-sky-500/20 text-sky-500">
                                            <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 4-8 4z" /></svg>
                                        </div>
                                        <span className="text-xl font-black tracking-tight text-white">YouTube</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/10 text-white">
                                            <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24"><path d="M12.525.023c.13-.032.265-.023.395.023 3.826 2.529 8.166 3.477 11.08 3.57.19.006.35.132.417.31.25.666.383 1.344.383 2.059 0 4.192-1.923 7.9-5.3 10.743-3.045 2.564-6.273 3.65-8.845 3.986a.63.63 0 0 1-.518-.086c-1.127-.723-2.22-1.637-3.232-2.73-1.637-1.743-2.883-3.793-3.65-5.91-.767-2.116-1.15-4.232-1.15-6.348 0-1.874.383-3.714 1.15-5.52.067-.178.227-.304.417-.31 2.914-.093 7.254-1.041 10.885-3.57zM5.31 16.51c.642.553 1.34 1.056 2.083 1.503 1.365.83 2.87 1.378 4.607 1.637a15.343 15.343 0 0 0 7.82-3.11c2.193-1.848 3.525-4.302 3.525-6.936 0-.306-.02-.607-.058-.903-2.316-.213-5.286-.968-7.91-2.483a31.334 31.334 0 0 1-5.1 1.764c-.31.066-.62.115-.93.142-.236 1.309-.364 2.662-.364 4.053 0 1.638.28 3.232.83 4.33z" /></svg>
                                        </div>
                                        <span className="text-xl font-black tracking-tight text-white">TikTok</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-blue-600/20 text-blue-600">
                                            <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                                        </div>
                                        <span className="text-xl font-black tracking-tight text-white">Facebook</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/10 text-white leading-none font-bold italic">X</div>
                                        <span className="text-xl font-black tracking-tight text-white">Twitter</span>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    </div>

                    {/* Row 2 - Scrolling Left */}
                    <div className="flex overflow-hidden">
                        <motion.div
                            animate={{ x: ["0%", "-50%"] }}
                            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                            className="flex gap-20 items-center pr-20"
                        >
                            {[...Array(4)].map((_, idx) => (
                                <div key={idx} className="flex gap-20 items-center hover:scale-110 transition-transform duration-300">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-sky-400/20 text-sky-400">
                                            <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.697.064-1.226-.462-1.901-.905-1.057-.695-1.652-1.129-2.677-1.805-1.185-.78-.417-1.208.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.303.48-.429-.012-1.253-.245-1.868-.445-.753-.245-1.351-.374-1.299-.79.027-.217.327-.44.898-.67 3.513-1.53 5.854-2.54 7.025-3.03 3.345-1.396 4.04-1.638 4.492-1.646z" /></svg>
                                        </div>
                                        <span className="text-xl font-black tracking-tight text-white">Telegram</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-[#5865F2]/20 text-[#5865F2]">
                                            <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.076.076 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.086 2.157 2.419c0 1.334-.947 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.086 2.157 2.419c0 1.334-.946 2.419-2.157 2.419z" /></svg>
                                        </div>
                                        <span className="text-xl font-black tracking-tight text-white">Discord</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-purple-600/20 text-purple-600">
                                            <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" /></svg>
                                        </div>
                                        <span className="text-xl font-black tracking-tight text-white">Twitch</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-blue-700/20 text-blue-700">
                                            <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.454C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                                        </div>
                                        <span className="text-xl font-black tracking-tight text-white">LinkedIn</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-yellow-400/20 text-yellow-500">
                                            <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 18.25a6.25 6.25 0 1 1 0-12.5 6.25 6.25 0 0 1 0 12.5z" /></svg>
                                        </div>
                                        <span className="text-xl font-black tracking-tight text-white">Snapchat</span>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    </div>

                    {/* Edge Fades for the marquee */}
                    <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#020617] to-transparent z-10 pointer-events-none" />
                    <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#020617] to-transparent z-10 pointer-events-none" />
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-24 scroll-mt-28">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-20">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-4xl font-black mb-4"
                        >
                            Why Choose <span className="text-primary">NepoSMM</span>?
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-gray-400 max-w-2xl mx-auto font-medium"
                        >
                            We provide the most robust and reliable panel in the industry with features designed for scale.
                        </motion.p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { icon: Zap, title: "Instant Start", desc: "No waiting. Most our services start within seconds of placing the order." },
                            { icon: ShieldCheck, title: "Secure Payments", desc: "Secure gateway with PayPal, Crypto (5% bonus), and local Nepalese payment methods." },
                            { icon: Users, title: "24/7 Priority Support", desc: "Dedicated support team available round the clock to help you grow via tickets." },
                            { icon: TrendingUp, title: "Market Competitive", desc: "We track competitors daily to ensure you get the absolute lowest prices." },
                            { icon: Sparkles, title: "Minimal Drop Rates", desc: "High-retention services with a 30-day refill guarantee on most orders." },
                            { icon: Globe, title: "99.9% Service Uptime", desc: "Robust API and server architecture ensuring our services are always available." }
                        ].map((f, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ y: -10 }}
                                className="p-8 rounded-[2rem] bg-white/5 border border-white/10 hover:border-primary/30 transition-all group"
                            >
                                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-all">
                                    <f.icon className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                                <p className="text-gray-400 text-sm leading-relaxed font-medium">{f.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section id="testimonials" className="py-24 bg-white/[0.01] relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 mb-16 text-center">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-4xl lg:text-5xl font-black mb-4"
                    >
                        What Our <span className="text-primary">Customers</span> Say About US
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-gray-400 max-w-2xl mx-auto font-medium"
                    >
                        Join thousands of satisfied users who have transformed their social media presence with NepoSMM.
                    </motion.p>
                </div>

                <div className="flex flex-col gap-8 relative">
                    {/* First Row - Scrolling Right (Movement towards right) */}
                    <div className="flex overflow-hidden">
                        <motion.div
                            animate={{ x: ["-50%", "0%"] }}
                            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                            className="flex gap-6 pr-6 py-4"
                        >
                            {[...Array(4)].map((_, idx) => (
                                <div key={idx} className="flex gap-6">
                                    {[
                                        { name: "Ramesh Thapa", handle: "@ramesh_thapa", quote: "The engagement quality is mind-blowing. My TikTok views skyrocket within minutes of ordering.", color: "bg-blue-600" },
                                        { name: "Sarah Jenkins", handle: "@sarah_j_marketing", quote: "The support ticket system is amazing. I had a query about my order and it was resolved in under 10 minutes!", color: "bg-emerald-500" },
                                        { name: "Prashant Sharma", handle: "@prashant_sharma", quote: "As a marketing agency owner, I need reliability. NepoSMM delivers exactly that every time.", color: "bg-pink-600" },
                                        { name: "Marco Rossi", handle: "@rossi_digital", quote: "I've made over $500 this month just through the NepoSMM affiliate program. Best side hustle ever!", color: "bg-purple-600" }
                                    ].map((t, i) => (
                                        <div key={i} className="w-[350px] flex-shrink-0 p-8 rounded-3xl bg-white/5 border border-white/10 relative group hover:border-primary/50 transition-all duration-300">
                                            <div className="absolute top-6 right-8 opacity-10 group-hover:opacity-20 transition-opacity">
                                                <svg className="h-10 w-10 fill-white" viewBox="0 0 24 24"><path d="M14.017 21L14.017 18C14.017 16.899 14.892 16 16.031 16L19.017 16C19.569 16 20.017 15.552 20.017 15L20.017 8C20.017 7.448 19.569 7 19.017 7L14.017 7C13.465 7 13.017 7.448 13.017 8L13.017 13C13.017 14.105 12.115 15 11.011 15L11.011 18C11.011 19.105 11.913 20 13.017 20L13.017 21L14.017 21ZM5.011 21L5.011 18C5.011 16.899 5.885 16 7.025 16L10.011 16C10.563 16 11.011 15.552 11.011 15L11.011 8C11.011 7.448 10.563 7 10.011 7L5.011 7C4.458 7 4.011 7.448 4.011 8L4.011 13C4.011 14.105 3.108 15 2.005 15L2.005 18C2.005 19.105 2.907 20 4.011 20L4.011 21L5.011 21Z" /></svg>
                                            </div>
                                            <div className="flex items-center gap-4 mb-6">
                                                <div className={`h-12 w-12 rounded-full ${t.color} flex items-center justify-center font-bold text-lg text-white`}>
                                                    {t.name.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white text-left">{t.name}</div>
                                                    <div className="text-sm text-gray-500 font-medium text-left">{t.handle}</div>
                                                </div>
                                            </div>
                                            <p className="text-gray-400 text-sm leading-relaxed font-medium whitespace-normal italic text-left">"{t.quote}"</p>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </motion.div>
                    </div>

                    {/* Second Row - Scrolling Left (Movement towards left) */}
                    <div className="flex overflow-hidden">
                        <motion.div
                            animate={{ x: ["0%", "-50%"] }}
                            transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
                            className="flex gap-6 pr-6 py-4"
                        >
                            {[...Array(4)].map((_, idx) => (
                                <div key={idx} className="flex gap-6">
                                    {[
                                        { name: "Sunita Magar", handle: "@sunita_magar", quote: "The dashboard is so clean and easy to use. Local payment methods are a game changer.", color: "bg-indigo-600" },
                                        { name: "David Chen", handle: "@dchen_social", quote: "The NepoSMM affiliate system is so lucrative. I've already withdrawn my first $200 commission!", color: "bg-orange-500" },
                                        { name: "Maya Tamang", handle: "@maya_tamang", quote: "I opened a support ticket for a custom bulk order and they responded instantly. 5-star service!", color: "bg-red-500" },
                                        { name: "Elena Volkov", handle: "@elena_v_agency", quote: "The API is robust. I've integrated it with my own software and it works flawlessly worldwide.", color: "bg-cyan-600" }
                                    ].map((t, i) => (
                                        <div key={i} className="w-[350px] flex-shrink-0 p-8 rounded-3xl bg-white/5 border border-white/10 relative group hover:border-primary/50 transition-all duration-300">
                                            <div className="absolute top-6 right-8 opacity-10 group-hover:opacity-20 transition-opacity">
                                                <svg className="h-10 w-10 fill-white" viewBox="0 0 24 24"><path d="M14.017 21L14.017 18C14.017 16.899 14.892 16 16.031 16L19.017 16C19.569 16 20.017 15.552 20.017 15L20.017 8C20.017 7.448 19.569 7 19.017 7L14.017 7C13.465 7 13.017 7.448 13.017 8L13.017 13C13.017 14.105 12.115 15 11.011 15L11.011 18C11.011 19.105 11.913 20 13.017 20L13.017 21L14.017 21ZM5.011 21L5.011 18C5.011 16.899 5.885 16 7.025 16L10.011 16C10.563 16 11.011 15.552 11.011 15L11.011 8C11.011 7.448 10.563 7 10.011 7L5.011 7C4.458 7 4.011 7.448 4.011 8L4.011 13C4.011 14.105 3.108 15 2.005 15L2.005 18C2.005 19.105 2.907 20 4.011 20L4.011 21L5.011 21Z" /></svg>
                                            </div>
                                            <div className="flex items-center gap-4 mb-6">
                                                <div className={`h-12 w-12 rounded-full ${t.color} flex items-center justify-center font-bold text-lg text-white`}>
                                                    {t.name.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white text-left">{t.name}</div>
                                                    <div className="text-sm text-gray-500 font-medium text-left">{t.handle}</div>
                                                </div>
                                            </div>
                                            <p className="text-gray-400 text-sm leading-relaxed font-medium whitespace-normal italic text-left">"{t.quote}"</p>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </motion.div>
                    </div>

                    {/* Edge Fades */}
                    {/* Edge Fades */}
                    <div className="absolute inset-y-0 left-0 w-12 md:w-40 bg-gradient-to-r from-[#020617] via-[#020617]/80 to-transparent z-10 pointer-events-none" />
                    <div className="absolute inset-y-0 right-0 w-12 md:w-40 bg-gradient-to-l from-[#020617] via-[#020617]/80 to-transparent z-10 pointer-events-none" />
                </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" className="py-24 relative scroll-mt-28">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-4xl font-black mb-4"
                        >
                            Frequently Asked <span className="text-primary">Questions</span>
                        </motion.h2>
                        <p className="text-gray-400 font-medium text-lg">Everything you need to know about NepoSMM services.</p>
                    </div>

                    <Accordion type="single" collapsible className="w-full space-y-4" defaultValue="item-0">
                        {[
                            { q: "1. What is an SMM Panel?", a: "An SMM (Social Media Marketing) panel is an online platform where you can purchase social media services like followers, likes, views, and comments to boost your online presence effectively and affordably." },
                            { q: "2. Is it safe to use your services?", a: "Yes, absolutely! We prioritize your account's safety. We use high-quality accounts and safe delivery methods that comply with social media platform guidelines to ensure your account remains secure." },
                            { q: "3. How can I deposit funds?", a: "We offer a wide range of payment methods including Credit/Debit Cards, Cryptocurrency, and various local Nepalese payment options like Khalti, eSewa, and IME Pay for your convenience." },
                            { q: "4. What happens if my followers drop?", a: "Many of our 'Guaranteed' services come with a refill warranty. If you experience any drops within the guarantee period, simply use the refill button on your order page, and we'll restore the lost numbers for free." },
                            { q: "5. Do you offer API support for resellers?", a: "Yes, we provide a robust and fully documented API that allows you to resell our services directly through your own panel or website. It's perfectly designed for scaling your own SMM business." }
                        ].map((faq, i) => (
                            <AccordionItem key={i} value={`item-${i}`} className="bg-white/5 border border-white/10 rounded-2xl px-6 data-[state=open]:bg-white/10 transition-colors">
                                <AccordionTrigger className="text-lg font-bold hover:no-underline py-6">
                                    {faq.q}
                                </AccordionTrigger>
                                <AccordionContent className="text-gray-400 pb-6 text-base leading-relaxed font-medium">
                                    {faq.a}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </section>

            {/* Contact Us Section */}
            <section id="contact" className="py-24 relative scroll-mt-28">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-4xl font-black mb-4"
                        >
                            Contact <span className="text-primary">Us</span>
                        </motion.h2>
                        <p className="text-gray-400 font-medium text-lg">Get in touch with our support team anytime.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* WhatsApp Support */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0 }}
                            className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-primary/50 transition-all group text-center"
                        >
                            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                                <Phone className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-black mb-3">Whatsapp Support</h3>
                            <p className="text-gray-400 font-medium">+977 9866887714</p>
                        </motion.div>

                        {/* Contact Us */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-primary/50 transition-all group text-center"
                        >
                            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                                <Mail className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-black mb-3">Contact US</h3>
                            <p className="text-gray-400 font-medium">{contactLinks.support_email}</p>
                        </motion.div>

                        {/* Our Location */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-primary/50 transition-all group text-center"
                        >
                            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                                <MapPin className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-black mb-3">Our Location</h3>
                            <p className="text-gray-400 font-medium">Nepal</p>
                        </motion.div>

                        {/* Secure Payments */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                            className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-primary/50 transition-all group text-center"
                        >
                            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                                <ShieldCheck className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-black mb-3">Secure Payments</h3>
                            <p className="text-gray-400 font-medium">Safe Transactions</p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* CTA Footer Section */}
            <section className="py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-primary/5 blur-[120px]" />
                <div className="max-w-5xl mx-auto px-4 relative z-10">
                    <div className="p-12 lg:p-20 rounded-[3rem] bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Sparkles className="h-32 w-32" />
                        </div>

                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-4xl lg:text-6xl font-black mb-8"
                        >
                            Ready to Grow Your <br /><span className="text-primary">Social Presence</span>?
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-xl text-gray-400 mb-12 max-w-xl mx-auto font-medium"
                        >
                            Join 450,000+ users worldwide who trust NepoSMM for their digital marketing needs.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="flex flex-col sm:flex-row items-center justify-center gap-6"
                        >
                            <Link href="/register">
                                <Button size="lg" className="h-16 px-12 rounded-2xl bg-white text-black font-black text-lg hover:bg-gray-200 shadow-xl">
                                    Register Now
                                </Button>
                            </Link>
                            <div className="flex items-center gap-2 text-primary font-bold">
                                <CheckCircle2 className="h-5 w-5" />
                                <span>Trusted by 450,000+ Users</span>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

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
                                <Link href="#features" className="text-gray-500 hover:text-white transition-colors text-sm font-medium">About US</Link>
                                <Link href="#testimonials" className="text-gray-500 hover:text-white transition-colors text-sm font-medium">Reviews</Link>
                                <Link href="#faq" className="text-gray-500 hover:text-white transition-colors text-sm font-medium">FAQ</Link>
                                <Link href="#contact" className="text-gray-500 hover:text-white transition-colors text-sm font-medium">Contact US</Link>
                            </div>
                        </div>

                        {/* Legal */}
                        <div>
                            <h4 className="text-white font-black mb-4 text-sm uppercase tracking-wider">Legal</h4>
                            <div className="flex flex-col gap-3">
                                <Link href="/terms" className="text-gray-500 hover:text-white transition-colors text-sm font-medium">Terms</Link>
                                <Link href="/privacy" className="text-gray-500 hover:text-white transition-colors text-sm font-medium">Privacy</Link>
                                <Link href="/terms#refund" className="text-gray-500 hover:text-white transition-colors text-sm font-medium">Refund Policy</Link>
                            </div>
                        </div>

                        {/* Support */}
                        <div>
                            <h4 className="text-white font-black mb-4 text-sm uppercase tracking-wider">Support</h4>
                            <div className="flex flex-col gap-3">
                                <a href={`https://wa.me/${contactLinks.whatsapp_number}`} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-colors text-sm font-medium">WhatsApp</a>
                                <a href={`mailto:${contactLinks.support_email}`} className="text-gray-500 hover:text-white transition-colors text-sm font-medium">Email Support</a>
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