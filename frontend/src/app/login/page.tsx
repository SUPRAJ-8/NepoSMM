"use client";

import React, { useState, Suspense } from "react"
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
import { GoogleLogin, CredentialResponse } from "@react-oauth/google"

function LoginContent() {
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
    const [twoFactorToken, setTwoFactorToken] = useState("")

    React.useEffect(() => {
        if (searchParams.get("expired") === "true") {
            toast.error("Session Expired", {
                description: "For your security, you've been logged out. Please log in again.",
            })
        }
    }, [searchParams])

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

            toast.success("Signed in with Google successfully!");
            router.push("/");
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

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

            localStorage.setItem("nepo_token", data.token)
            localStorage.setItem("nepo_user", JSON.stringify(data.user))

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
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-full max-w-md z-10 pt-20"
            >
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

                                        <button
                                            type="button"
                                            onClick={() => setIsForgotMode(false)}
                                            className="w-full text-sm font-bold text-gray-400 hover:text-white transition-colors py-2"
                                        >
                                            Back to Login
                                        </button>
                                    </form>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </CardContent>
                </Card>

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
                        <ShieldCheck className="h-4 w-4 text-white" />
                        <span className="text-[10px] font-bold text-white uppercase tracking-tighter">Trusted</span>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#020617] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        }>
            <LoginContent />
        </Suspense>
    )
}