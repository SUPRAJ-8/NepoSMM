"use client";

import { API_URL } from "@/lib/api-config"
import { useEffect, useState } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Loader2, CreditCard, Eye } from "lucide-react"
import { cn } from "@/lib/utils"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

interface Transaction {
    id: number
    amount: number
    type: string
    description: string
    status: string
    created_at: string
    metadata?: any
    payment_method_id?: number
    payment_method_currency?: string
}

export function TransactionHistory() {
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedTx, setSelectedTx] = useState<Transaction | null>(null)
    const [open, setOpen] = useState(false)

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const token = localStorage.getItem("nepo_token")
                if (!token) return

                const response = await fetch(`${API_URL}/users/transactions`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })

                if (response.ok) {
                    const data: Transaction[] = await response.json()
                    // Filter to only show deposits, manual fund additions, bonuses and fees
                    const depositHistory = data.filter(tx =>
                        tx.type === 'deposit' ||
                        tx.type === 'manual' ||
                        tx.type === 'bonus' ||
                        tx.type === 'fee'
                    )
                    setTransactions(depositHistory)
                }
            } catch (error) {
                console.error("Failed to fetch transactions", error)
            } finally {
                setLoading(false)
            }
        }

        fetchTransactions()
    }, [])

    const getCurrencySymbol = (type: string, currency?: string) => {
        if (type === 'manual') return 'Rs.';

        const symbols: Record<string, string> = {
            'USD': '$',
            'NPR': 'Rs.',
            'INR': '₹',
            'EUR': '€',
            'GBP': '£'
        };
        return symbols[currency || 'USD'] || '$';
    };

    if (loading) {
        return (
            <div className="flex justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="bg-[#161c2e] border-white/5 text-white sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Transaction Details</DialogTitle>
                        <DialogDescription className="text-gray-400">
                            View parameters and metadata for this transaction.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedTx && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Transaction ID</p>
                                    <p className="font-mono text-sm font-bold text-blue-400">
                                        TX-{Number(typeof selectedTx.metadata === 'string' ? JSON.parse(selectedTx.metadata).parent_tx_id || selectedTx.id : selectedTx.metadata?.parent_tx_id || selectedTx.id) + 9908}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Amount</p>
                                    <p className={cn(
                                        "text-sm font-bold",
                                        (selectedTx.type === "deposit" || selectedTx.type === "manual" || selectedTx.type === "bonus") ? "text-emerald-400" : "text-red-400"
                                    )}>
                                        {(selectedTx.type === "deposit" || selectedTx.type === "manual" || selectedTx.type === "bonus") ? "+" : "-"}{getCurrencySymbol(selectedTx.type, selectedTx.payment_method_currency)}{Number(selectedTx.amount).toFixed(2)}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Date</p>
                                    <p className="text-sm font-medium text-gray-300">
                                        {format(new Date(selectedTx.created_at), "MMM d, yyyy HH:mm")}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Status</p>
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            "text-[10px] font-black uppercase tracking-tighter px-2 py-0.5 border-none",
                                            selectedTx.status === 'approved' && "bg-emerald-500/10 text-emerald-400",
                                            selectedTx.status === 'pending' && "bg-amber-500/10 text-amber-400",
                                            selectedTx.status === 'rejected' && "bg-red-500/10 text-red-400",
                                            selectedTx.status === 'refunded' && "bg-purple-500/10 text-purple-400",
                                            !selectedTx.status && "bg-gray-500/10 text-gray-400"
                                        )}
                                    >
                                        {selectedTx.status || selectedTx.type}
                                    </Badge>
                                </div>
                            </div>

                            {selectedTx.metadata && (() => {
                                const metadata = typeof selectedTx.metadata === 'string' ? JSON.parse(selectedTx.metadata) : selectedTx.metadata;
                                if (!metadata || Object.keys(metadata).length === 0) return null;

                                return (
                                    <div className="space-y-3 pt-4 border-t border-white/5">
                                        <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Verification Details</p>
                                        <div className="space-y-3">
                                            {Object.entries(metadata).map(([key, value]: [string, any]) => {
                                                if (key === 'parent_tx_id' || key.endsWith('_loading')) return null;
                                                return (
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
                                                            <p className="text-sm font-medium text-white break-all">{String(value)}</p>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {transactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center mb-4 text-muted-foreground/50">
                        <CreditCard className="h-8 w-8" />
                    </div>
                    <h3 className="text-lg font-black text-white mb-1 uppercase tracking-tight italic">No payment history</h3>
                    <p className="text-sm text-gray-500 font-medium">Your transaction history will appear here</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Desktop View */}
                    <div className="hidden md:block overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-white/5">
                                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-gray-500 pb-4 pt-0">ID</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-gray-500 pb-4 pt-0">Date</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-gray-500 pb-4 pt-0">Status</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-gray-500 pb-4 pt-0">Amount</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-gray-500 pb-4 pt-0">Description</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-gray-500 pb-4 pt-0 text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactions.map((tx) => (
                                    <TableRow key={tx.id} className="hover:bg-white/[0.02] border-white/5 transition-colors cursor-pointer" onClick={() => {
                                        setSelectedTx(tx);
                                        setOpen(true);
                                    }}>
                                        <TableCell className="font-bold text-blue-400 font-mono text-xs">
                                            TX-{Number(typeof tx.metadata === 'string' ? JSON.parse(tx.metadata).parent_tx_id || tx.id : tx.metadata?.parent_tx_id || tx.id) + 9908}
                                        </TableCell>
                                        <TableCell className="text-sm font-medium text-gray-300">
                                            {format(new Date(tx.created_at), "MMM d, yyyy HH:mm")}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={cn(
                                                    "text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 border-none rounded-md",
                                                    tx.status === 'approved' && "bg-emerald-500/10 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.1)]",
                                                    tx.status === 'pending' && "bg-amber-500/10 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.1)]",
                                                    tx.status === 'rejected' && "bg-red-500/10 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.1)]",
                                                    tx.status === 'refunded' && "bg-purple-500/10 text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.1)]",
                                                    !tx.status && "bg-gray-500/10 text-gray-400"
                                                )}
                                            >
                                                {tx.status || tx.type}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className={cn(
                                            "text-sm font-black tracking-tight",
                                            (tx.type === "deposit" || tx.type === "manual" || tx.type === "bonus") ? "text-emerald-400" : "text-red-400"
                                        )}>
                                            {(tx.type === "deposit" || tx.type === "manual" || tx.type === "bonus") ? "+" : "-"}{getCurrencySymbol(tx.type, tx.payment_method_currency)}{Number(tx.amount).toFixed(2)}
                                        </TableCell>
                                        <TableCell className="text-xs text-gray-500 font-medium max-w-[200px] truncate">
                                            {tx.description === "Manually added by admin via Financials" ? "Manually added by admin" : tx.description?.replace(" via Financials", "")}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white">
                                                <Eye className="h-4 w-4" />
                                            </button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Mobile View */}
                    <div className="md:hidden space-y-3">
                        {transactions.map((tx) => (
                            <div
                                key={tx.id}
                                className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col gap-3 active:scale-[0.98] transition-transform"
                                onClick={() => {
                                    setSelectedTx(tx);
                                    setOpen(true);
                                }}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-blue-400 font-mono">
                                            TX-{Number(typeof tx.metadata === 'string' ? JSON.parse(tx.metadata).parent_tx_id || tx.id : tx.metadata?.parent_tx_id || tx.id) + 9908}
                                        </span>
                                        <span className="text-[10px] font-bold text-gray-500">{format(new Date(tx.created_at), "MMM d, yyyy • HH:mm")}</span>
                                    </div>
                                    <div className={cn(
                                        "text-lg font-black tracking-tighter",
                                        (tx.type === "deposit" || tx.type === "manual" || tx.type === "bonus") ? "text-emerald-400" : "text-red-400"
                                    )}>
                                        {(tx.type === "deposit" || tx.type === "manual" || tx.type === "bonus") ? "+" : "-"}{getCurrencySymbol(tx.type, tx.payment_method_currency)}{Number(tx.amount).toFixed(2)}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between gap-4 pt-1 border-t border-white/5">
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            "text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 border-none rounded-md",
                                            tx.status === 'approved' && "bg-emerald-500/10 text-emerald-400",
                                            tx.status === 'pending' && "bg-amber-500/10 text-amber-400",
                                            tx.status === 'rejected' && "bg-red-500/10 text-red-400",
                                            tx.status === 'refunded' && "bg-purple-500/10 text-purple-400",
                                            !tx.status && "bg-gray-500/10 text-gray-400"
                                        )}
                                    >
                                        {tx.status || tx.type}
                                    </Badge>
                                    <span className="text-[10px] font-medium text-gray-500 truncate text-right flex-1">
                                        {tx.description === "Manually added by admin via Financials" ? "Manually added by admin" : tx.description?.replace(" via Financials", "")}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}