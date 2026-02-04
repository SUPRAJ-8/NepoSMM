"use client";

import React, { useState, useEffect } from "react"
import { Sidebar } from "@/components/dashboard/Sidebar"
import { WelcomeTour } from "@/components/dashboard/welcome-tour"
import { Header } from "@/components/header"
import { WhatsAppFloatButton } from "@/components/whatsapp-float-button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { User, Mail, Lock, Shield, CreditCard, Calendar, CheckCircle2, AlertCircle, Phone } from "lucide-react"
import { motion } from "framer-motion"
import { API_URL } from "@/lib/api-config"
import { useCurrency } from "@/context/CurrencyContext"
import { cn } from "@/lib/utils"

export default function AccountPage() {
    const { formatValue } = useCurrency()
    const [user, setUser] = useState<any>(null)
    const [isChangingPassword, setIsChangingPassword] = useState(false)
    const [is2FALoading, setIs2FALoading] = useState(false)

    // Profile form
    const [email, setEmail] = useState("")
    const [whatsapp, setWhatsapp] = useState("")
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)

    // Password form
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")

    useEffect(() => {
        const savedUser = localStorage.getItem("nepo_user")
        if (savedUser) {
            const parsedUser = JSON.parse(savedUser)
            setUser(parsedUser)
            setEmail(parsedUser.email || "")
            setWhatsapp(parsedUser.whatsapp || "")
        }
    }, [])

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsUpdatingProfile(true)

        try {
            const token = localStorage.getItem("nepo_token")
            const response = await fetch(`${API_URL}/users/profile`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ whatsapp })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Failed to update profile")
            }

            const updatedUser = { ...user, whatsapp: data.user.whatsapp }
            localStorage.setItem("nepo_user", JSON.stringify(updatedUser))
            setUser(updatedUser)
            toast.success("Profile updated successfully")
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setIsUpdatingProfile(false)
        }
    }


    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault()

        if (newPassword !== confirmPassword) {
            toast.error("New passwords do not match")
            return
        }

        if (newPassword.length < 6) {
            toast.error("Password must be at least 6 characters")
            return
        }

        setIsChangingPassword(true)

        try {
            const token = localStorage.getItem("nepo_token")
            const response = await fetch(`${API_URL}/users/change-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ currentPassword, newPassword })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Failed to change password")
            }

            toast.success("Password changed successfully")
            setCurrentPassword("")
            setNewPassword("")
            setConfirmPassword("")
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setIsChangingPassword(false)
        }
    }

    const handleToggle2FA = async (enabled: boolean) => {
        setIs2FALoading(true)
        try {
            const token = localStorage.getItem("nepo_token")
            const response = await fetch(`${API_URL}/users/toggle-2fa`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ enabled })
            })

            const data = await response.json()
            if (!response.ok) throw new Error(data.error || "Failed to toggle 2FA")

            const updatedUser = { ...user, two_factor_enabled: enabled }
            localStorage.setItem("nepo_user", JSON.stringify(updatedUser))
            setUser(updatedUser)
            toast.success(`2FA ${enabled ? 'enabled' : 'disabled'} successfully`)
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setIs2FALoading(false)
        }
    }

    if (!user) return null

    return (
        <div className="min-h-screen bg-background">
            <WelcomeTour />
            <Sidebar />
            <WhatsAppFloatButton />
            <div className="lg:pl-64">
                <Header title="Account Settings" showBadge={false} />
                <main className="p-4 lg:p-8 max-w-5xl mx-auto space-y-8">

                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <h2 className="text-3xl font-black text-foreground tracking-tight">Account Overview</h2>
                            <p className="text-muted-foreground mt-1 font-medium">Manage your profile and security settings.</p>
                        </div>
                        <div className="flex items-center gap-4 bg-primary/5 border border-primary/10 rounded-2xl p-4">
                            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                <Shield className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-widest font-black text-muted-foreground">Account Status</p>
                                <p className="text-lg font-black text-foreground">Verified Member</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Stats Cards */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="lg:col-span-1 space-y-6"
                        >
                            <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden rounded-3xl border">
                                <CardContent className="p-6 space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="h-14 w-14 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                                            <CreditCard className="h-7 w-7 text-blue-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-muted-foreground">Total Spent</p>
                                            <p className="text-2xl font-black">{formatValue(user.spent || 0)}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                                            <Calendar className="h-7 w-7 text-emerald-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-muted-foreground">Member Since</p>
                                            <p className="text-lg font-black">
                                                {new Date(user.created_at).toLocaleDateString(undefined, {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-border/50">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                                <Shield className={cn("h-5 w-5", user.two_factor_enabled ? "text-emerald-500" : "text-muted-foreground")} />
                                                <span className="text-sm font-bold">2-Step Verification</span>
                                            </div>
                                            <Switch
                                                checked={user.two_factor_enabled}
                                                onCheckedChange={handleToggle2FA}
                                                disabled={is2FALoading}
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {user.two_factor_enabled
                                                ? "Your account is protected with an extra layer of security."
                                                : "Secure your account by enabling two-step verification."}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-border/50 bg-primary/5 overflow-hidden rounded-3xl border">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-black uppercase tracking-widest text-primary">Support Desk</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-sm font-medium">Need to change your username or have other questions?</p>
                                    <Button variant="outline" className="w-full rounded-xl font-bold border-primary/20 hover:bg-primary/10">
                                        Contact Support
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Settings Forms */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Profile Section */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                <Card className="border-border/50 rounded-[2.5rem] overflow-hidden shadow-xl shadow-black/5 bg-card/30 backdrop-blur-md border">
                                    <CardHeader className="p-8 pb-4">
                                        <CardTitle className="text-2xl font-black">Profile Information</CardTitle>
                                        <CardDescription className="text-base font-medium">Update your contact information below.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-8 pt-4">
                                        <form onSubmit={handleUpdateProfile} className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Username</Label>
                                                    <div className="relative">
                                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                                        <Input
                                                            value={user.username}
                                                            disabled
                                                            className="h-14 pl-12 bg-muted/50 border-border/50 rounded-2xl font-bold text-foreground opacity-70"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Email Address</Label>
                                                    <div className="relative">
                                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                                        <Input
                                                            type="email"
                                                            value={email}
                                                            disabled
                                                            className="h-14 pl-12 bg-muted/50 border-border/50 rounded-2xl font-bold text-foreground opacity-70"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">WhatsApp Number</Label>
                                                <div className="relative group">
                                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                                    <Input
                                                        id="whatsapp"
                                                        type="tel"
                                                        placeholder="+977 9800000000"
                                                        required
                                                        value={whatsapp}
                                                        onChange={(e) => setWhatsapp(e.target.value)}
                                                        className="h-14 pl-12 bg-background/50 border-border/50 rounded-2xl font-bold focus:ring-primary/20 transition-all"
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex justify-end pt-2">
                                                <Button
                                                    type="submit"
                                                    disabled={isUpdatingProfile || whatsapp === user.whatsapp}
                                                    className="h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 text-white font-black shadow-lg shadow-primary/20 transition-all active:scale-95"
                                                >
                                                    {isUpdatingProfile ? "Updating..." : "Save Changes"}
                                                </Button>
                                            </div>
                                        </form>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            {/* Password Section */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <Card className="border-border/50 rounded-[2.5rem] overflow-hidden shadow-xl shadow-black/5 bg-card/30 backdrop-blur-md border">
                                    <CardHeader className="p-8 pb-4">
                                        <CardTitle className="text-2xl font-black">Security Settings</CardTitle>
                                        <CardDescription className="text-base font-medium">Update your password to keep your account secure.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-8 pt-4">
                                        <form onSubmit={handleChangePassword} className="space-y-6">
                                            <div className="space-y-2">
                                                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Current Password</Label>
                                                <div className="relative">
                                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                                    <Input
                                                        type="password"
                                                        value={currentPassword}
                                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                                        placeholder="••••••••"
                                                        className="h-14 pl-12 bg-background/50 border-border/50 rounded-2xl font-bold focus:ring-primary/20 transition-all"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">New Password</Label>
                                                    <div className="relative">
                                                        <Shield className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                                        <Input
                                                            type="password"
                                                            value={newPassword}
                                                            onChange={(e) => setNewPassword(e.target.value)}
                                                            placeholder="••••••••"
                                                            className="h-14 pl-12 bg-background/50 border-border/50 rounded-2xl font-bold focus:ring-primary/20 transition-all"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Confirm New Password</Label>
                                                    <div className="relative">
                                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                                        <Input
                                                            type="password"
                                                            value={confirmPassword}
                                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                                            placeholder="••••••••"
                                                            className="h-14 pl-12 bg-background/50 border-border/50 rounded-2xl font-bold focus:ring-primary/20 transition-all"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3">
                                                <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                                                <p className="text-xs text-amber-200/80 font-medium">
                                                    After changing your password, you will remain logged in on this device. Future logins will require the new password.
                                                </p>
                                            </div>

                                            <div className="flex justify-end pt-2">
                                                <Button
                                                    type="submit"
                                                    disabled={isChangingPassword || !newPassword || !currentPassword}
                                                    className="h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 text-white font-black shadow-lg shadow-primary/20 transition-all active:scale-95"
                                                >
                                                    {isChangingPassword ? "Updating..." : "Update Password"}
                                                </Button>
                                            </div>
                                        </form>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}
