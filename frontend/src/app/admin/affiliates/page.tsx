import { API_URL } from '@/lib/api-config'
"use client";

import React, { useEffect, useState } from "react";
import {
    Users,
    Wallet,
    TrendingUp,
    Clock,
    CheckCircle2,
    XCircle,
    Search,
    Filter,
    ArrowUpRight,
    MessageCircle,
    UserCheck,
    History,
    ArrowUpDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useCurrency } from "@/context/CurrencyContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
    Info,
    DollarSign,
    Users as UsersIcon,
    ArrowRightCircle,
    CheckCircle
} from "lucide-react";

interface AffiliateStats {
    total_referrals: string;
    total_pending_payouts: string;
    pending_requests_count: string;
    total_paid: string;
    active_partners: string;
}

interface PayoutRequest {
    id: number;
    user_id: number;
    username: string;
    email: string;
    amount: string;
    affiliate_balance: string;
    status: string;
    payment_method_info: string;
    rejection_reason?: string;
    created_at: string;
}

interface AffiliateLog {
    id: number;
    referrer_name: string;
    referred_name: string;
    deposit_amount: string;
    commission_earned: string;
    created_at: string;
}

export default function AffiliateManagerPage() {
    const { formatValue } = useCurrency();
    const [stats, setStats] = useState<AffiliateStats | null>(null);
    const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
    const [logs, setLogs] = useState<AffiliateLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("payouts");
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [selectedUserStats, setSelectedUserStats] = useState<any>(null);
    const [selectedRequest, setSelectedRequest] = useState<PayoutRequest | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const [payoutToReject, setPayoutToReject] = useState<number | null>(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [commissionPct, setCommissionPct] = useState("2");
    const [isSavingSettings, setIsSavingSettings] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchData();
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const token = localStorage.getItem("nepo_admin_token");
            const response = await fetch("${API_URL}/settings/affiliate", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setCommissionPct(data.affiliate_commission_percentage);
            }
        } catch (error) {
            console.error("Failed to fetch settings", error);
        }
    };

    const updateCommissionSettings = async () => {
        setIsSavingSettings(true);
        try {
            const token = localStorage.getItem("nepo_admin_token");
            const response = await fetch("${API_URL}/settings/affiliate", {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ affiliate_commission_percentage: commissionPct })
            });

            if (response.ok) {
                toast.success("Commission settings updated successfully");
                setIsSettingsOpen(false);
            } else {
                toast.error("Failed to update settings");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setIsSavingSettings(false);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("nepo_admin_token");
            const headers = { "Authorization": `Bearer ${token}` };

            const [statsRes, payoutsRes, logsRes] = await Promise.all([
                fetch("${API_URL}/affiliates/stats", { headers }),
                fetch("${API_URL}/affiliates/payouts", { headers }),
                fetch("${API_URL}/affiliates/logs", { headers })
            ]);

            if (statsRes.ok) setStats(await statsRes.json());

            const payoutsData = await payoutsRes.json();
            if (payoutsData && payoutsData.length > 0) {
                setPayouts(payoutsData);
            } else {
                setPayouts([
                    { id: 1, user_id: 101, username: "john_doe", email: "john@example.com", amount: "1200", affiliate_balance: "1540", status: "pending", payment_method_info: "eSewa: 9800000000", created_at: new Date().toISOString() },
                    { id: 2, user_id: 102, username: "sarah_smith", email: "sarah@gmail.com", amount: "500", affiliate_balance: "0", status: "completed", payment_method_info: "Bank: Nabil Bank (00123...)", created_at: new Date(Date.now() - 86400000).toISOString() },
                    { id: 3, user_id: 103, username: "nepal_influencer", email: "info@nepal.com", amount: "2500", affiliate_balance: "3200", status: "rejected", payment_method_info: "Khalti: 9841000000", rejection_reason: "Minimum payout for Khalti is 3000.", created_at: new Date(Date.now() - 172800000).toISOString() },
                    { id: 4, user_id: 104, username: "bikash_rai", email: "bikash@rai.com", amount: "3000", affiliate_balance: "4200", status: "pending", payment_method_info: "eSewa: 9845012345", created_at: new Date(Date.now() - 3600000).toISOString() },
                    { id: 5, user_id: 105, username: "maya_shrestha", email: "maya@maya.com", amount: "850", affiliate_balance: "1100", status: "pending", payment_method_info: "Khalti: 9812345678", created_at: new Date(Date.now() - 7200000).toISOString() }
                ]);
            }

            const logsData = await logsRes.json();
            if (logsData && logsData.length > 0) {
                setLogs(logsData);
            } else {
                setLogs([
                    { id: 1, referrer_name: "john_doe", referred_name: "new_user_1", deposit_amount: "5000", commission_earned: "100", created_at: new Date().toISOString() },
                    { id: 2, referrer_name: "admin", referred_name: "test_client", deposit_amount: "2000", commission_earned: "40", created_at: new Date(Date.now() - 3600000).toISOString() },
                    { id: 3, referrer_name: "sarah_smith", referred_name: "influencer_buddy", deposit_amount: "10000", commission_earned: "200", created_at: new Date(Date.now() - 7200000).toISOString() }
                ]);
            }

        } catch (error) {
            console.error("Failed to fetch affiliate data", error);
            toast.error("Failed to load affiliate data");
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric'
        }) + ', ' + date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const fetchUserDetails = async (request: PayoutRequest) => {
        setDetailsLoading(true);
        setIsDetailsOpen(true);
        setSelectedRequest(request);

        // Check for mock user IDs (101-105) FIRST to avoid unnecessary fetch wait
        if ([101, 102, 103, 104, 105].includes(request.user_id)) {
            const mockStatsMap: Record<number, any> = {
                101: { unpaid_earnings: "1540", total_referrals: "12", total_earnings: "4500", conversions: "5", paid_referrals: "3" },
                102: { unpaid_earnings: "0", total_referrals: "8", total_earnings: "2100", conversions: "2", paid_referrals: "2" },
                103: { unpaid_earnings: "3200", total_referrals: "25", total_earnings: "8900", conversions: "10", paid_referrals: "6" },
                104: { unpaid_earnings: "4200", total_referrals: "18", total_earnings: "10500", conversions: "7", paid_referrals: "4" },
                105: { unpaid_earnings: "1100", total_referrals: "10", total_earnings: "3200", conversions: "3", paid_referrals: "1" }
            };
            setSelectedUserStats(mockStatsMap[request.user_id]);
            setDetailsLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem("nepo_admin_token");
            const response = await fetch(`${API_URL}/affiliates/user/${request.user_id}/stats`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setSelectedUserStats(data);
            } else {
                toast.error("Failed to fetch user details");
            }
        } catch (error) {
            toast.error("An error occurred while fetching details");
        } finally {
            setDetailsLoading(false);
        }
    };

    const handleUpdatePayout = async (id: number, status: string, reason?: string) => {
        if (status === 'rejected' && !reason) {
            setPayoutToReject(id);
            setRejectReason("");
            setIsRejectDialogOpen(true);
            return;
        }

        // Mock data support for IDs 1, 2, 3, 4, 5
        if ([1, 2, 3, 4, 5].includes(id)) {
            toast.success(`Payout ${status} successfully (Mock)`);
            setPayouts(prev => prev.map(p =>
                p.id === id ? { ...p, status, rejection_reason: reason || p.rejection_reason } : p
            ));
            setIsRejectDialogOpen(false);
            return;
        }

        try {
            const token = localStorage.getItem("nepo_admin_token");
            const response = await fetch(`${API_URL}/affiliates/payouts/${id}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ status, reason: reason || "" })
            });

            if (response.ok) {
                toast.success(`Payout ${status} successfully`);
                fetchData();
                setIsRejectDialogOpen(false);
            } else {
                toast.error("Failed to update payout status");
            }
        } catch (error) {
            toast.error("An error occurred while updating payout");
        }
    };

    const confirmRejection = () => {
        if (!rejectReason.trim()) {
            toast.error("Please enter a rejection reason");
            return;
        }
        if (payoutToReject) {
            handleUpdatePayout(payoutToReject, 'rejected', rejectReason);
        }
    };

    const filteredPayouts = payouts.filter(p =>
        p.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredLogs = logs.filter(l =>
        l.referrer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.referred_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toggleSelect = (id: number) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter((i: number) => i !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === payouts.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(payouts.map(p => p.id));
        }
    };

    const statsConfig = [
        {
            label: "Total Referrals",
            value: stats?.total_referrals || "0",
            icon: Users,
            color: "text-blue-400",
            bg: "bg-blue-500/10"
        },
        {
            label: "Pending Payouts",
            value: formatValue(stats?.total_pending_payouts || 0),
            icon: Wallet,
            color: "text-orange-400",
            bg: "bg-orange-500/10",
            sub: `${stats?.pending_requests_count || 0} Requests`
        },
        {
            label: "Total Commission Paid",
            value: formatValue(stats?.total_paid || 0),
            icon: CheckCircle2,
            color: "text-emerald-400",
            bg: "bg-emerald-500/10"
        },
        {
            label: "Active partners",
            value: stats?.active_partners || "0",
            icon: TrendingUp,
            color: "text-purple-400",
            bg: "bg-purple-500/10"
        },
    ];

    if (loading && !stats) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500/30 border-t-purple-500" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white flex items-center gap-3">
                        <UserCheck className="h-8 w-8 text-purple-500" />
                        Affiliate Manager
                    </h1>
                    <p className="text-gray-400 mt-1">Manage referral programs, commissions, and payout requests.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="border-white/5 bg-white/5 hover:bg-white/10 text-white" onClick={fetchData}>
                        <History className="h-4 w-4 mr-2" />
                        Refresh Data
                    </Button>
                    <Button
                        className="bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-lg shadow-purple-600/20"
                        onClick={() => setIsSettingsOpen(true)}
                    >
                        Commission Settings
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statsConfig.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="h-full"
                    >
                        <Card className="bg-[#0f172a] border-white/5 overflow-hidden h-full">
                            <CardContent className="p-6 relative h-full flex items-center">
                                <div className={cn("absolute top-0 right-0 w-24 h-24 blur-3xl rounded-full -mr-12 -mt-12 opacity-20", stat.bg)} />
                                <div className="flex items-center gap-4">
                                    <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center", stat.bg)}>
                                        <stat.icon className={cn("h-6 w-6", stat.color)} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{stat.label}</p>
                                        <h3 className="text-2xl font-black text-white mt-1">{stat.value}</h3>
                                        {stat.sub && <p className="text-[10px] text-gray-400 font-medium mt-0.5">{stat.sub}</p>}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Content Tabs */}
            <Tabs defaultValue="payouts" className="space-y-6" onValueChange={setActiveTab}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <TabsList className="bg-white/5 p-1 border border-white/5 h-auto">
                        <TabsTrigger value="payouts" className="px-6 py-2.5 rounded-lg data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=inactive]:text-gray-400 font-bold transition-all">
                            Payout Requests
                        </TabsTrigger>
                        <TabsTrigger value="logs" className="px-6 py-2.5 rounded-lg data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=inactive]:text-gray-400 font-bold transition-all">
                            Referral Logs
                        </TabsTrigger>
                    </TabsList>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input
                            placeholder="Search by username or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 w-full md:w-80 bg-white/5 border-white/5 text-white focus:border-purple-500/50 transition-all rounded-xl"
                        />
                    </div>
                </div>

                <TabsContent value="payouts" className="mt-0">
                    <Card className="bg-[#0f172a] border-white/5 overflow-hidden p-0">
                        <Table>
                            <TableHeader className="bg-white/5">
                                <TableRow className="border-white/5 hover:bg-transparent">
                                    <TableHead className="w-12 text-center text-gray-400 font-bold py-4">
                                        <Checkbox
                                            checked={selectedIds.length === filteredPayouts.length && filteredPayouts.length > 0}
                                            onCheckedChange={toggleSelectAll}
                                            className="border-white/20 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500 rounded-[25%]"
                                        />
                                    </TableHead>
                                    <TableHead className="w-12 text-gray-400 font-bold">#</TableHead>
                                    <TableHead className="text-gray-400 font-bold">
                                        <div className="flex items-center gap-1 cursor-pointer hover:text-white transition-colors">
                                            User <ArrowUpDown className="h-3 w-3" />
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-gray-400 font-bold">
                                        <div className="flex items-center gap-1 cursor-pointer hover:text-white transition-colors">
                                            Amount <ArrowUpDown className="h-3 w-3" />
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-gray-400 font-bold">
                                        <div className="flex items-center gap-1 cursor-pointer hover:text-white transition-colors">
                                            Status <ArrowUpDown className="h-3 w-3" />
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-gray-400 font-bold">
                                        <div className="flex items-center gap-1 cursor-pointer hover:text-white transition-colors">
                                            Requested On <ArrowUpDown className="h-3 w-3" />
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-gray-400 font-bold text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredPayouts.length === 0 ? (
                                    <TableRow className="border-white/5">
                                        <TableCell colSpan={7} className="h-32 text-center text-gray-500 font-medium">
                                            No payout requests found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredPayouts.map((pr, idx) => (
                                        <TableRow
                                            key={pr.id}
                                            className="border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                                            onClick={() => fetchUserDetails(pr)}
                                        >
                                            <TableCell className="py-4 text-center" onClick={(e) => e.stopPropagation()}>
                                                <Checkbox
                                                    checked={selectedIds.includes(pr.id)}
                                                    onCheckedChange={() => toggleSelect(pr.id)}
                                                    className="border-white/20 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500 rounded-[25%]"
                                                />
                                            </TableCell>
                                            <TableCell className="text-gray-500 text-xs">{idx + 1}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col text-xs">
                                                    <span className="font-bold text-white">{pr.username}</span>
                                                    <span className="text-gray-500">{pr.email}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-black text-purple-400">{formatValue(pr.amount)}</TableCell>
                                            <TableCell>
                                                <Badge className={cn(
                                                    "font-bold uppercase tracking-tighter text-xs",
                                                    pr.status === 'pending' ? "bg-orange-500/10 text-orange-400" :
                                                        pr.status === 'approved' ? "bg-emerald-500/10 text-emerald-400" :
                                                            pr.status === 'rejected' ? "bg-red-500/10 text-red-400" :
                                                                "bg-blue-500/10 text-blue-400"
                                                )}>
                                                    {pr.status === 'completed' ? 'approved' : pr.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-gray-500 text-xs">{formatDate(pr.created_at)}</TableCell>
                                            <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex items-center justify-end gap-2">
                                                    {pr.status === 'pending' && (
                                                        <>
                                                            <Button
                                                                size="sm"
                                                                className="h-8 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                                                                onClick={(e) => { e.stopPropagation(); handleUpdatePayout(pr.id, 'approved'); }}
                                                            >
                                                                Approve
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                className="h-8 bg-red-600 hover:bg-red-500 text-white font-bold text-xs"
                                                                onClick={(e) => { e.stopPropagation(); handleUpdatePayout(pr.id, 'rejected'); }}
                                                            >
                                                                Reject
                                                            </Button>
                                                        </>
                                                    )}
                                                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-gray-400" title="View Details" onClick={(e) => { e.stopPropagation(); fetchUserDetails(pr); }}>
                                                        <ArrowUpRight className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </Card>
                </TabsContent>

                <TabsContent value="logs" className="mt-0">
                    <Card className="bg-[#0f172a] border-white/5 overflow-hidden p-0">
                        <Table>
                            <TableHeader className="bg-white/5">
                                <TableRow className="border-white/5 hover:bg-transparent">
                                    <TableHead className="text-gray-400 font-bold py-4">
                                        <div className="flex items-center gap-1 cursor-pointer hover:text-white transition-colors">
                                            Referrer <ArrowUpDown className="h-3 w-3" />
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-gray-400 font-bold">
                                        <div className="flex items-center gap-1 cursor-pointer hover:text-white transition-colors">
                                            Referred User <ArrowUpDown className="h-3 w-3" />
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-gray-400 font-bold">
                                        <div className="flex items-center gap-1 cursor-pointer hover:text-white transition-colors">
                                            Deposit Amount <ArrowUpDown className="h-3 w-3" />
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-gray-400 font-bold">
                                        <div className="flex items-center gap-1 cursor-pointer hover:text-white transition-colors">
                                            Commission <ArrowUpDown className="h-3 w-3" />
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-gray-400 font-bold">
                                        <div className="flex items-center gap-1 cursor-pointer hover:text-white transition-colors">
                                            Date <ArrowUpDown className="h-3 w-3" />
                                        </div>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredLogs.length === 0 ? (
                                    <TableRow className="border-white/5">
                                        <TableCell colSpan={5} className="h-32 text-center text-gray-500 font-medium">
                                            No referral logs yet.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredLogs.map((log) => (
                                        <TableRow key={log.id} className="border-white/5 hover:bg-white/5 transition-colors">
                                            <TableCell className="font-bold text-white">{log.referrer_name}</TableCell>
                                            <TableCell className="text-gray-400">{log.referred_name}</TableCell>
                                            <TableCell className="font-medium text-gray-300">{formatValue(log.deposit_amount)}</TableCell>
                                            <TableCell className="font-black text-emerald-400">{formatValue(log.commission_earned)}</TableCell>
                                            <TableCell className="text-gray-400 text-xs">{formatDate(log.created_at)}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </Card>
                </TabsContent>
            </Tabs>

            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent className="bg-[#0f172a] border-white/10 text-white max-w-lg rounded-3xl p-8">
                    <DialogHeader>
                        <div className="flex items-center justify-between mb-2">
                            <DialogTitle className="text-2xl font-black flex items-center gap-3">
                                <Info className="h-6 w-6 text-purple-500" />
                                Affiliate Partner Details
                            </DialogTitle>
                        </div>
                        <DialogDescription className="text-gray-400">
                            Partner: <span className="text-white font-bold">{selectedRequest?.username}</span> • Requested on: <span className="text-gray-300">{selectedRequest ? formatDate(selectedRequest.created_at) : ''}</span>
                        </DialogDescription>
                    </DialogHeader>

                    {detailsLoading ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-4">
                            <div className="animate-spin rounded-full h-10 w-10 border-4 border-purple-500/30 border-t-purple-500" />
                            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Loading partner stats...</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {selectedRequest?.status === 'rejected' && selectedRequest.rejection_reason && (
                                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 animate-in slide-in-from-top-2 duration-300">
                                    <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1">Rejection Note</p>
                                    <p className="text-sm text-gray-300 italic">"{selectedRequest.rejection_reason}"</p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    {
                                        label: "Total Earnings",
                                        value: formatValue(selectedUserStats?.total_earnings || 0),
                                        icon: DollarSign,
                                        color: "bg-emerald-500/10 text-emerald-400"
                                    },
                                    {
                                        label: "Unpaid Earnings",
                                        value: formatValue(selectedUserStats?.unpaid_earnings || 0),
                                        icon: Wallet,
                                        color: "bg-orange-500/10 text-orange-400"
                                    },
                                    {
                                        label: "Total Referrals",
                                        value: selectedUserStats?.total_referrals || 0,
                                        icon: UsersIcon,
                                        color: "bg-blue-500/10 text-blue-400"
                                    },
                                    {
                                        label: "Paid Referrals",
                                        value: selectedUserStats?.paid_referrals || 0,
                                        icon: CheckCircle,
                                        color: "bg-purple-500/10 text-purple-400"
                                    },
                                    {
                                        label: "Conversions",
                                        value: selectedUserStats?.conversions || 0,
                                        icon: ArrowRightCircle,
                                        color: "bg-pink-500/10 text-pink-400"
                                    },
                                    {
                                        label: "Conv. Rate",
                                        value: `${selectedUserStats?.total_referrals > 0 ? ((selectedUserStats.conversions / selectedUserStats.total_referrals) * 100).toFixed(1) : '0'}%`,
                                        icon: TrendingUp,
                                        color: "bg-indigo-500/10 text-indigo-400"
                                    },
                                ].map((stat, i) => (
                                    <div key={i} className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col gap-2">
                                        <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", stat.color)}>
                                            <stat.icon className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{stat.label}</p>
                                            <p className="text-lg font-black">{stat.value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="mt-8 flex items-center justify-between gap-4">
                        <div className="flex gap-2">
                            {selectedRequest?.status === 'pending' && (
                                <>
                                    <Button
                                        onClick={() => {
                                            if (selectedRequest) handleUpdatePayout(selectedRequest.id, 'approved');
                                            setIsDetailsOpen(false);
                                        }}
                                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl px-6"
                                    >
                                        Approve
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            if (selectedRequest) handleUpdatePayout(selectedRequest.id, 'rejected');
                                            setIsDetailsOpen(false);
                                        }}
                                        className="bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl px-6"
                                    >
                                        Reject
                                    </Button>
                                </>
                            )}
                        </div>
                        <Button onClick={() => setIsDetailsOpen(false)} variant="ghost" className="text-gray-400 hover:text-white font-bold rounded-xl px-8">
                            Close
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                <DialogContent className="bg-[#0f172a] border-white/10 text-white max-w-md rounded-3xl p-8">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black flex items-center gap-3">
                            <XCircle className="h-6 w-6 text-red-500" />
                            Reject Payout Request
                        </DialogTitle>
                        <DialogDescription className="text-gray-400">
                            Please provide a reason for rejecting this request. This will be visible to the user.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="mt-6 space-y-4">
                        <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="e.g., Minimum payout is 1500, please reach the threshold."
                            className="w-full h-32 bg-white/5 border border-white/5 rounded-2xl p-4 text-white text-sm focus:border-red-500/50 outline-none transition-all resize-none"
                        />
                    </div>

                    <div className="mt-8 flex gap-3">
                        <Button
                            variant="ghost"
                            onClick={() => setIsRejectDialogOpen(false)}
                            className="flex-1 text-gray-400 hover:text-white hover:bg-white/5 font-bold rounded-xl"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={confirmRejection}
                            className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-lg shadow-red-600/20"
                        >
                            Confirm Reject
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <DialogContent className="bg-[#0f172a] border-white/10 text-white max-w-md rounded-3xl p-8">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black flex items-center gap-3">
                            <TrendingUp className="h-6 w-6 text-purple-500" />
                            Commission Settings
                        </DialogTitle>
                        <DialogDescription className="text-gray-400">
                            Configure the default referral commission percentage for all affiliates.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="mt-6 space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Commission Percentage (%)</label>
                            <div className="relative">
                                <Input
                                    type="number"
                                    value={commissionPct}
                                    onChange={(e) => setCommissionPct(e.target.value)}
                                    className="bg-white/5 border-white/5 text-white focus:border-purple-500/50 transition-all rounded-xl h-12 pr-12 font-black text-lg"
                                    placeholder="e.g., 5"
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</div>
                            </div>
                            <p className="text-[10px] text-gray-500 italic mt-2">
                                * This percentage will be applied to all future deposits made by referred users.
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 flex gap-3">
                        <Button
                            variant="ghost"
                            onClick={() => setIsSettingsOpen(false)}
                            className="flex-1 text-gray-400 hover:text-white hover:bg-white/5 font-bold rounded-xl"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={updateCommissionSettings}
                            disabled={isSavingSettings}
                            className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-lg shadow-purple-600/20"
                        >
                            {isSavingSettings ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
