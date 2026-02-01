"use client";

import { API_URL } from '@/lib/api-config'


import React, { useState, useEffect } from "react"
import { useDashboardCurrency } from "@/context/DashboardCurrencyContext"
import { motion } from "framer-motion"
import {
    Users, UserCheck, ShieldAlert,
    Wallet, Search, Filter, MoreVertical,
    Pencil, Banknote, Ban, UserX,
    ChevronLeft, ChevronRight,
    ArrowUpRight, ShoppingBag, CheckCircle2, Database, X, ChevronDown
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,

    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { useMemo } from "react"
import { cn } from "@/lib/utils"

const INITIAL_USERS: any[] = []

export default function UserManagementPage() {
    const { formatValue } = useDashboardCurrency();
    const [users, setUsers] = useState<any[]>([])
    const [isMounted, setIsMounted] = useState(false)

    // Handle Data Loading from API
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem("nepo_admin_token");
                console.log(`Fetching users from: ${API_URL}/users`);
                const response = await fetch(`${API_URL}/users`, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Failed to fetch users: ${response.status} ${response.statusText} - ${errorText}`);
                }

                const data = await response.json();

                // Map API data (All Users)
                const mappedUsers = data.map((u: any) => ({
                    id: u.id,
                    username: u.username || u.email.split('@')[0],
                    email: u.email,
                    balance: parseFloat(u.balance) || 0,
                    status: 'active', // Default for now
                    spent: parseFloat(u.spent) || 0,
                    orders: parseInt(u.orders) || 0,
                    joined: new Date(u.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
                    lastLogin: "Just Now", // Mock for now
                    location: "Global" // Mock for now
                }));

                setUsers(mappedUsers);
                setIsMounted(true);
            } catch (error) {
                console.error("Error fetching users:", error);
                toast.error("Failed to load users from database");
                setIsMounted(true);
            }
        };

        fetchUsers();
    }, []);

    // Filter State
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState("All Status")
    const [sortBy, setSortBy] = useState("Latest Joined")

    // Add Balance State
    const [balanceDialogOpen, setBalanceDialogOpen] = useState(false)
    const [selectedUserForBalance, setSelectedUserForBalance] = useState<any>(null)
    const [balanceAmount, setBalanceAmount] = useState("")
    const [balanceLoading, setBalanceLoading] = useState(false)

    const openBalanceDialog = (user: any) => {
        setSelectedUserForBalance(user)
        setBalanceAmount("")
        setBalanceDialogOpen(true)
    }

    const handleAddBalance = async () => {
        if (!selectedUserForBalance || !balanceAmount) return

        setBalanceLoading(true)
        try {
            const token = localStorage.getItem("nepo_admin_token")
            const response = await fetch(`${API_URL}/users/${selectedUserForBalance.id}/funds`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    amount: parseFloat(balanceAmount),
                    type: "manual",
                    description: "Manually added by admin"
                })
            })

            if (!response.ok) throw new Error("Failed to add funds")

            const data = await response.json()

            // Update local state
            setUsers(prev => prev.map(u =>
                u.id === selectedUserForBalance.id ? { ...u, balance: parseFloat(data.user.balance) } : u
            ))

            toast.success("Funds added successfully")
            setBalanceDialogOpen(false)
        } catch (error) {
            console.error("Error adding funds:", error)
            toast.error("Failed to add funds")
        } finally {
            setBalanceLoading(false)
        }
    }

    const stats = [
        { label: "Total Members", value: users.length.toString(), icon: Users, color: "text-purple-400", bg: "bg-purple-400/10" },
        { label: "Active Users", value: users.filter(u => u.status === 'active').length.toString(), icon: UserCheck, color: "text-emerald-400", bg: "bg-emerald-400/10" },
        { label: "Total Balance", value: formatValue(users.reduce((acc, u) => acc + u.balance, 0)), icon: Wallet, color: "text-cyan-400", bg: "bg-cyan-400/10" },
        { label: "Banned Users", value: users.filter(u => u.status === 'banned').length.toString(), icon: ShieldAlert, color: "text-red-400", bg: "bg-red-400/10" },
    ]

    const filteredUsers = useMemo(() => {
        let result = [...users]

        // Search Filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            result = result.filter(u =>
                u.username.toLowerCase().includes(query) ||
                u.email.toLowerCase().includes(query) ||
                u.id.toString().includes(query)
            )
        }

        // Status Filter
        if (statusFilter !== "All Status") {
            result = result.filter(u => u.status.toLowerCase() === statusFilter.toLowerCase())
        }

        // Sorting
        result.sort((a, b) => {
            if (sortBy === "Latest Joined") return b.id - a.id
            if (sortBy === "Name (A-Z)") return a.username.localeCompare(b.username)
            if (sortBy === "Balance (High-Low)") return b.balance - a.balance
            if (sortBy === "Status") return a.status.localeCompare(b.status)
            return 0
        })

        return result
    }, [users, searchQuery, statusFilter, sortBy])

    const clearAllFilters = () => {
        setSearchQuery("")
        setStatusFilter("All Status")
        setSortBy("Latest Joined")
    }

    const handleToggleStatus = (id: number) => {
        setUsers((prev: any[]) => prev.map((u: any) =>
            u.id === id ? { ...u, status: u.status === 'active' ? 'banned' : 'active' } : u
        ))
        const user = users.find((u: any) => u.id === id)
        toast.success(`User @${user?.username} status updated successfully.`)
    }



    const hasActiveFilters = searchQuery !== "" || statusFilter !== "All Status" || sortBy !== "Latest Joined"

    if (!isMounted) {
        return <div className="animate-pulse bg-[#020617] min-h-screen rounded-[2rem]"></div>
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Users & Members</h1>
                    <p className="text-gray-400 font-medium">Manage user permissions, balances, and security protocols</p>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <Card key={i} className="bg-white/5 border-white/5 backdrop-blur-sm overflow-hidden group hover:border-white/10 transition-colors">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-2 rounded-xl ${stat.bg} ${stat.color}`}>
                                    <stat.icon size={20} />
                                </div>
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Live Now</span>
                            </div>
                            <div className="flex flex-col">
                                <p className="text-xs font-black text-gray-500 uppercase tracking-widest">{stat.label}</p>
                                <h3 className="text-2xl font-black text-white">{stat.value}</h3>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Filter Bar */}
            <div className="bg-[#0f172a]/50 border border-white/5 rounded-[2rem] p-6">
                <div className="flex flex-col lg:flex-row gap-6 items-center">
                    <div className="relative flex-1 group w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4 group-focus-within:text-purple-400 transition-all" />
                        <Input
                            placeholder="Search users by name, email or ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-[#020617]/50 border-white/5 h-12 pl-12 rounded-xl text-white placeholder:text-gray-600 focus-visible:ring-purple-500/30 transition-all border-[1px]"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">

                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Status</span>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <div className="bg-[#020617]/50 border border-white/5 rounded-xl px-4 py-2 flex items-center gap-2 cursor-pointer hover:bg-white/5 transition-colors min-w-[140px] justify-between h-10">
                                        <span className="text-xs font-bold text-white tracking-tight">{statusFilter}</span>
                                        <ChevronDown size={14} className="text-gray-500" />
                                    </div>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="bg-[#0b1021] border-white/10 text-white rounded-2xl p-2 shadow-2xl backdrop-blur-xl w-40">
                                    {["All Status", "Active", "Banned"].map(status => (
                                        <DropdownMenuItem
                                            key={status}
                                            onClick={() => setStatusFilter(status)}
                                            className="rounded-xl focus:bg-emerald-500/20 focus:text-emerald-400 cursor-pointer font-bold text-xs py-2.5"
                                        >
                                            {status}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Sort By</span>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <div className="bg-[#020617]/50 border border-white/5 rounded-xl px-4 py-2 flex items-center gap-2 cursor-pointer hover:bg-white/5 transition-colors min-w-[180px] justify-between h-10">
                                        <span className="text-xs font-bold text-white tracking-tight">{sortBy}</span>
                                        <ChevronDown size={14} className="text-gray-500" />
                                    </div>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="bg-[#0b1021] border-white/10 text-white rounded-2xl p-2 shadow-2xl backdrop-blur-xl w-56">
                                    {["Latest Joined", "Name (A-Z)", "Balance (High-Low)", "Status"].map(opt => (
                                        <DropdownMenuItem
                                            key={opt}
                                            onClick={() => setSortBy(opt)}
                                            className="rounded-xl focus:bg-white/5 focus:text-white cursor-pointer font-bold text-xs py-2.5"
                                        >
                                            {opt}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <Button
                            variant="ghost"
                            onClick={clearAllFilters}
                            className="text-[10px] font-black text-gray-400 hover:text-white uppercase tracking-[0.1em] flex items-center gap-2 h-10 group"
                        >
                            <X size={14} className="group-hover:rotate-90 transition-transform" />
                            Clear All
                        </Button>
                    </div>
                </div>

                {/* Active Filters Row */}
                {hasActiveFilters && (
                    <div className="flex flex-wrap gap-3 items-center pt-6 mt-6 border-t border-white/5 animate-in slide-in-from-top-2 duration-300">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mr-2">Active Filters:</span>
                        {searchQuery && (
                            <Badge variant="outline" className="h-8 rounded-full border-blue-500/30 bg-blue-500/10 text-blue-400 font-bold px-4 py-0 gap-2 flex items-center">
                                Search: {searchQuery} <X size={12} className="cursor-pointer" onClick={() => setSearchQuery("")} />
                            </Badge>
                        )}
                        {statusFilter !== "All Status" && (
                            <Badge variant="outline" className="h-8 rounded-full border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-bold px-4 py-0 gap-2 flex items-center">
                                Status: {statusFilter} <X size={12} className="cursor-pointer" onClick={() => setStatusFilter("All Status")} />
                            </Badge>
                        )}
                        {sortBy !== "Latest Joined" && (
                            <Badge variant="outline" className="h-8 rounded-full border-white/10 bg-white/5 text-gray-400 font-bold px-4 py-0 gap-2 flex items-center">
                                Sort: {sortBy} <X size={12} className="cursor-pointer" onClick={() => setSortBy("Latest Joined")} />
                            </Badge>
                        )}
                    </div>
                )}
            </div>

            {/* User Table */}
            <Card className="bg-white/5 border-white/5 backdrop-blur-sm shadow-2xl rounded-[2rem] overflow-hidden border-[1px]">
                <CardContent className="p-0 overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/[0.02] border-b border-white/5">
                                <th className="px-3 py-2.5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] w-12 text-center">
                                    <Checkbox className="border-white/20 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500 rounded-[25%]" />
                                </th>
                                <th className="px-2 py-2.5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] w-12 text-center">#</th>
                                <th className="px-4 py-2.5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">User Identity</th>
                                <th className="px-4 py-2.5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Balance</th>
                                <th className="px-4 py-2.5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Total Spent</th>
                                <th className="px-4 py-2.5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Orders</th>
                                <th className="px-4 py-2.5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Joined Date</th>
                                <th className="px-4 py-2.5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Last Login</th>
                                <th className="px-4 py-2.5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                                <th className="px-6 py-2.5 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((user, index) => (
                                    <tr key={user.id} className="hover:bg-white/[0.01] transition-colors group">
                                        <td className="px-3 py-4 text-center">
                                            <Checkbox className="border-white/20 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500 rounded-[25%]" />
                                        </td>
                                        <td className="px-2 py-4 text-center">
                                            <span className="text-[10px] font-black text-gray-500 font-mono tracking-tighter">{(index + 1).toString().padStart(2, '0')}</span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-4">
                                                <Avatar className="h-12 w-12 rounded-2xl border-2 border-white/5 shadow-xl transition-transform group-hover:scale-105">
                                                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} />
                                                    <AvatarFallback className="bg-purple-500/20 text-purple-400 font-black">
                                                        {user.username[0].toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-sm font-black text-white group-hover:text-purple-400 transition-colors uppercase tracking-tight">@{user.username}</span>
                                                    <span className="text-xs font-bold text-gray-500 lowercase">{user.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            {user.balance > 0 ? (
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-white">{formatValue(user.balance)}</span>
                                                    <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mt-0.5">Available</span>
                                                </div>
                                            ) : (
                                                <div className="h-10"></div>
                                            )}
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-gray-300">{formatValue(user.spent)}</span>
                                                <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mt-0.5">Lifetime</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <span className="text-sm font-black text-white">{user.orders}</span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-white uppercase tracking-wider">{user.joined}</span>
                                                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">Registered</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{user.lastLogin}</span>
                                                <span className="text-[8px] font-bold text-gray-500 uppercase tracking-tighter">{user.location}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <Badge
                                                variant="outline"
                                                className={cn(
                                                    "h-7 rounded-lg font-black text-[9px] uppercase tracking-widest px-2",
                                                    user.status === "active"
                                                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                                                        : "border-red-500/30 bg-red-500/10 text-red-400"
                                                )}
                                            >
                                                {user.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            className={cn(
                                                                "h-9 w-9 p-0 rounded-xl transition-all",
                                                                user.status === "active"
                                                                    ? "hover:bg-orange-500/10 hover:text-orange-500"
                                                                    : "hover:bg-emerald-500/10 hover:text-emerald-500"
                                                            )}
                                                            title={user.status === "active" ? "Ban User" : "Unban User"}
                                                        >
                                                            {user.status === "active" ? <Ban size={16} /> : <CheckCircle2 size={16} />}
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent className="bg-[#0b1021] border-white/10 text-white rounded-3xl backdrop-blur-xl">
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle className="text-xl font-black text-white px-4">
                                                                {user.status === "active" ? "Confirm Ban Protocol" : "Restore Entity Access"}
                                                            </AlertDialogTitle>
                                                            <AlertDialogDescription className="text-gray-400 px-4">
                                                                {user.status === "active"
                                                                    ? `Are you sure you want to ban ${user.username}? This will immediately terminate their access to the platform nodes.`
                                                                    : `Are you sure you want to unban ${user.username}? This will restore their full access to the platform services.`
                                                                }
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter className="p-4 gap-3">
                                                            <AlertDialogCancel className="bg-white/5 border-white/5 text-white hover:bg-white/10 rounded-xl px-6 h-12 font-bold transition-all">Cancel</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() => handleToggleStatus(user.id)}
                                                                className={cn(
                                                                    "text-white rounded-xl px-6 h-12 font-black shadow-lg transition-all",
                                                                    user.status === "active"
                                                                        ? "bg-orange-500 hover:bg-orange-600 shadow-orange-500/20"
                                                                        : "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20"
                                                                )}
                                                            >
                                                                {user.status === "active" ? "Terminate Access" : "Restore Access"}
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>

                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-9 w-9 p-0 hover:bg-white/10 rounded-xl group/btn transition-all">
                                                            <MoreVertical className="h-5 w-5 text-gray-500 group-hover/btn:text-white transition-colors" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-56 bg-[#0b1021] border-white/10 text-white rounded-2xl p-2 shadow-2xl backdrop-blur-xl">
                                                        <DropdownMenuLabel className="px-3 py-2 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Entity Commands</DropdownMenuLabel>
                                                        <DropdownMenuItem className="rounded-xl focus:bg-purple-500 focus:text-white cursor-pointer group/item flex items-center gap-3 px-3 py-3">
                                                            <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center border border-purple-500/20 group-focus/item:bg-white/20 transition-colors">
                                                                <Pencil size={14} />
                                                            </div>
                                                            <span className="font-bold text-sm">Edit Profile</span>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => openBalanceDialog(user)}
                                                            className="rounded-xl focus:bg-emerald-500 focus:text-black cursor-pointer group/item flex items-center gap-3 px-3 py-3"
                                                        >
                                                            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-focus/item:bg-white/20 transition-colors">
                                                                <Banknote size={14} />
                                                            </div>
                                                            <span className="font-bold text-sm">Add Balance</span>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator className="bg-white/5 my-2" />
                                                        <DropdownMenuItem className="rounded-xl focus:bg-red-500 focus:text-white cursor-pointer group/item flex items-center gap-3 px-3 py-3 text-red-400 focus:text-white transition-colors">
                                                            <div className="h-8 w-8 rounded-lg bg-red-500/10 flex items-center justify-center border border-red-500/20 group-focus/item:bg-white/20 transition-colors">
                                                                <UserX size={14} />
                                                            </div>
                                                            <span className="font-bold text-sm">Ban Entity</span>
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={10} className="py-24">
                                        <div className="flex flex-col items-center justify-center space-y-4">
                                            <div className="p-6 rounded-full bg-white/5 border border-white/5 text-gray-600 animate-pulse">
                                                <Database size={48} />
                                            </div>
                                            <div className="text-center">
                                                <h3 className="text-xl font-black text-white uppercase tracking-tighter">No Entities Found</h3>
                                                <p className="text-sm font-medium text-gray-500 mt-1 max-w-[280px]">We couldn't find any users matching your current criteria nodes.</p>
                                            </div>
                                            <Button
                                                variant="outline"
                                                onClick={clearAllFilters}
                                                className="border-white/5 bg-white/5 hover:bg-white/10 rounded-xl font-bold px-6"
                                            >
                                                Reset All Filters
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </CardContent>
            </Card>

            <Dialog open={balanceDialogOpen} onOpenChange={setBalanceDialogOpen}>
                <DialogContent className="bg-[#0b1021] border-white/10 text-white sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add Funds to User</DialogTitle>
                        <DialogDescription className="text-gray-400">
                            Add balance to {selectedUserForBalance?.username}'s wallet. This action will be recorded in the transaction history.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex items-center space-x-2 py-4">
                        <div className="grid flex-1 gap-2">
                            <Label htmlFor="amount" className="sr-only">
                                Amount
                            </Label>
                            <Input
                                id="amount"
                                type="number"
                                placeholder="0.00"
                                value={balanceAmount}
                                onChange={(e) => setBalanceAmount(e.target.value)}
                                className="bg-white/5 border-white/10 text-white"
                            />
                        </div>
                    </div>
                    <DialogFooter className="sm:justify-end">
                        <Button
                            type="button"
                            variant="secondary"
                            className="bg-white/5 text-white hover:bg-white/10"
                            onClick={() => setBalanceDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            className="bg-emerald-500 hover:bg-emerald-600 text-white"
                            onClick={handleAddBalance}
                            disabled={balanceLoading}
                        >
                            {balanceLoading ? "Adding..." : "Add Funds"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    )
}