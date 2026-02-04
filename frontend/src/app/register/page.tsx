"use client";

import { API_URL } from '@/lib/api-config'


import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Mail, Lock, User, ArrowRight, ArrowLeft, Sparkles, ShieldCheck, Zap, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { GoogleLogin, CredentialResponse } from "@react-oauth/google"

export default function RegisterPage() {
    const router = useRouter()
    const { searchParams } = new URL(typeof window !== 'undefined' ? window.location.href : 'http://localhost');
    const referralToken = typeof window !== 'undefined'
        ? (new URLSearchParams(window.location.search).get("ref") || localStorage.getItem("referral_code"))
        : null;

    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        whatsapp: "",
        password: "",
        confirmPassword: "",
    })

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

            toast.success("Success!", {
                description: "Signed in with Google successfully.",
            });
            router.push("/");
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()

        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match")
            return
        }

        setIsLoading(true)

        try {
            const response = await fetch(`${API_URL}/users/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: formData.username,
                    email: formData.email,
                    whatsapp: formData.whatsapp,
                    password: formData.password,
                    referralToken: referralToken
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Registration failed")
            }

            // Store user data and token for auto-login
            localStorage.setItem("nepo_token", data.token)
            localStorage.setItem("nepo_user", JSON.stringify(data.user))

            toast.success("Welcome to NepoSMM!", {
                description: "Your account has been created and you've been logged in.",
            })
            router.push("/")
        } catch (error: any) {
            toast.error(error.message || "Something went wrong. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value })
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#020617] relative overflow-hidden p-4">
            {/* Dynamic Background Elements */}
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-blue-500/5 blur-[150px] rounded-full" />

            {/* Content Container */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-full max-w-lg z-10 py-8"
            >
                {/* Brand/Logo */}
                <div className="flex flex-col items-center mb-8 text-center">
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="mb-3"
                    >
                        <img
                            src="/logo.png"
                            alt="NepoSMM Logo"
                            className="h-14 w-auto object-contain drop-shadow-[0_0_20px_rgba(37,99,235,0.3)]"
                        />
                    </motion.div>
                    <h1 className="text-2xl font-black text-white tracking-tight">Create Account</h1>
                    <p className="text-sm text-gray-400 font-medium">Join thousands of successful influencers</p>
                </div>

                {/* Glassmorphism Card */}
                <Card className="border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl overflow-hidden rounded-[2rem] border-[1px]">
                    <CardContent className="p-8">
                        <form onSubmit={handleRegister} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="username" className="text-gray-300 ml-1">Username</Label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-focus-within:text-primary transition-colors" />
                                        <Input
                                            id="username"
                                            placeholder="johndoe123"
                                            required
                                            value={formData.username}
                                            onChange={handleChange}
                                            className="bg-white/5 border-white/10 h-11 pl-12 rounded-xl text-white placeholder:text-gray-600 focus-visible:ring-primary/50 transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-gray-300 ml-1">Email Address</Label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-focus-within:text-primary transition-colors" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="john@example.com"
                                            required
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="bg-white/5 border-white/10 h-11 pl-12 rounded-xl text-white placeholder:text-gray-600 focus-visible:ring-primary/50 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="whatsapp" className="text-gray-300 ml-1">WhatsApp Number</Label>
                                <div className="relative group">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-focus-within:text-primary transition-colors" />
                                    <Input
                                        id="whatsapp"
                                        type="tel"
                                        placeholder="+977 9800000000"
                                        required
                                        value={formData.whatsapp}
                                        onChange={handleChange}
                                        className="bg-white/5 border-white/10 h-11 pl-12 rounded-xl text-white placeholder:text-gray-600 focus-visible:ring-primary/50 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="password" title="password" className="text-gray-300 ml-1">Password</Label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-focus-within:text-primary transition-colors" />
                                        <Input
                                            id="password"
                                            type="password"
                                            placeholder="••••••••"
                                            required
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="bg-white/5 border-white/10 h-11 pl-12 rounded-xl text-white placeholder:text-gray-600 focus-visible:ring-primary/50 transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword" title="confirmPassword" className="text-gray-300 ml-1">Confirm Password</Label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-focus-within:text-primary transition-colors" />
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            placeholder="••••••••"
                                            required
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            className="bg-white/5 border-white/10 h-11 pl-12 rounded-xl text-white placeholder:text-gray-600 focus-visible:ring-primary/50 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start space-x-2 pt-2">
                                <Checkbox id="terms" className="mt-1 border-white/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary" required />
                                <Label htmlFor="terms" className="text-xs text-gray-400 leading-tight">
                                    I agree to the <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                                </Label>
                            </div>

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-blue-600 hover:from-blue-500 hover:to-blue-600 text-white font-bold text-base shadow-[0_4px_20px_rgba(37,99,235,0.3)] transition-all active:scale-[0.98] mt-2"
                            >
                                {isLoading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Creating account...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center gap-2">
                                        <span>Create Account</span>
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
                                    onError={() => toast.error("Google sign up failed")}
                                    theme="filled_blue"
                                    shape="pill"
                                    width="320"
                                    text="signup_with"
                                />
                            </div>
                        </form>

                        <div className="mt-8 pt-6 border-t border-white/5 text-center space-y-4">
                            <p className="text-sm text-gray-400">
                                Already have an account?{" "}
                                <Link href="/login" className="font-bold text-primary hover:text-blue-400 transition-colors">
                                    Sign In
                                </Link>
                            </p>
                            <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-xs font-bold text-gray-400 hover:text-white transition-all uppercase tracking-widest">
                                <ArrowLeft className="h-3 w-3" />
                                <span>Back to Home</span>
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                {/* Footer Features */}
                <div className="mt-8 flex justify-center gap-8 opacity-40">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-white" />
                        <span className="text-[10px] font-bold text-white uppercase tracking-widest">Verified</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-white" />
                        <span className="text-[10px] font-bold text-white uppercase tracking-widest">Fast Sync</span>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}