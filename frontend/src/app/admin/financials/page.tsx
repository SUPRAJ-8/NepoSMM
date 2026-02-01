"use client";

import { API_URL } from '@/lib/api-config'


import React, { useState, useEffect, useMemo } from "react"
import { toast } from "sonner"
import { motion } from "framer-motion"
import {
    Wallet, TrendingUp, TrendingDown, Clock,
    Search, Filter, Download, CheckCircle2,
    XCircle, AlertCircle, ArrowUpRight,
    ArrowDownLeft, DollarSign, CreditCard,
    MoreVertical, Eye, Edit, Trash2, ArrowUpDown, Plus
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
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
import { Checkbox } from "@/components/ui/checkbox"
import { useDashboardCurrency } from "@/context/DashboardCurrencyContext"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"



export default function FinancialsPage() {
    const { formatValue, currency } = useDashboardCurrency();
    const [transactions, setTransactions] = useState<any[]>([]);
    const [registeredUsers, setRegisteredUsers] = useState<any[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [rejectId, setRejectId] = useState<string | null>(null);
    const [refundId, setRefundId] = useState<string | null>(null);
    const [selectedTx, setSelectedTx] = useState<any | null>(null);
    const [rejectionReason, setRejectionReason] = useState("");
    const [refundReason, setRefundReason] = useState("");
    const [isManualDepositOpen, setIsManualDepositOpen] = useState(false);
    const [manualUser, setManualUser] = useState("");
    const [manualUserId, setManualUserId] = useState<number | null>(null);
    const [manualEmail, setManualEmail] = useState("");
    const [manualAmount, setManualAmount] = useState("");
    const [manualMethod, setManualMethod] = useState("Manual Transfer");
    const [userSearchQuery, setUserSearchQuery] = useState("");
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);

    // Fetch live users and transactions
    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("nepo_admin_token");
                const headers = { "Authorization": `Bearer ${token}` };

                const [usersRes, transactionsRes] = await Promise.all([
                    fetch(`${API_URL}/users`, { headers }),
                    fetch(`${API_URL}/users/all-transactions`, { headers })
                ]);

                if (usersRes.ok) {
                    const usersData = await usersRes.json();
                    setRegisteredUsers(usersData);
                }

                if (transactionsRes.ok) {
                    const txData = await transactionsRes.json();

                    // Filter to only show fund additions (deposits and manual additions)
                    // This removes "System" transactions which are usually order spends
                    const depositTransactions = txData.filter((tx: any) =>
                        tx.type === 'deposit' ||
                        tx.type === 'manual' ||
                        tx.type === 'bonus' ||
                        tx.type === 'fee'
                    );

                    const formattedTypes = depositTransactions.map((tx: any) => {
                        const metadata = typeof tx.metadata === 'string' ? JSON.parse(tx.metadata) : tx.metadata;
                        return {
                            dbId: tx.id,
                            id: `TX-${Number(metadata?.parent_tx_id || tx.id) + 9908}`,
                            user: tx.username || 'System',
                            email: tx.email || 'N/A',
                            method: tx.payment_method_name || (tx.type === 'manual' ? 'Manual' : (tx.type === 'bonus' ? 'Bonus' : (tx.type === 'fee' ? 'Fee' : 'System'))),
                            amount: parseFloat(tx.amount),
                            status: tx.status.charAt(0).toUpperCase() + tx.status.slice(1),
                            type: tx.type,
                            date: tx.created_at,
                            lastModified: tx.created_at,
                            comment: tx.description,
                            metadata: metadata,
                            currency: tx.payment_method_currency || (tx.type === 'manual' ? 'NPR' : 'USD')
                        };
                    });
                    setTransactions(formattedTypes);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData();
    }, []);

    const filteredUsers = useMemo(() => {
        if (!userSearchQuery) return [];
        return registeredUsers
            .filter(u =>
                u.username?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
                u.email?.toLowerCase().includes(userSearchQuery.toLowerCase())
            )
            .slice(0, 5);
    }, [userSearchQuery, registeredUsers]);

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedTransactions = [...transactions].sort((a: any, b: any) => {
        if (!sortConfig) return 0;

        const { key, direction } = sortConfig;
        if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
        if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
        return 0;
    });

    const getCurrencySymbol = (code: string) => {
        const symbols: Record<string, string> = {
            'USD': '$',
            'NPR': 'Rs.',
            'INR': '₹',
            'EUR': '€',
            'GBP': '£'
        };
        return symbols[code] || '$';
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const totalDeposits = transactions
        .filter(tx => tx.status === 'Approved')
        .reduce((sum, tx) => sum + tx.amount, 0);

    const pendingFunds = transactions
        .filter(tx => tx.status === 'Pending')
        .reduce((sum, tx) => sum + tx.amount, 0);

    const refundedFunds = transactions
        .filter(tx => tx.status === 'Refunded')
        .reduce((sum, tx) => sum + tx.amount, 0);

    const rejectedFunds = transactions
        .filter(tx => tx.status === 'Rejected')
        .reduce((sum, tx) => sum + tx.amount, 0);

    const stats = [
        { label: "Total Deposits", value: formatValue(totalDeposits), icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-400/10" },
        { label: "Pending Funds", value: formatValue(pendingFunds), icon: Clock, color: "text-amber-400", bg: "bg-amber-400/10" },
        { label: "Refunded", value: formatValue(refundedFunds), icon: TrendingDown, color: "text-purple-400", bg: "bg-purple-400/10" },
        { label: "Rejected", value: formatValue(rejectedFunds), icon: XCircle, color: "text-red-400", bg: "bg-red-400/10" },
    ]

    const toggleAll = () => {
        if (selectedIds.length === transactions.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(transactions.map(tx => tx.id));
        }
    };

    const toggleId = (id: string) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(i => i !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleDelete = async () => {
        if (deleteId) {
            try {
                const txToDelete = transactions.find(t => t.id === deleteId);
                const token = localStorage.getItem("nepo_admin_token");
                const response = await fetch(`${API_URL}/users/transactions/${txToDelete.dbId}`, {
                    method: "DELETE",
                    headers: { "Authorization": `Bearer ${token}` }
                });

                if (response.ok) {
                    setTransactions(transactions.filter(tx => tx.id !== deleteId));
                    setSelectedIds(selectedIds.filter(id => id !== deleteId));
                    toast.success(`Transaction ${deleteId} deleted successfully`);
                } else {
                    toast.error("Failed to delete transaction");
                }
            } catch (error) {
                toast.error("Error deleting transaction");
            }
            setDeleteId(null);
        }
    };

    const handleReject = async () => {
        if (!rejectionReason.trim()) {
            toast.error("Please provide a reason for rejection");
            return;
        }
        try {
            const txToReject = transactions.find(t => t.id === rejectId);
            const token = localStorage.getItem("nepo_admin_token");
            const response = await fetch(`${API_URL}/users/transactions/${txToReject.dbId}/reject`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ reason: rejectionReason })
            });

            if (response.ok) {
                setTransactions(transactions.map(tx =>
                    tx.id === rejectId
                        ? { ...tx, status: 'Rejected', comment: rejectionReason, lastModified: new Date().toISOString() }
                        : tx
                ));
                toast.success(`Transaction ${rejectId} rejected`);
            } else {
                toast.error("Failed to reject transaction");
            }
        } catch (error) {
            toast.error("Error rejecting transaction");
        }
        setRejectId(null);
        setRejectionReason("");
    };

    const handleAddManualDeposit = async () => {
        if (!manualUserId || !manualAmount) {
            toast.error("Please select a user and enter an amount");
            return;
        }

        try {
            const token = localStorage.getItem("nepo_admin_token");
            const response = await fetch(`${API_URL}/users/${manualUserId}/funds`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    amount: parseFloat(manualAmount),
                    type: "manual",
                    description: "Manually added by admin"
                })
            });

            if (!response.ok) throw new Error("Failed to add funds");

            const data = await response.json();

            // Create a new transaction object that matches the table format
            const newTx = {
                id: `TX-${Date.now() + 9908}`, // Temporary ID until refresh, or we could fetch the real one if the API returned it
                user: manualUser,
                email: manualEmail,
                method: "Manual Transfer",
                amount: parseFloat(manualAmount),
                status: "Approved",
                type: "manual",
                date: new Date().toISOString(),
                lastModified: new Date().toISOString(),
                comment: "Manually added by admin"
            };

            setTransactions([newTx, ...transactions]);
            toast.success("Manual deposit added successfully");

            // Reset form
            setIsManualDepositOpen(false);
            setManualUser("");
            setManualUserId(null);
            setManualEmail("");
            setManualAmount("");
            setManualMethod("Manual Transfer");
            setUserSearchQuery("");
        } catch (error) {
            console.error("Error adding funds:", error);
            toast.error("Failed to add funds");
        }
    };

    const handleApprove = async (id: string, dbId: number) => {
        try {
            const token = localStorage.getItem("nepo_admin_token");
            const response = await fetch(`${API_URL}/users/transactions/${dbId}/approve`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (response.ok) {
                setTransactions(transactions.map(tx =>
                    tx.id === id
                        ? { ...tx, status: 'Approved', lastModified: new Date().toISOString() }
                        : tx
                ));
                toast.success(`Transaction ${id} approved`);
            } else {
                toast.error("Failed to approve transaction");
            }
        } catch (error) {
            toast.error("Error approving transaction");
        }
    };

    const handleRefund = async () => {
        if (!refundReason.trim()) {
            toast.error("Please provide a reason for the refund");

            return;
        }

        try {
            const txToRefund = transactions.find(t => t.id === refundId);
            if (!txToRefund) return;

            const token = localStorage.getItem("nepo_admin_token");
            if (!token) return;

            const response = await fetch(`${API_URL}/users/transactions/${txToRefund.dbId}/refund`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ reason: refundReason })
            });

            if (response.ok) {
                setTransactions(transactions.map(tx =>
                    tx.id === refundId
                        ? { ...tx, status: 'Refunded', comment: refundReason, lastModified: new Date().toISOString() }
                        : tx
                ));
                toast.success(`Transaction ${refundId} refunded successfully`);
                setRefundId(null);
                setRefundReason("");
            } else {
                const data = await response.json();
                toast.error(data.error || "Failed to refund transaction");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error refunding transaction");
        }
    };

    const exportToCSV = () => {
        if (transactions.length === 0) {
            toast.error("No data to export");
            return;
        }

        const headers = ["ID", "User", "Email", "Method", "Amount", "Status", "Type", "Created Date", "Last Modified"];
        const rows = transactions.map(tx => [
            tx.id,
            tx.user,
            tx.email,
            tx.method,
            tx.amount,
            tx.status,
            tx.type,
            tx.date,
            tx.lastModified
        ]);

        const csvContent = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `financial_report_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Report CSV exported successfully!");
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Financials & Funds</h1>
                    <p className="text-gray-400 font-medium">Monitor transactions, manage deposits, and view revenue reports</p>
                </div>
                <div className="flex gap-3">
                    <Button
                        onClick={exportToCSV}
                        variant="outline"
                        className="border-white/5 bg-white/5 hover:bg-white/10 rounded-xl font-bold h-12 flex items-center gap-2"
                    >
                        <Download size={18} />
                        Export Report
                    </Button>
                    <Button
                        onClick={() => setIsManualDepositOpen(true)}
                        className="bg-purple-500 hover:bg-purple-400 text-white font-black px-6 rounded-xl shadow-lg shadow-purple-500/20 group"
                    >
                        <ArrowUpRight className="mr-2 h-5 w-5" />
                        Manual Deposit
                    </Button>
                    <Link href="/admin/financials/fund-manager">
                        <Button
                            className="bg-blue-500 hover:bg-blue-400 text-white font-black px-6 rounded-xl shadow-lg shadow-blue-500/20 group"
                        >
                            <CreditCard className="mr-2 h-5 w-5" />
                            Fund Manager
                        </Button>
                    </Link>
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
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Growth +12%</span>
                            </div>
                            <div className="flex flex-col">
                                <p className="text-xs font-black text-gray-500 uppercase tracking-widest">{stat.label}</p>
                                <h3 className="text-2xl font-black text-white">{stat.value}</h3>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Content Area */}
            <Card className="bg-white/5 border-white/5 backdrop-blur-sm shadow-2xl rounded-[2rem] overflow-hidden border-[1px]">
                <CardHeader className="p-8 border-b border-white/5">
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                        <div className="relative w-full md:w-96 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4 group-focus-within:text-purple-400 transition-colors" />
                            <Input
                                placeholder="Search by Transaction ID or user..."
                                className="bg-[#020617]/50 border-white/5 h-12 pl-12 rounded-2xl text-white placeholder:text-gray-600 focus-visible:ring-purple-500/30 transition-all border-[1px]"
                            />
                        </div>
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <Button variant="outline" className="flex-1 md:flex-none border-white/5 bg-white/5 hover:bg-white/10 rounded-xl font-bold h-12 flex items-center gap-2">
                                <Filter size={18} />
                                Status
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/[0.02] border-b border-white/5">
                                <th className="px-8 py-5 w-4">
                                    <Checkbox
                                        checked={transactions.length > 0 && selectedIds.length === transactions.length}
                                        onCheckedChange={toggleAll}
                                        className="border-white/10"
                                    />
                                </th>
                                <th className="px-4 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">#</th>
                                <th
                                    className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] cursor-pointer hover:text-white transition-colors group/th"
                                    onClick={() => handleSort('id')}
                                >
                                    <div className="flex items-center gap-2">
                                        Transaction ID
                                        <ArrowUpDown size={12} className={cn(
                                            "transition-colors",
                                            sortConfig?.key === 'id' ? "text-purple-400" : "text-gray-600 group-hover/th:text-purple-400"
                                        )} />
                                    </div>
                                </th>
                                <th
                                    className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] cursor-pointer hover:text-white transition-colors group/th"
                                    onClick={() => handleSort('user')}
                                >
                                    <div className="flex items-center gap-2">
                                        User
                                        <ArrowUpDown size={12} className={cn(
                                            "transition-colors",
                                            sortConfig?.key === 'user' ? "text-purple-400" : "text-gray-600 group-hover/th:text-purple-400"
                                        )} />
                                    </div>
                                </th>
                                <th
                                    className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] cursor-pointer hover:text-white transition-colors group/th"
                                    onClick={() => handleSort('method')}
                                >
                                    <div className="flex items-center gap-2">
                                        Method
                                        <ArrowUpDown size={12} className={cn(
                                            "transition-colors",
                                            sortConfig?.key === 'method' ? "text-purple-400" : "text-gray-600 group-hover/th:text-purple-400"
                                        )} />
                                    </div>
                                </th>
                                <th
                                    className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] cursor-pointer hover:text-white transition-colors group/th"
                                    onClick={() => handleSort('amount')}
                                >
                                    <div className="flex items-center gap-2">
                                        Amount
                                        <ArrowUpDown size={12} className={cn(
                                            "transition-colors",
                                            sortConfig?.key === 'amount' ? "text-purple-400" : "text-gray-600 group-hover/th:text-purple-400"
                                        )} />
                                    </div>
                                </th>
                                <th
                                    className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] cursor-pointer hover:text-white transition-colors group/th"
                                    onClick={() => handleSort('status')}
                                >
                                    <div className="flex items-center gap-2">
                                        Status
                                        <ArrowUpDown size={12} className={cn(
                                            "transition-colors",
                                            sortConfig?.key === 'status' ? "text-purple-400" : "text-gray-600 group-hover/th:text-purple-400"
                                        )} />
                                    </div>
                                </th>
                                <th
                                    className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] cursor-pointer hover:text-white transition-colors group/th"
                                    onClick={() => handleSort('date')}
                                >
                                    <div className="flex items-center gap-2">
                                        Date
                                        <ArrowUpDown size={12} className={cn(
                                            "transition-colors",
                                            sortConfig?.key === 'date' ? "text-purple-400" : "text-gray-600 group-hover/th:text-purple-400"
                                        )} />
                                    </div>
                                </th>
                                <th className="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {sortedTransactions.map((tx, index) => (
                                <tr
                                    key={tx.dbId}
                                    className="hover:bg-white/[0.01] transition-colors group cursor-pointer"
                                    onClick={() => setSelectedTx(tx)}
                                >
                                    <td className="px-8 py-4" onClick={(e) => e.stopPropagation()}>
                                        <Checkbox
                                            checked={selectedIds.includes(tx.id)}
                                            onCheckedChange={() => toggleId(tx.id)}
                                            className="border-white/10"
                                        />
                                    </td>
                                    <td className="px-4 py-4 text-xs font-bold text-gray-500">
                                        {index + 1}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-black text-white group-hover:text-purple-400 transition-colors font-mono">{tx.id}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-gray-300 uppercase tracking-tighter">{tx.user}</span>
                                            <span className="text-[10px] text-gray-500 lowercase font-medium">{tx.email}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="h-6 w-6 rounded bg-white/5 flex items-center justify-center">
                                                <CreditCard size={12} className="text-gray-400" />
                                            </div>
                                            <span className="text-xs font-bold text-gray-400">{tx.method}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            "text-sm font-black tracking-tight",
                                            (tx.type === 'deposit' || tx.type === 'manual' || tx.type === 'bonus') ? "text-emerald-400" : "text-red-400",
                                            tx.status === 'Pending' && "text-amber-400",
                                            tx.status === 'Rejected' && "text-red-400",
                                            tx.status === 'Refunded' && "text-purple-400"
                                        )}>
                                            {(tx.type === 'deposit' || tx.type === 'manual' || tx.type === 'bonus') ? '+' : '-'}{getCurrencySymbol(tx.currency)}{tx.amount.toFixed(2)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {tx.status === "Approved" && (
                                            <Badge className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-[10px] font-black uppercase tracking-wider border-none px-3 py-1 flex w-fit items-center gap-1">
                                                <CheckCircle2 size={10} /> Approved
                                            </Badge>
                                        )}
                                        {tx.status === "Pending" && (
                                            <Badge className="bg-amber-500/10 text-amber-400 hover:bg-amber-400/20 text-[10px] font-black uppercase tracking-wider border-none px-3 py-1 flex w-fit items-center gap-1">
                                                <AlertCircle size={10} /> Pending
                                            </Badge>
                                        )}
                                        {tx.status === "Rejected" && (
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20 text-[10px] font-black uppercase tracking-wider border-none px-3 py-1 flex w-fit items-center gap-1 cursor-help">
                                                            <XCircle size={10} /> Rejected
                                                        </Badge>
                                                    </TooltipTrigger>
                                                    {tx.comment && (
                                                        <TooltipContent className="bg-red-500 border-none text-white font-bold p-3 rounded-xl shadow-xl max-w-xs">
                                                            <p className="text-[10px] uppercase opacity-70 mb-1">Rejection Reason</p>
                                                            <p className="text-xs">{tx.comment}</p>
                                                        </TooltipContent>
                                                    )}
                                                </Tooltip>
                                            </TooltipProvider>
                                        )}
                                        {tx.status === "Refunded" && (
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Badge className="bg-purple-500/10 text-purple-400 hover:bg-purple-400/20 text-[10px] font-black uppercase tracking-wider border-none px-3 py-1 flex w-fit items-center gap-1 cursor-help">
                                                            <TrendingDown size={10} /> Refunded
                                                        </Badge>
                                                    </TooltipTrigger>
                                                    {tx.comment && (
                                                        <TooltipContent className="bg-purple-500 border-none text-white font-bold p-3 rounded-xl shadow-xl max-w-xs">
                                                            <p className="text-[10px] uppercase opacity-70 mb-1">Refund Reason</p>
                                                            <p className="text-xs">{tx.comment}</p>
                                                        </TooltipContent>
                                                    )}
                                                </Tooltip>
                                            </TooltipProvider>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-[9px] font-black text-gray-600 uppercase">Created:</span>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase">{formatDate(tx.date)}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-[9px] font-black text-gray-600 uppercase">Modified:</span>
                                                <span className="text-[10px] font-bold text-emerald-500/50 uppercase">{formatDate(tx.lastModified)}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setDeleteId(tx.id)}
                                                className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
                                            >
                                                <Trash2 size={16} />
                                            </Button>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-white/10 rounded-lg group/btn">
                                                        <MoreVertical className="h-4 w-4 text-gray-500 group-hover/btn:text-white transition-colors" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-56 bg-[#0b1021] border-white/5 text-white rounded-2xl p-2 shadow-2xl">
                                                    <DropdownMenuLabel className="px-3 py-2 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Transaction Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem
                                                        onClick={() => setSelectedTx(tx)}
                                                        className="rounded-xl focus:bg-purple-500 focus:text-white cursor-pointer group/item flex items-center gap-3 px-3 py-2.5"
                                                    >
                                                        <Eye size={16} />
                                                        <span className="font-bold text-sm">View Details</span>
                                                    </DropdownMenuItem>
                                                    {tx.status === 'Pending' && (
                                                        <>
                                                            <DropdownMenuItem
                                                                onClick={() => handleApprove(tx.id, tx.dbId)}
                                                                className="rounded-xl focus:bg-emerald-500 focus:text-black cursor-pointer group/item flex items-center gap-3 px-3 py-2.5"
                                                            >
                                                                <CheckCircle2 size={16} />
                                                                <span className="font-bold text-sm">Approve Deposit</span>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => setRejectId(tx.id)}
                                                                className="rounded-xl focus:bg-red-500 focus:text-white cursor-pointer group/item flex items-center gap-3 px-3 py-2.5"
                                                            >
                                                                <XCircle size={16} />
                                                                <span className="font-bold text-sm">Reject Deposit</span>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator className="bg-white/5 my-1" />
                                                            <DropdownMenuItem
                                                                onClick={() => setRefundId(tx.id)}
                                                                className="rounded-xl focus:bg-amber-500 focus:text-black cursor-pointer group/item flex items-center gap-3 px-3 py-2.5"
                                                            >
                                                                <DollarSign size={16} />
                                                                <span className="font-bold text-sm">Issue Refund</span>
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>

            {/* Deletion Confirmation */}
            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent className="bg-[#0b1021] border-white/5 rounded-[2rem] p-8">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-2xl font-black text-white px-2">Delete Transaction?</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-400 font-medium px-2 py-2">
                            Are you sure you want to delete transaction <span className="text-white font-black">{deleteId}</span>? This action is permanent and cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-6 gap-3">
                        <AlertDialogCancel className="border-white/5 bg-white/5 hover:bg-white/10 text-white rounded-xl h-12 font-bold px-6">
                            Keep Record
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-500 hover:bg-red-400 text-white rounded-xl h-12 font-black px-6 shadow-lg shadow-red-500/20"
                        >
                            Confirm Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Rejection Dialog */}
            <Dialog open={!!rejectId} onOpenChange={(open) => !open && setRejectId(null)}>
                <DialogContent className="bg-[#0b1021] border-white/5 rounded-[2rem] p-8 max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black text-white">Reject Transaction</DialogTitle>
                        <DialogDescription className="text-gray-400 font-medium">
                            Please provide a reason for rejecting transaction <span className="text-white font-black">{rejectId}</span>. This comment will be visible to the user.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Textarea
                            placeholder="e.g., Payment proof not clear, incorrect amount sent..."
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            className="bg-[#020617] border-white/5 rounded-2xl min-h-[120px] focus:ring-red-500/30 text-white placeholder:text-gray-600"
                        />
                    </div>
                    <DialogFooter className="gap-3">
                        <Button
                            variant="ghost"
                            onClick={() => setRejectId(null)}
                            className="hover:bg-white/5 text-gray-400 rounded-xl h-12 font-bold px-6"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleReject}
                            disabled={!rejectionReason.trim()}
                            className="bg-red-500 hover:bg-red-400 text-white rounded-xl h-12 font-black px-6 shadow-lg shadow-red-500/20 disabled:opacity-50"
                        >
                            Confirm Rejection
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Details Dialog */}
            <Dialog open={!!selectedTx} onOpenChange={(open) => !open && setSelectedTx(null)}>
                <DialogContent className="bg-[#0b1021] border-white/5 rounded-[2rem] p-8 max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black text-white">Transaction Details</DialogTitle>
                        <DialogDescription className="text-gray-400 font-medium">
                            Full information for transaction <span className="text-white font-black">{selectedTx?.id}</span>
                        </DialogDescription>
                    </DialogHeader>
                    {selectedTx && (
                        <div className="space-y-6 py-6 text-white">
                            {(() => {
                                // Logic to ensure we show Verification Details even for Bonus/Fee transactions
                                // by looking up the Parent Transaction's metadata.
                                let displayMetadata = selectedTx.metadata;

                                if (selectedTx.metadata?.parent_tx_id) {
                                    // Try to find the parent transaction in the current list
                                    const parentTx = transactions.find(t => t.dbId === Number(selectedTx.metadata.parent_tx_id));
                                    if (parentTx && parentTx.metadata) {
                                        displayMetadata = parentTx.metadata;
                                    }
                                }

                                return (
                                    <>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                                <p className="text-[10px] font-black text-gray-500 uppercase">Method</p>
                                                <p className="font-bold">{selectedTx.method}</p>
                                            </div>
                                            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                                <p className="text-[10px] font-black text-gray-500 uppercase">Amount</p>
                                                <p className="font-bold text-emerald-400">{getCurrencySymbol(selectedTx.currency)}{selectedTx.amount.toFixed(2)}</p>
                                            </div>
                                        </div>
                                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                            <p className="text-[10px] font-black text-gray-500 uppercase">Current Status</p>
                                            <Badge className={cn(
                                                "border-none px-3 py-1 text-[10px] font-black uppercase tracking-wider mt-1",
                                                selectedTx.status === 'Rejected' ? "bg-red-500/10 text-red-500" : "bg-purple-500/10 text-purple-400"
                                            )}>
                                                {selectedTx.status}
                                            </Badge>
                                        </div>
                                        {displayMetadata && (
                                            <div className="space-y-4">
                                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Verification Details</p>
                                                <div className="grid gap-3">
                                                    {(() => {
                                                        // Flatten metadata (pull 'fields' up if it exists)
                                                        const { fields, ...rest } = displayMetadata || {};
                                                        const displayData = { ...rest, ...(typeof fields === 'object' ? fields : {}) };

                                                        const entries = Object.entries(displayData).filter(([key]) => key !== 'parent_tx_id' && !key.endsWith('_loading'));

                                                        if (entries.length === 0) {
                                                            return <p className="text-sm text-gray-500 italic">No additional details available.</p>;
                                                        }

                                                        return entries.map(([key, value]: [string, any]) => (
                                                            <div key={key} className="bg-white/5 p-3 rounded-xl border border-white/5">
                                                                <p className="text-[10px] text-gray-500 font-black uppercase tracking-tighter mb-1">{key.replace(/_/g, ' ')}</p>
                                                                {typeof value === 'string' && (value.startsWith('http') || value.includes('/uploads/')) ? (
                                                                    <div className="mt-2">
                                                                        <img src={value} alt={key} className="rounded-lg max-h-40 object-contain bg-black/20 p-1 w-full" />
                                                                        <a href={value} target="_blank" rel="noreferrer" className="text-blue-400 text-[10px] font-black uppercase hover:underline flex items-center gap-1 mt-2 justify-end">
                                                                            <Eye size={10} /> Open Full Size
                                                                        </a>
                                                                    </div>
                                                                ) : (
                                                                    <p className="text-sm font-bold text-white tracking-tight break-all">{String(value)}</p>
                                                                )}
                                                            </div>
                                                        ));
                                                    })()}
                                                </div>
                                            </div>
                                        )}
                                        {selectedTx.comment && (selectedTx.status === 'Rejected' || selectedTx.status === 'Refunded') && (
                                            <div className={cn(
                                                "p-5 rounded-2xl border",
                                                selectedTx.status === 'Rejected' ? "bg-red-500/10 border-red-500/20" : "bg-purple-500/10 border-purple-500/20"
                                            )}>
                                                <p className={cn(
                                                    "text-[10px] font-black uppercase mb-2 flex items-center gap-2",
                                                    selectedTx.status === 'Rejected' ? "text-red-400" : "text-purple-400"
                                                )}>
                                                    {selectedTx.status === 'Rejected' ? <XCircle size={14} /> : <TrendingDown size={14} />}
                                                    {selectedTx.status === 'Rejected' ? 'Rejection Reason' : 'Refund Reason'}
                                                </p>
                                                <p className={cn(
                                                    "text-sm font-medium leading-relaxed italic",
                                                    selectedTx.status === 'Rejected' ? "text-red-200/90" : "text-purple-200/90"
                                                )}>"{selectedTx.comment}"</p>
                                            </div>
                                        )}
                                        <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
                                            <div className="flex justify-between text-xs font-medium text-gray-500 uppercase tracking-tighter">
                                                <span>Created</span>
                                                <span className="text-gray-300">{formatDate(selectedTx.date)}</span>
                                            </div>
                                            <div className="flex justify-between text-xs font-medium text-gray-500 uppercase tracking-tighter">
                                                <span>Last Modified</span>
                                                <span className="text-gray-300">{formatDate(selectedTx.lastModified)}</span>
                                            </div>
                                        </div>
                                    </>
                                );
                            })()}
                        </div>
                    )}
                    <DialogFooter>
                        <Button
                            onClick={() => setSelectedTx(null)}
                            className="bg-purple-500 hover:bg-purple-400 text-white rounded-xl h-12 w-full font-black shadow-lg shadow-purple-500/20"
                        >
                            Close Details
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Refund Dialog */}
            <Dialog open={!!refundId} onOpenChange={(open) => !open && setRefundId(null)}>
                <DialogContent className="bg-[#0b1021] border-white/5 rounded-[2rem] p-8 max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black text-white">Issue Refund</DialogTitle>
                        <DialogDescription className="text-gray-400 font-medium">
                            Please provide a reason for refunding transaction <span className="text-white font-black">{refundId}</span>.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Textarea
                            placeholder="e.g., Service not delivered, customer request, double payment..."
                            value={refundReason}
                            onChange={(e) => setRefundReason(e.target.value)}
                            className="bg-[#020617] border-white/5 rounded-2xl min-h-[120px] focus:ring-purple-500/30 text-white placeholder:text-gray-600"
                        />
                    </div>
                    <DialogFooter className="gap-3">
                        <Button
                            variant="ghost"
                            onClick={() => setRefundId(null)}
                            className="hover:bg-white/5 text-gray-400 rounded-xl h-12 font-bold px-6"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleRefund}
                            disabled={!refundReason.trim()}
                            className="bg-purple-500 hover:bg-purple-400 text-white rounded-xl h-12 font-black px-6 shadow-lg shadow-purple-500/20 disabled:opacity-50"
                        >
                            Confirm Refund
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Manual Deposit Dialog */}
            <Dialog open={isManualDepositOpen} onOpenChange={setIsManualDepositOpen}>
                <DialogContent className="bg-[#0b1021] border-white/5 rounded-[2.5rem] p-10 max-w-lg border-[1px] shadow-[0_0_50px_-12px_rgba(168,85,247,0.2)]">
                    <DialogHeader>
                        <DialogTitle className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
                                <Plus size={24} />
                            </div>
                            Manual Deposit
                        </DialogTitle>
                        <DialogDescription className="text-gray-400 font-medium text-lg mt-2">
                            Add a custom deposit record to the system instantly.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-8">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3 relative">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Search Registered User</Label>
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 h-4 w-4" />
                                    <Input
                                        placeholder="Search username..."
                                        value={manualUser || userSearchQuery}
                                        onChange={(e) => {
                                            setUserSearchQuery(e.target.value);
                                            setIsUserDropdownOpen(true);
                                            if (manualUser) setManualUser("");
                                        }}
                                        className="bg-[#020617] border-white/5 rounded-2xl h-14 pl-12 focus:ring-purple-500/30 text-white placeholder:text-gray-600 border-[1px]"
                                    />
                                </div>
                                {isUserDropdownOpen && filteredUsers.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-[#0b1021] border border-white/5 rounded-2xl overflow-hidden shadow-2xl z-50">
                                        {filteredUsers.map((u: any) => (
                                            <button
                                                key={u.id}
                                                onClick={() => {
                                                    setManualUser(u.username);
                                                    setManualUserId(u.id);
                                                    setManualEmail(u.email);
                                                    setUserSearchQuery(u.username);
                                                    setIsUserDropdownOpen(false);
                                                }}
                                                className="w-full px-5 py-3 text-left hover:bg-white/5 transition-colors flex flex-col border-b border-white/5 last:border-0"
                                            >
                                                <span className="text-sm font-bold text-white uppercase tracking-tight">{u.username}</span>
                                                <span className="text-[10px] text-gray-500">{u.email}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">User Email</Label>
                                <Input
                                    readOnly
                                    placeholder="Select a user first"
                                    value={manualEmail}
                                    className="bg-[#020617]/50 border-white/5 rounded-2xl h-14 text-white/50 border-[1px] cursor-not-allowed"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Deposit Amount (NPR)</Label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400 font-black text-sm">
                                        Rs.
                                    </div>
                                    <Input
                                        type="number"
                                        placeholder="0.00"
                                        value={manualAmount}
                                        onChange={(e) => setManualAmount(e.target.value)}
                                        className="bg-[#020617] border-white/5 rounded-2xl h-14 pl-12 focus:ring-purple-500/30 text-white placeholder:text-gray-600 border-[1px]"
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Payment Method</Label>
                                <Input
                                    readOnly
                                    value="Manual Transfer"
                                    className="bg-[#020617]/50 border-white/5 rounded-2xl h-14 text-emerald-400 font-bold border-[1px] cursor-not-allowed"
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="gap-4">
                        <Button
                            variant="ghost"
                            onClick={() => setIsManualDepositOpen(false)}
                            className="bg-white/5 hover:bg-white/10 text-gray-400 rounded-2xl h-14 font-bold flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAddManualDeposit}
                            className="bg-purple-500 hover:bg-purple-400 text-white rounded-2xl h-14 font-black flex-[2] shadow-xl shadow-purple-500/20 active:scale-95 transition-all"
                        >
                            Complete Deposit
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}