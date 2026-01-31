"use client";

import { API_URL } from '@/lib/api-config'


import React, { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Lock, Eye, EyeOff, ArrowRight, Sparkles, ShieldCheck, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"

export default function ResetPasswordPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get("token")

    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (!token) {
            toast.error("Invalid or missing reset token")
            router.push("/login")
        }
    }, [token, router])

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault()

        if (password !== confirmPassword) {
            toast.error("Passwords do not match")
            return
        }

        if (password.length < 6) {
            toast.error("Password must be at least 6 characters")
            return
        }

        setIsLoading(true)

        try {
            const response = await fetch("${API_URL}/users/reset-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    token,
                    password,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Reset failed")
            }

            toast.success("Password reset successful!", {
                description: "You can now log in with your new password.",
            })

            router.push("/login")
        } catch (error: any) {
            toast.error(error.message || "Failed to reset password. Link might be expired.")
        } finally {
            setIsLoading(false)
        }
    }

    if (!token) return null

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#020617] relative overflow-hidden p-4">
            {/* Dynamic Background Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-blue-500/5 blur-[150px] rounded-full" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-full max-w-md z-10"
            >
                {/* Brand/Logo */}
                <div className="flex flex-col items-center mb-8">
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.3)] mb-4"
                    >
                        <Lock className="h-8 w-8 text-white" />
                    </motion.div>
                    <h1 className="text-3xl font-black text-white tracking-tight">SocialBoost</h1>
                    <p className="text-gray-400 font-medium">Reset Your Password</p>
                </div>

                <Card className="border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl overflow-hidden rounded-[2rem] border-[1px]">
                    <CardContent className="p-8">
                        <div className="mb-8 text-center text-gray-300">
                            <h2 className="text-2xl font-bold text-white mb-2">New Password</h2>
                            <p className="text-sm">Set a strong password for your account</p>
                        </div>

                        <form onSubmit={handleReset} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="password" title="password" className="text-gray-300 ml-1">New Password</Label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-focus-within:text-emerald-400 transition-colors" />
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="bg-white/5 border-white/10 h-12 pl-12 pr-12 rounded-xl text-white placeholder:text-gray-600 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500/50 transition-all"
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

                            <div className="space-y-2">
                                <Label htmlFor="confirm-password" title="confirm-password" className="text-gray-300 ml-1">Confirm New Password</Label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-focus-within:text-emerald-400 transition-colors" />
                                    <Input
                                        id="confirm-password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="bg-white/5 border-white/10 h-12 pl-12 pr-12 rounded-xl text-white placeholder:text-gray-600 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500/50 transition-all"
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold text-base shadow-[0_4px_20px_rgba(16,185,129,0.3)] transition-all active:scale-[0.98]"
                            >
                                {isLoading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Resetting...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center gap-2">
                                        <span>Reset Password</span>
                                        <ArrowRight className="h-4 w-4" />
                                    </div>
                                )}
                            </Button>
                        </form>
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
                        <Sparkles className="h-4 w-4 text-white" />
                        <span className="text-[10px] font-bold text-white uppercase tracking-tighter">Premium</span>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}