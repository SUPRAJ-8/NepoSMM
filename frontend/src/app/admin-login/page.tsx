"use client";

import { API_URL } from '@/lib/api-config'


import React, { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Shield, Lock, User, ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"

export default function AdminLoginPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isLoading, setIsLoading] = useState(false)
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")

    React.useEffect(() => {
        if (searchParams.get("expired") === "true") {
            toast.error("Session Expired", {
                description: "Your admin session has expired. Please log in again.",
            })
        }
    }, [searchParams])

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const response = await fetch("${API_URL}/users/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: username, // API handles username or email in 'email' field
                    password: password
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Login failed");
            }

            const data = await response.json();

            if (data.user.role !== 'admin') {
                throw new Error("Access denied: You do not have admin privileges.");
            }

            // Store admin data and token
            localStorage.setItem("nepo_admin_token", data.token);
            localStorage.setItem("nepo_admin_user", JSON.stringify(data.user));

            toast.success("Access Granted", {
                description: `Welcome back, ${data.user.username}.`,
            })

            router.push("/admin")
        } catch (error: any) {
            toast.error(error.message || "Invalid credentials.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen w-full flex flex-col justify-center items-center bg-[#020617] relative p-4 sm:p-6 overflow-x-hidden font-sans">
            {/* Premium Background Effects */}
            {/* Premium Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[150px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/5 blur-[150px] rounded-full" />
            </div>

            {/* Subtle Noise and Grid */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
            <div
                className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full max-w-md z-10"
            >
                {/* Header Section */}
                <div className="flex flex-col items-center mb-10 text-center">
                    <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="h-20 w-20 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-2xl flex items-center justify-center shadow-2xl mb-6 relative group"
                    >
                        <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-3xl group-hover:bg-indigo-500/30 transition-all duration-500" />
                        <Shield className="h-10 w-10 text-indigo-400 relative z-10" />
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2"
                    >
                        Admin <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-indigo-600">Portal</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-gray-400 font-medium"
                    >
                        Secure access to NepoSMM Management
                    </motion.p>
                </div>

                {/* Login Form Card */}
                <Card className="border-white/[0.08] bg-[#0b1024]/50 backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden rounded-[2.5rem] border-[1px]">
                    <CardContent className="p-6 sm:p-8 md:p-10">
                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="username" className="text-sm font-semibold text-gray-300 ml-1">Admin Username</Label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                                    <Input
                                        id="username"
                                        type="text"
                                        placeholder="Enter username"
                                        required
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value.toLowerCase())}
                                        className="bg-white/5 border-white/10 h-14 pl-12 rounded-2xl text-white placeholder:text-gray-600 focus-visible:ring-indigo-500/50 focus-visible:border-indigo-500/50 transition-all text-lg"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between ml-1">
                                    <Label htmlFor="password" title="password" className="text-sm font-semibold text-gray-300">Password</Label>
                                </div>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="bg-white/5 border-white/10 h-14 pl-12 rounded-2xl text-white placeholder:text-gray-600 focus-visible:ring-indigo-500/50 focus-visible:border-indigo-500/50 transition-all text-lg"
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-14 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-lg shadow-[0_8px_30px_rgba(79,70,229,0.3)] transition-all active:scale-[0.98] mt-4"
                            >
                                {isLoading ? (
                                    <div className="flex items-center gap-3">
                                        <div className="h-5 w-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Signing in...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center gap-2">
                                        <span>Login to Panel</span>
                                        <ArrowRight className="h-5 w-5" />
                                    </div>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Footer Info */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mt-8 flex justify-center items-center gap-2 text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em]"
                >
                    <Sparkles className="h-3 w-3" />
                    <span>Secure Administrative Environment</span>
                    <Sparkles className="h-3 w-3" />
                </motion.div>
            </motion.div>
        </div>
    )
}