"use client";

import React, { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, Sparkles, ShieldCheck, Zap, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import { API_URL } from "@/lib/api-config"


export default function LoginPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [isForgotMode, setIsForgotMode] = useState(false)
    const [forgotIdentifier, setForgotIdentifier] = useState("")
    const [isForgotLoading, setIsForgotLoading] = useState(false)

    React.useEffect(() => {
        if (searchParams.get("expired") === "true") {
            toast.error("Session Expired", {
                description: "For your security, you've been logged out. Please log in again.",
            })
        }
    }, [searchParams])

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
                    email, // Backend now allows email or username in this field
                    password,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Login failed")
            }

            // Store user data and token
            localStorage.setItem("nepo_token", data.token)
            localStorage.setItem("nepo_user", JSON.stringify(data.user))

            toast.success("Welcome back!", {
                description: `Successfully signed in as ${data.user.username || data.user.email}.`,
            })

            // Always redirect to main dashboard from the regular login page
            router.push("/")
        } catch (error: any) {
            toast.error(error.message || "Invalid credentials. Please try again.")
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

    return (
        <div className="min-h-screen w-full flex flex-col justify-center items-center bg-[#020617] relative p-4 sm:p-6 overflow-x-hidden">
            {/* Dynamic Background Elements */}
            {/* Dynamic Background Elements */}
            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/20 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between relative z-50">
                    <Link href="/" className="flex items-center gap-2.5 group z-50">
                        <img
                            src="/logo.png"
                            alt="NepoSMM Logo"
                            className="h-10 w-auto object-contain transition-transform group-hover:scale-110"
                        />
                        <span className="text-xl font-black tracking-tighter">NepoSMM</span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden xl:flex items-center gap-8">
                        <Link href="/" className="text-sm font-bold text-gray-400 hover:text-white transition-colors">Home</Link>
                        <Link href="/terms" className="text-sm font-bold text-white transition-colors">Terms</Link>
                        <a href="/#features" className="text-sm font-bold text-gray-400 hover:text-white transition-colors">About Us</a>
                        <a href="/#contact" className="text-sm font-bold text-gray-400 hover:text-white transition-colors">Contact Us</a>
                        <a href="/#faq" className="text-sm font-bold text-gray-400 hover:text-white transition-colors">FAQ</a>
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
                            {isMenuOpen ? <X className="h-10 w-10" /> : <Menu className="h-10 w-10" />}
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
                            className="fixed inset-0 top-0 left-0 w-full bg-[#020617] pt-24 px-6 xl:hidden z-40 overflow-y-auto"
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

            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-blue-500/5 blur-[150px] rounded-full" />
            </div>

            {/* Content Container */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-full max-w-md z-10 pt-20"
            >
                {/* Brand/Logo */}
                <div className="flex flex-col items-center mb-8">
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="mb-4"
                    >
                        <img
                            src="/logo.png"
                            alt="NepoSMM Logo"
                            className="h-20 w-auto object-contain drop-shadow-[0_0_30px_rgba(37,99,235,0.3)]"
                        />
                    </motion.div>
                    <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight text-center">NepoSMM</h1>
                    <p className="text-gray-400 font-medium">Elevate Your Presence</p>
                </div>

                {/* Glassmorphism Card */}
                <Card className="border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl overflow-hidden rounded-[2rem] border-[1px]">
                    <CardContent className="p-6 sm:p-8 md:p-10">
                        <AnimatePresence mode="wait">
                            {!isForgotMode ? (
                                <motion.div
                                    key="login"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="mb-8">
                                        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Sign In</h2>
                                        <p className="text-sm text-gray-400">Enter your credentials to access your account</p>
                                    </div>

                                    <form onSubmit={handleLogin} className="space-y-5">
                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="text-gray-300 ml-1">User name or Email</Label>
                                            <div className="relative group">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-focus-within:text-primary transition-colors" />
                                                <Input
                                                    id="email"
                                                    type="text"
                                                    placeholder="Username or email"
                                                    required
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value.toLowerCase())}
                                                    className="bg-white/5 border-white/10 h-12 pl-12 rounded-xl text-white placeholder:text-gray-600 focus-visible:ring-primary/50 focus-visible:border-primary/50 transition-all"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between ml-1">
                                                <Label htmlFor="password" title="password" className="text-gray-300">Password</Label>
                                                <button
                                                    type="button"
                                                    onClick={() => setIsForgotMode(true)}
                                                    className="text-xs font-bold text-primary hover:text-blue-400 transition-colors"
                                                >
                                                    Forgot Password?
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
                                                    className="bg-white/5 border-white/10 h-12 pl-12 pr-12 rounded-xl text-white placeholder:text-gray-600 focus-visible:ring-primary/50 focus-visible:border-primary/50 transition-all"
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
                                            <label htmlFor="remember" className="text-sm text-gray-400 font-medium cursor-pointer">
                                                Remember me
                                            </label>
                                        </div>

                                        <Button
                                            type="submit"
                                            disabled={isLoading}
                                            className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-blue-600 hover:from-blue-500 hover:to-blue-600 text-white font-bold text-base shadow-[0_4px_20px_rgba(37,99,235,0.3)] transition-all active:scale-[0.98]"
                                        >
                                            {isLoading ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    <span>Signing in...</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center gap-2">
                                                    <span>Sign In</span>
                                                    <ArrowRight className="h-4 w-4" />
                                                </div>
                                            )}
                                        </Button>

                                        <div className="relative my-6">
                                            <div className="absolute inset-0 flex items-center">
                                                <div className="w-full border-t border-white/5"></div>
                                            </div>
                                            <div className="relative flex justify-center text-xs uppercase">
                                                <span className="bg-[#0b1024] px-2 text-gray-500 font-bold">Or continue with</span>
                                            </div>
                                        </div>

                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="w-full h-12 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold transition-all flex items-center justify-center gap-3"
                                        >
                                            <svg className="h-5 w-5" viewBox="0 0 24 24">
                                                <path
                                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                                    fill="#4285F4"
                                                />
                                                <path
                                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                                    fill="#34A853"
                                                />
                                                <path
                                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.21z"
                                                    fill="#FBBC05"
                                                />
                                                <path
                                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l2.85 2.21c.86-2.6 3.29-4.53 6.16-4.53z"
                                                    fill="#EA4335"
                                                />
                                            </svg>
                                            Sign in with Google
                                        </Button>
                                    </form>

                                    <div className="mt-8 pt-6 border-t border-white/5 text-center space-y-4">
                                        <p className="text-sm text-gray-400">
                                            Don't have an account?{" "}
                                            <Link href="/register" className="font-bold text-primary hover:text-blue-400 transition-colors">
                                                Create Account
                                            </Link>
                                        </p>
                                        <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-xs font-bold text-gray-400 hover:text-white transition-all uppercase tracking-widest">
                                            <ArrowLeft className="h-3 w-3" />
                                            <span>Back to Home</span>
                                        </Link>
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
                                        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Reset Password</h2>
                                        <p className="text-sm text-gray-400">Enter your username or email to receive a reset link</p>
                                    </div>

                                    <form onSubmit={handleForgotPassword} className="space-y-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="forgot-email" className="text-gray-300 ml-1">Username or Email</Label>
                                            <div className="relative group">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-focus-within:text-primary transition-colors" />
                                                <Input
                                                    id="forgot-email"
                                                    type="text"
                                                    placeholder="Username or email"
                                                    required
                                                    value={forgotIdentifier}
                                                    onChange={(e) => setForgotIdentifier(e.target.value.toLowerCase())}
                                                    className="bg-white/5 border-white/10 h-12 pl-12 rounded-xl text-white placeholder:text-gray-600 focus-visible:ring-primary/50 focus-visible:border-primary/50 transition-all"
                                                />
                                            </div>
                                        </div>

                                        <Button
                                            type="submit"
                                            disabled={isForgotLoading}
                                            className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-bold text-base shadow-[0_4px_20px_rgba(37,99,235,0.3)] transition-all"
                                        >
                                            {isForgotLoading ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    <span>Sending...</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center gap-2">
                                                    <span>Send Reset Link</span>
                                                    <ArrowRight className="h-4 w-4" />
                                                </div>
                                            )}
                                        </Button>

                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={() => setIsForgotMode(false)}
                                            className="w-full text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                                        >
                                            Back to Login
                                        </Button>
                                    </form>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </CardContent>
                </Card>

                {/* Footer Features */}
                <div className="mt-8 grid grid-cols-3 gap-4">
                    <div className="flex flex-col items-center gap-1 opacity-50">
                        <ShieldCheck className="h-4 w-4 text-white" />
                        <span className="text-[10px] font-bold text-white uppercase tracking-tighter">Secure</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 opacity-50">
                        <Zap className="h-4 w-4 text-white" />
                        <span className="text-[10px] font-bold text-white uppercase tracking-tighter">Instant</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 opacity-50">
                        <Sparkles className="h-4 w-4 text-white" />
                        <span className="text-[10px] font-bold text-white uppercase tracking-tighter">Premium</span>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}