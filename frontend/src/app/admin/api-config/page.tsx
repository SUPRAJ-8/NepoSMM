"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import {
    Search,
    Filter,
    Plus,
    List,
    TrendingUp,
    Atom,
    Activity,
    CheckCircle,
    XCircle,
    X,
    RefreshCw,
    MoreVertical,
    ChevronLeft,
    ChevronRight,
    Trash2,
    Edit2,
    Pencil,
    ArrowUp,
    ArrowDown,
    ArrowUpDown,
    Instagram,
    Youtube,
    Music
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { useCurrency } from "@/context/CurrencyContext";
import { API_URL } from "@/lib/api-config";

export default function ApiConfigPage() {
    const { formatValue } = useCurrency();
    const [activeTab, setActiveTab] = useState<"providers" | "catalog" | "logs">("providers");
    const [isAddProviderOpen, setIsAddProviderOpen] = useState(false);
    const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
    const [providers, setProviders] = useState<any[]>([]);
    const [services, setServices] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isServicesLoading, setIsServicesLoading] = useState(false);

    const fetchProviders = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/providers`);
            if (response.ok) {
                const data = await response.json();
                setProviders(data);
            }
        } catch (error) {
            console.error('Failed to fetch providers:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchServices = async () => {
        setIsServicesLoading(true);
        try {
            const response = await fetch(`${API_URL}/services`);
            if (response.ok) {
                const data = await response.json();
                setServices(data);
            }
        } catch (error) {
            console.error('Failed to fetch services:', error);
        } finally {
            setIsServicesLoading(false);
        }
    };

    useEffect(() => {
        fetchProviders();
    }, []);

    // Polling for background sync status
    useEffect(() => {
        const isSyncing = providers.some(p => p.sync_status === 'syncing');
        if (isSyncing) {
            const interval = setInterval(() => {
                // We use a silent version of fetchProviders to avoid flickering the main loader
                fetch(`${API_URL}/providers`)
                    .then(res => res.json())
                    .then(data => setProviders(data))
                    .catch(err => console.error('Polling error:', err));

                // Also silent refresh services to update counts
                fetch(`${API_URL}/services`)
                    .then(res => res.json())
                    .then(data => setServices(data))
                    .catch(err => console.error('Polling services error:', err));

            }, 5000);
            return () => clearInterval(interval);
        }
    }, [providers]);

    useEffect(() => {
        if (activeTab === 'catalog' && services.length === 0) {
            fetchServices();
        }
    }, [activeTab]);


    const totalProviderBalanceUSD = providers.reduce((acc, p) => acc + parseFloat(p.balance || 0), 0);

    return (
        <div className="space-y-6 animate-in fade-in duration-500 font-sans">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <h1 className="text-2xl font-bold text-white">API Management</h1>
                    <div className="flex gap-1 bg-ocean-royal/50 p-1 rounded-xl border border-ocean-ice/5">

                        <TabButton label="API Providers" active={activeTab === "providers"} onClick={() => setActiveTab("providers")} />
                        <TabButton label="Service Catalog" active={activeTab === "catalog"} onClick={() => setActiveTab("catalog")} />
                        <div className="relative">
                            <TabButton label="Sync Logs" active={activeTab === "logs"} onClick={() => setActiveTab("logs")} />
                            <div className="absolute top-2 right-2 h-2 w-2 bg-green-500 rounded-full animate-pulse border border-[#0f172a]"></div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <Button
                        onClick={() => setIsAddProviderOpen(true)}
                        className="bg-ocean-medium hover:bg-ocean-bright text-white font-bold h-10 px-6 gap-2 shadow-[0_0_15px_-3px_rgba(0,180,216,0.4)] transition-all hover:scale-[1.02] active:scale-[0.98]"

                    >
                        <Plus className="h-4 w-4" />
                        ADD PROVIDER
                    </Button>
                </div>
            </div>

            {activeTab === "providers" && (
                <ProvidersTab
                    selectedProvider={selectedProvider}
                    setSelectedProvider={setSelectedProvider}
                    providers={providers}
                    setProviders={setProviders}
                    services={services}
                    isLoading={isLoading}
                    onRefresh={() => {
                        fetchProviders();
                        fetchServices();
                    }}
                />

            )}
            {activeTab === "catalog" && (
                <ServiceCatalogTab
                    services={services}
                    providers={providers}
                    isLoading={isServicesLoading}
                    onRefresh={fetchServices}
                    onUpdateService={(id: string, updates: any) => {
                        setServices(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
                    }}
                />
            )}
            {activeTab === "logs" && <SyncLogsTab />}

            <AddProviderModal
                open={isAddProviderOpen}
                onOpenChange={setIsAddProviderOpen}
                onSuccess={() => {
                    fetchProviders();
                    fetchServices();
                }}
            />
        </div>
    );
}

function ProvidersTab({
    selectedProvider,
    setSelectedProvider,
    providers,
    setProviders,
    services,
    isLoading,
    onRefresh
}: {
    selectedProvider: string | null,
    setSelectedProvider: (id: string | null) => void,
    providers: any[],
    setProviders: React.Dispatch<React.SetStateAction<any[]>>,
    services: any[],
    isLoading: boolean,
    onRefresh: () => void
}) {
    const { formatValue } = useCurrency();
    if (selectedProvider) {
        return <ProviderDetailView
            providerId={selectedProvider}
            onBack={() => setSelectedProvider(null)}
            onSyncSuccess={onRefresh}
        />;
    }


    const [deleteTarget, setDeleteTarget] = useState<any>(null);
    const [editTarget, setEditTarget] = useState<any>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    const totalBalance = providers.reduce((acc, p) => acc + parseFloat(p.balance || 0), 0);
    const activeServices = services.filter(s => s.status === 'active').length;

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        try {
            const response = await fetch(`${API_URL}/providers/${deleteTarget.id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                onRefresh();
                setDeleteTarget(null);
            }
        } catch (error) {
            console.error('Failed to delete provider:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleUpdateProvider = async () => {
        if (!editTarget) return;
        setIsUpdating(true);
        try {
            const response = await fetch(`${API_URL}/providers/${editTarget.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: editTarget.name,
                    api_url: editTarget.api_url,
                    api_key: editTarget.api_key
                })
            });
            if (response.ok) {
                const updatedProvider = await response.json();
                setProviders(prev => prev.map(p => p.id === editTarget.id ? { ...p, ...updatedProvider.provider } : p));
                onRefresh();
                setEditTarget(null);
            }
        } catch (error) {
            console.error('Failed to update provider:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleToggleStatus = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

        // Optimistically update
        setProviders(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));

        try {
            await fetch(`${API_URL}/providers/${id}/toggle`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
        } catch (error) {
            console.error('Failed to toggle provider status:', error);
            onRefresh(); // Revert on error
        }
    };

    return (
        <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <ProviderStatCard title="PORTFOLIO BALANCE" value={formatValue(totalBalance)} />
                <ProviderStatCard title="ACTIVE NODES" value={providers.filter(p => p.status === 'active').length.toString()} subtitle={providers.length > 0 ? "NODES ONLINE" : "NO PROVIDERS"} />
                <ProviderStatCard title="IMPORTED SERVICES" value={services.filter(s => {
                    const provider = providers.find(p => p.id === s.provider_id);
                    return provider && provider.status === 'active';
                }).length.toString()} subtitle="TOTAL SERVICES" />

                <ProviderStatCard title="SYNC ANOMALIES" value="0" subtitle="ALL CLEAR" />
            </div>

            {/* Provider Matrix Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <h2 className="text-lg font-bold text-white">Provider Matrix</h2>
                    <span className="text-xs font-bold text-cyan-400 bg-cyan-400/10 px-2 py-1 rounded border border-cyan-400/20">LIVE DATA</span>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="h-10 px-4 rounded-xl bg-ocean-royal/20 border-ocean-ice/10 text-ocean-pale hover:text-white hover:bg-ocean-royal/40 gap-2">
                        <Filter className="h-4 w-4" />
                        Filter
                    </Button>
                    <Button onClick={onRefresh} className="h-10 px-4 rounded-xl bg-ocean-medium hover:bg-ocean-bright text-white font-bold gap-2">

                        <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                        Refresh Matrix
                    </Button>
                </div>
            </div>

            {/* Provider Table */}
            <div className="bg-ocean-royal/20 border border-ocean-ice/10 rounded-2xl overflow-hidden backdrop-blur-xl">

                <div className="grid grid-cols-12 gap-6 p-5 border-b border-white/5 text-[10px] font-bold text-gray-500 uppercase tracking-wider items-center">
                    <div className="col-span-1 flex items-center gap-3">
                        <Checkbox className="border-gray-600 data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500" />
                        <span>#</span>
                    </div>
                    <div className="col-span-3">Source Identity</div>
                    <div className="col-span-2">Escrow Balance</div>
                    <div className="col-span-2 text-center">Total Services</div>
                    <div className="col-span-2 text-center">Sync Status</div>
                    <div className="col-span-1 text-center">Status</div>
                    <div className="col-span-1 text-center">Actions</div>
                </div>

                <div className="divide-y divide-white/5">
                    {isLoading ? (
                        <div className="p-12 text-center text-gray-400">Loading providers...</div>
                    ) : providers.length === 0 ? (
                        /* Empty state - no providers yet */
                        <div className="p-12 text-center">
                            <div className="h-16 w-16 rounded-full bg-cyan-500/10 flex items-center justify-center mx-auto mb-4">
                                <svg className="h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                                    <line x1="3" y1="3" x2="21" y2="21" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">No Providers Yet</h3>
                            <p className="text-gray-400 text-sm mb-6">Get started by adding your first API provider to import services</p>
                        </div>
                    ) : (
                        providers.map((provider, index) => {
                            const providerServices = services.filter(s => s.provider_id === provider.id);
                            const isActive = provider.status === 'active';
                            return (
                                <ProviderRow
                                    key={provider.id}
                                    index={index + 1}
                                    id={provider.id}
                                    name={provider.name}
                                    type={provider.type || "STANDARD"}
                                    endpoint={provider.api_url.replace('https://', '')}
                                    balance={provider.balance}
                                    balanceStatus={parseFloat(provider.balance) > 10 ? "HEALTHY" : "LOW"}
                                    balanceAlert={parseFloat(provider.balance) <= 10}
                                    resources={providerServices.length.toString()}
                                    resourcesLabel="SERVICES"
                                    refreshStatus={provider.sync_status === 'syncing' ? 'Syncing...' : 'Sync Completed'}
                                    refreshTime={provider.last_sync ? new Date(provider.last_sync).toLocaleString() : 'Never'}
                                    linkHealth={isActive ? "online" : "offline"}
                                    icon={provider.type === "PREMIUM" ? "👑" : "🌐"}
                                    syncStatus={provider.sync_status}
                                    syncError={provider.sync_error}
                                    onClick={() => setSelectedProvider(provider.id)}
                                    onDelete={() => setDeleteTarget(provider)}
                                    onToggle={() => handleToggleStatus(provider.id, provider.status || 'active')}
                                    onEdit={() => setEditTarget({ ...provider })}
                                />

                            );
                        })
                    )}
                </div>

                {/* Pagination */}
                <div className="p-4 flex items-center justify-between text-xs text-gray-500 font-medium">
                    <div>DISPLAYING <span className="text-white">{providers.length} OF {providers.length}</span> ACTIVE PROVIDERS</div>
                    <div className="flex gap-2">
                        <Button size="sm" variant="ghost" className="h-8 px-3 rounded-lg bg-ocean-royal/30 hover:bg-ocean-royal/50 text-ocean-pale font-bold">
                            PREV
                        </Button>
                        <Button size="sm" className="h-8 w-8 rounded-lg bg-ocean-bright text-ocean-deep font-bold shadow-lg shadow-ocean-bright/30">1</Button>
                        <Button size="sm" variant="ghost" className="h-8 w-8 rounded-lg bg-ocean-royal/30 hover:bg-ocean-royal/50 text-ocean-pale font-bold">
                            NEXT
                        </Button>

                    </div>
                </div>
            </div>

            {/* Edit Provider Dialog */}
            <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
                <DialogContent
                    className="bg-ocean-deep border-ocean-ice/10 text-ocean-crystal max-w-md shadow-[0_0_50px_-12px_rgba(0,180,216,0.2)]"

                    onOpenAutoFocus={(e) => e.preventDefault()}
                >
                    <DialogHeader>
                        <DialogTitle>Edit Source Identity</DialogTitle>
                        <DialogDescription className="text-gray-400">
                            Update the provider's configuration details.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label>Provider Name</Label>
                            <Input
                                value={editTarget?.name || ''}
                                onChange={(e) => setEditTarget({ ...editTarget, name: e.target.value })}
                                className="bg-[#1e293b] border-white/5"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>API Endpoint</Label>
                            <Input
                                value={editTarget?.api_url || ''}
                                onChange={(e) => setEditTarget({ ...editTarget, api_url: e.target.value })}
                                className="bg-[#1e293b] border-white/5 font-mono text-xs"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>API Key</Label>
                            <Input
                                value={editTarget?.api_key || ''}
                                onChange={(e) => setEditTarget({ ...editTarget, api_key: e.target.value })}
                                className="bg-[#1e293b] border-white/5 font-mono text-xs"
                                type="password"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setEditTarget(null)}>Cancel</Button>
                        <Button
                            onClick={handleUpdateProvider}
                            disabled={isUpdating}
                            className="bg-cyan-500 hover:bg-cyan-600 text-white"
                        >
                            {isUpdating ? "Updating..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <DialogContent className="bg-[#0b1021] border-white/10 text-white max-w-sm rounded-2xl shadow-2xl shadow-red-500/10 animate-in zoom-in-95 duration-200 focus:outline-none">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3 text-red-500 text-xl font-bold">
                            <div className="h-12 w-12 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
                                <Trash2 className="h-6 w-6" />
                            </div>
                            Confirm Deletion
                        </DialogTitle>
                        <DialogDescription className="text-gray-400 pt-4 text-sm leading-relaxed">
                            Are you sure you want to remove <span className="text-white font-bold">{deleteTarget?.name}</span>?
                            This action will permanently delete this provider and all <span className="text-white font-bold">Linked Services</span> from your database.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex gap-3 mt-8">
                        <Button
                            variant="ghost"
                            className="flex-1 h-11 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/5 font-bold"
                            onClick={() => setDeleteTarget(null)}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="flex-1 h-11 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold shadow-lg shadow-red-500/20 transition-all hover:scale-[1.02] active:scale-95"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? "Removing..." : "Delete Node"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

function ServiceCatalogTab({
    services,
    providers,
    isLoading,
    onRefresh,
    onUpdateService
}: {
    services: any[],
    providers: any[],
    isLoading: boolean,
    onRefresh: () => void,
    onUpdateService: (id: string, updates: any) => void
}) {
    const { formatValue } = useCurrency();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [bulkMargin, setBulkMargin] = useState(45);
    const [isApplyingBulk, setIsApplyingBulk] = useState(false);



    const filteredServices = services.filter(service => {
        const provider = providers.find(p => p.id === service.provider_id);
        const isProviderActive = provider && provider.status === 'active';

        if (!isProviderActive) return false;

        const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            service.external_service_id.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
            service.category?.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesSearch;
    });


    const activeServicesCount = services.filter(s => {
        const provider = providers.find(p => p.id === s.provider_id);
        return s.status === 'active' && provider && provider.status === 'active';
    }).length;


    const handleBulkMarginApply = async () => {
        if (selectedIds.length === 0) return;
        setIsApplyingBulk(true);
        try {
            const response = await fetch(`${API_URL}/services/bulk-margin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: selectedIds, margin: bulkMargin })
            });
            if (response.ok) {
                onRefresh();
                setSelectedIds([]);
            }
        } catch (error) {
            console.error('Failed to apply bulk margin:', error);
        } finally {
            setIsApplyingBulk(false);
        }
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(filteredServices.map(s => s.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleToggleSelect = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    return (
        <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <StatCard title="ACTIVE SERVICES" value={activeServicesCount.toString()} icon={<List className="h-6 w-6 text-indigo-400" />} />

                <StatCard title="AVERAGE MARGIN" value="45%" icon={<TrendingUp className="h-6 w-6 text-green-400" />} />
                <StatCard title="PROVIDERS" value={providers.length.toString()} icon={<Atom className="h-6 w-6 text-purple-400" />} />
            </div>

            {/* Bulk Actions Panel */}
            <div className="bg-[#1e1b4b]/30 border border-indigo-500/20 rounded-2xl p-4 flex items-center justify-between backdrop-blur-sm">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3 px-4 py-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                        <Checkbox
                            checked={selectedIds.length === filteredServices.length && filteredServices.length > 0}
                            onCheckedChange={handleSelectAll}
                            className="border-indigo-400 data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500"
                        />
                        <span className="text-indigo-300 font-medium text-sm">{selectedIds.length} Services Selected</span>
                    </div>

                </div>

                <div className="flex items-center gap-4">
                    {/* Bulk actions could go here */}
                </div>

                <div className="flex items-center gap-6 bg-[#0f172a]/50 rounded-xl p-3 border border-indigo-500/10 hover:border-indigo-500/30 transition-colors group/margin">
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold uppercase text-gray-400 tracking-widest whitespace-nowrap">Bulk Margin</span>
                        <div className="relative group/input">
                            <input
                                type="number"
                                value={bulkMargin}
                                onChange={(e) => setBulkMargin(Math.min(1000, Math.max(0, parseInt(e.target.value) || 0)))}
                                className="w-16 h-9 bg-indigo-500/10 border border-indigo-500/30 rounded-lg text-right pr-6 pl-2 text-xs font-bold text-indigo-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-indigo-500/60 pointer-events-none">%</span>
                        </div>
                    </div>
                    <Button
                        onClick={handleBulkMarginApply}
                        disabled={selectedIds.length === 0 || isApplyingBulk}
                        size="sm"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-10 px-6 rounded-lg shadow-lg shadow-indigo-600/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
                    >
                        {isApplyingBulk ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                            "APPLY"
                        )}
                    </Button>
                </div>

            </div>


            {/* Filters & Search */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search services by name, ID or category..."
                        className="pl-11 h-12 bg-[#0f172a] border-white/5 rounded-xl text-sm focus-visible:ring-indigo-500/50"
                    />
                </div>
                <Button onClick={onRefresh} variant="outline" className="h-12 w-12 p-0 rounded-xl bg-[#0f172a] border-white/5 hover:bg-[#1e293b]">
                    <RefreshCw className={cn("h-5 w-5 text-gray-400", isLoading && "animate-spin")} />
                </Button>
            </div>


            {/* Services Table */}
            <div className="bg-[#0f172a] border border-white/5 rounded-2xl overflow-hidden">
                <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/5 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    <div className="col-span-1 flex justify-center">
                        <Checkbox
                            checked={selectedIds.length === filteredServices.length && filteredServices.length > 0}
                            onCheckedChange={handleSelectAll}
                            className="border-gray-600 data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500"
                        />
                    </div>

                    <div className="col-span-3">Service Details</div>
                    <div className="col-span-2">Category</div>
                    <div className="col-span-2">Provider Info</div>
                    <div className="col-span-2 text-center">Financials</div>
                    <div className="col-span-2 text-center">Status</div>
                </div>

                <div className="divide-y divide-white/5">
                    {isLoading ? (
                        <div className="p-12 text-center text-gray-400">Loading services...</div>
                    ) : filteredServices.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="h-16 w-16 rounded-full bg-indigo-500/10 flex items-center justify-center mx-auto mb-4">
                                <Search className="h-8 w-8 text-indigo-400" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">No Services Found</h3>
                            <p className="text-gray-400 text-sm">No services match your current search criteria</p>
                        </div>
                    ) : (
                        filteredServices.map((service) => {
                            const provider = providers.find(p => p.id === service.provider_id);
                            return (
                                <ServiceRow
                                    key={service.id}
                                    id={service.external_service_id}
                                    name={service.name}
                                    category={service.category || "Uncategorized"}
                                    provider={provider?.name || "Unknown"}
                                    providerType={provider?.type || "STANDARD"}
                                    baseCost={service.rate}
                                    sellingPrice={parseFloat(service.rate) * (1 + (service.margin || 45) / 100)}
                                    margin={`${service.margin || 45}%`}
                                    active={service.status === 'active'}
                                    serviceId={service.id}
                                    selected={selectedIds.includes(service.id)}
                                    onSelect={() => handleToggleSelect(service.id)}
                                    limits={`${service.min}-${service.max}`}
                                    onToggle={async () => {
                                        const newStatus = service.status === 'active' ? 'inactive' : 'active';
                                        try {
                                            await fetch(`${API_URL}/services/${service.id}/toggle`, {
                                                method: 'PATCH',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ status: newStatus })
                                            });
                                            onRefresh();
                                        } catch (e) { console.error(e); }
                                    }}
                                />

                            );
                        })
                    )}
                </div>

                {/* Pagination */}
                <div className="p-4 flex items-center justify-between text-xs text-gray-500 font-medium">
                    <div>SHOWING <span className="text-white">{filteredServices.length}</span> OF {services.filter(s => {
                        const provider = providers.find(p => p.id === s.provider_id);
                        return provider && provider.status === 'active';
                    }).length} SERVICES</div>

                    <div className="flex gap-2">
                        <Button size="icon" variant="ghost" disabled className="h-8 w-8 rounded-lg bg-[#1e293b] text-gray-400">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button size="icon" className="h-8 w-8 rounded-lg bg-cyan-500 text-white shadow-lg shadow-cyan-500/50">1</Button>
                        <Button size="icon" variant="ghost" disabled className="h-8 w-8 rounded-lg bg-[#1e293b] text-gray-400">
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div >
        </>
    );
}

function SyncLogsTab() {
    return (
        <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-8 text-center">
            <div className="text-gray-500 text-sm">Sync Logs view coming soon...</div>
        </div>
    );
}

function StatCard({ title, value, icon }: any) {
    return (
        <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-5 flex items-center justify-between overflow-hidden relative">
            <div className="absolute right-0 top-0 h-full w-1 bg-gradient-to-b from-transparent via-white/10 to-transparent opacity-50"></div>
            <div>
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">{title}</div>
                <div className="text-2xl font-bold text-white">{value}</div>
            </div>
            <div className="h-10 w-10 rounded-xl bg-[#1e293b] flex items-center justify-center border border-white/5">
                {icon}
            </div>
        </div>
    )
}

function TabButton({ label, active, onClick }: any) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "px-4 py-2 rounded-md text-xs font-bold transition-all duration-200",
                active ? "bg-[#1e293b] text-white shadow" : "text-gray-500 hover:text-gray-300"
            )}
        >
            {label}
        </button>
    )
}

function ProviderStatCard({ title, value, trend, trendUp, subtitle, alert }: any) {
    return (
        <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-5 relative overflow-hidden">
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">{title}</div>
            <div className="text-2xl font-bold text-white mb-1">{value}</div>
            {trend && (
                <div className={cn("text-xs font-bold", trendUp ? "text-green-400" : "text-gray-400")}>
                    {trend}
                </div>
            )}
            {subtitle && (
                <div className={cn("text-[10px] font-medium uppercase tracking-wider", alert ? "text-red-400" : "text-cyan-400")}>
                    {subtitle}
                </div>
            )}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent"></div>
        </div>
    )
}

function ProviderRow({
    index,
    id,
    name,
    type,
    endpoint,
    balance,
    balanceStatus,
    balanceAlert,
    resources,
    resourcesLabel,
    refreshStatus,
    refreshTime,
    linkHealth,
    icon,
    syncStatus,
    syncError,
    onClick,
    onDelete,
    onToggle,
    onEdit
}: any) {

    const { formatValue } = useCurrency();
    const balanceColor = balanceAlert
        ? balanceStatus === "DEPLETED" ? "text-red-500" : "text-orange-400"
        : "text-green-400";

    const healthColor = linkHealth === "online" ? "text-cyan-400" : "text-gray-600";

    return (
        <div
            className="grid grid-cols-12 gap-6 p-5 items-center hover:bg-white/[0.02] transition-colors group cursor-pointer"
            onClick={onClick}
        >
            <div className="col-span-1 flex items-center gap-3">
                <Checkbox
                    className="border-gray-600 data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500 w-4 h-4"
                    onClick={(e) => e.stopPropagation()}
                />
                <span className="text-xs font-mono text-gray-500 font-bold group-hover:text-cyan-400 transition-colors">
                    {index.toString().padStart(2, '0')}
                </span>
            </div>
            <div className="col-span-3">
                <div className="flex items-center gap-4">
                    <div className="h-11 w-11 rounded-xl bg-[#1e293b] flex items-center justify-center text-xl border border-white/5 shrink-0 shadow-inner">
                        {icon}
                    </div>
                    <div className="min-w-0">
                        <div className="font-bold text-sm text-white truncate">{name}</div>
                        <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">{type}</div>
                    </div>
                </div>
            </div>
            {/* Endpoint removed */}
            <div className="col-span-2">
                <div className={cn("text-base font-bold font-mono", balanceColor)}>{formatValue(balance)}</div>
                <div className={cn("text-[9px] font-black uppercase tracking-widest", balanceColor)}>{balanceStatus}</div>
            </div>
            <div className="col-span-2 text-center">
                <div className="text-cyan-400 font-bold text-sm">{resources}</div>
                <div className="text-[9px] text-gray-500 uppercase font-extrabold tracking-tighter">SERVICES AVAILABLE</div>
            </div>
            <div className="col-span-2 text-center">
                {syncStatus === 'syncing' ? (
                    <div className="flex flex-col items-center">
                        <RefreshCw className="h-4 w-4 text-cyan-400 animate-spin mb-1" />
                        <span className="text-[8px] font-black text-cyan-400 uppercase tracking-tighter">Syncing...</span>
                    </div>
                ) : syncStatus === 'failed' ? (
                    <div
                        className="flex flex-col items-center cursor-help transition-transform hover:scale-110 active:scale-95"
                        title={`Error: ${syncError}\nClick to view details`}
                        onClick={(e) => {
                            e.stopPropagation();
                            alert(`Sync Error Details:\n\n${syncError}`);
                        }}
                    >
                        <XCircle className="h-4 w-4 text-red-500 mb-1" />
                        <span className="text-[8px] font-black text-red-500 uppercase tracking-tighter">Failed</span>
                    </div>
                ) : (
                    <>
                        <div className="text-xs text-gray-300 font-bold mb-0.5 whitespace-nowrap uppercase">Ready</div>
                        <div className="flex flex-col items-center">
                            <div className="text-[8px] text-green-400 font-black uppercase tracking-tighter bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20 mb-1">
                                Synced
                            </div>
                            <div className="text-[9px] text-gray-500 font-mono font-bold">{refreshTime}</div>
                        </div>
                    </>
                )}
            </div>

            <div className="col-span-1 flex justify-center">
                <div className="flex items-center gap-3">
                    <Switch
                        checked={linkHealth === "online"}
                        onCheckedChange={() => onToggle()}
                        className="h-5 w-9 data-[state=checked]:bg-cyan-500"
                        onClick={(e) => e.stopPropagation()}
                    />
                    <span className={cn(
                        "text-[10px] font-bold uppercase tracking-wider w-12",
                        linkHealth === "online" ? "text-cyan-400" : "text-gray-500"
                    )}>
                        {linkHealth === "online" ? "Active" : "Inactive"}
                    </span>
                </div>
            </div>
            <div className="col-span-1 flex justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit();
                    }}
                    className="h-9 w-9 rounded-xl bg-blue-500/5 flex items-center justify-center text-blue-500/40 hover:bg-blue-500 hover:text-white transition-all transform hover:rotate-12 active:scale-90 border border-blue-500/10 hover:border-solid hover:shadow-lg hover:shadow-blue-500/20"
                >
                    <Pencil className="h-4 w-4" />
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                    }}
                    className="h-9 w-9 rounded-xl bg-red-500/5 flex items-center justify-center text-red-500/40 hover:bg-red-500 hover:text-white transition-all transform hover:rotate-12 active:scale-90 border border-red-500/10 hover:border-solid hover:shadow-lg hover:shadow-red-500/20"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            </div>
        </div>
    )
}

function ServiceRow({ name, id, limits, category, provider, providerType, baseCost, sellingPrice, margin, active, serviceId, selected, onSelect, onToggle }: any) {

    const { formatValue } = useCurrency();
    const CategoryIcon = category.toLowerCase().includes('instagram') ? Instagram : category.toLowerCase().includes('tiktok') ? Music : Youtube;
    const categoryColor = category.toLowerCase().includes('instagram') ? 'text-pink-500 bg-pink-500/10 border-pink-500/20' : category.toLowerCase().includes('tiktok') ? 'text-white bg-gray-800 border-gray-700' : 'text-red-500 bg-red-500/10 border-red-500/20';

    return (
        <div className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/[0.02] transition-colors group">
            <div className="col-span-1 flex justify-center">
                <Checkbox
                    checked={selected}
                    onCheckedChange={onSelect}
                    className="data-[state=checked]:bg-indigo-500 border-gray-600 data-[state=checked]:border-indigo-500"
                />
            </div>

            <div className="col-span-3">
                <div className="flex items-start gap-3">
                    <div className="pt-1.5 flex flex-col items-center">
                        <div className={cn("h-2 w-2 rounded-full", active ? "bg-green-500" : "bg-gray-600")}></div>
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="font-bold text-sm text-white mb-1 truncate pr-2" title={name}>{name}</div>
                        <div className="flex gap-4 text-[10px] text-gray-500 font-mono">
                            <span>ID: <span className="text-gray-300">#{id}</span></span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="col-span-2">
                <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider ${categoryColor}`}>
                    <CategoryIcon /> {category}
                </span>
            </div>
            <div className="col-span-2">
                <div className="text-sm font-bold text-gray-200">{provider}</div>
                <div className="flex items-center gap-2">
                    <div className="text-[10px] text-gray-500">{providerType}</div>
                </div>
            </div>
            <div className="col-span-2 bg-[#0f172a]/50 rounded-lg p-2 border border-white/5">
                <div className="flex items-center justify-between gap-4 mb-1">
                    <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">BASE</span>
                    <span className="font-mono text-xs text-gray-300 font-medium">{formatValue(baseCost)}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                    <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">SELL</span>
                    <span className="font-mono text-xs text-[#d8b4fe] font-bold">{formatValue(sellingPrice)}</span>
                </div>
            </div>
            <div className="col-span-2 flex justify-center">
                <div className="flex items-center gap-3">
                    <Switch
                        checked={active}
                        onCheckedChange={onToggle}
                        className="data-[state=checked]:bg-cyan-500 h-5 w-9"
                    />
                    <span className={cn(
                        "text-[10px] font-bold uppercase tracking-wider w-12",
                        active ? "text-cyan-400" : "text-gray-500"
                    )}>
                        {active ? "Active" : "Inactive"}
                    </span>
                </div>
            </div>
        </div>
    )
}

function AddProviderModal({ open, onOpenChange, onSuccess }: { open: boolean, onOpenChange: (open: boolean) => void, onSuccess: () => void }) {
    const [formData, setFormData] = useState({
        providerName: '',
        apiUrl: '',
        apiKey: '',
        currency: 'INR'
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess(false);

        try {
            const response = await fetch(`${API_URL}/providers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.providerName,
                    api_url: formData.apiUrl,
                    api_key: formData.apiKey,
                    currency: formData.currency
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to add provider');
            }

            setSuccess(true);
            onSuccess();

            // Reset form and close modal after success
            setTimeout(() => {
                setFormData({ providerName: '', apiUrl: '', apiKey: '', currency: 'INR' });
                setSuccess(false);
                onOpenChange(false);
            }, 2000);

        } catch (err: any) {
            setError(err.message || 'Failed to connect to provider. Please check your credentials and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl bg-[#0d1829] border-cyan-500/20 text-white p-0 overflow-hidden">
                <div className="grid grid-cols-5">
                    {/* Left Side - Integration Guide */}
                    <div className="col-span-2 bg-[#0a1220] p-8 border-r border-cyan-500/20">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="h-8 w-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                                <svg className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-cyan-400 font-bold uppercase tracking-wider text-sm">Integration Guide</h3>
                        </div>

                        <div className="space-y-6">
                            <IntegrationStep
                                number="01"
                                title="STEP 01"
                                description="Access your provider's dashboard and navigate to account credentials."
                                icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>}
                            />
                            <IntegrationStep
                                number="02"
                                title="STEP 02"
                                description="Locate the API Key section and generate a new token if needed."
                                icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>}
                            />
                            <IntegrationStep
                                number="03"
                                title="STEP 03"
                                description="Copy the full URL and the Key. Ensure the URL ends with /api/v2 or equivalent."
                                icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                            />
                        </div>

                        <div className="mt-12 pt-6 border-t border-white/5">
                            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3">Supported Protocols</div>
                            <div className="flex gap-2">
                                <div className="px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded text-xs text-cyan-400 font-mono">REST</div>
                                <div className="px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded text-xs text-cyan-400 font-mono">JSON</div>
                                <div className="px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded text-xs text-cyan-400 font-mono">HTTPS</div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Form */}
                    <div className="col-span-3 p-8">
                        <DialogHeader className="mb-6">
                            <DialogTitle className="text-2xl font-bold text-white">Add Provider</DialogTitle>
                            <DialogDescription className="text-gray-400">
                                Synchronize a new SMM source to your dashboard.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2 block">Provider Name</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                    </div>
                                    <Input
                                        value={formData.providerName}
                                        onChange={(e) => setFormData({ ...formData, providerName: e.target.value })}
                                        placeholder="e.g., GlobalSMM Elite"
                                        required
                                        className="pl-11 h-12 bg-[#0a1220] border-cyan-500/20 text-white placeholder:text-gray-600 focus-visible:ring-cyan-500/50 rounded-lg"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2 block">API URL</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                        </svg>
                                    </div>
                                    <Input
                                        value={formData.apiUrl}
                                        onChange={(e) => setFormData({ ...formData, apiUrl: e.target.value })}
                                        placeholder="https://provider.com/api/v2"
                                        required
                                        type="url"
                                        className="pl-11 h-12 bg-[#0a1220] border-cyan-500/20 text-white placeholder:text-gray-600 focus-visible:ring-cyan-500/50 rounded-lg font-mono text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2 block">API KEY</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                        </svg>
                                    </div>
                                    <Input
                                        value={formData.apiKey}
                                        onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                                        type="password"
                                        placeholder="••••••••••••••••••••••••"
                                        required
                                        className="pl-11 h-12 bg-[#0a1220] border-cyan-500/20 text-white placeholder:text-gray-600 focus-visible:ring-cyan-500/50 rounded-lg font-mono text-sm"
                                    />
                                </div>
                            </div>

                            {/* Currency Selection */}
                            <div>
                                <label className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2 block">Source Currency</label>
                                <div className="grid grid-cols-4 gap-3">
                                    {['INR', 'USD', 'EUR', 'NPR'].map((curr) => (
                                        <button
                                            key={curr}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, currency: curr })}
                                            className={cn(
                                                "h-12 rounded-xl border font-bold text-sm transition-all",
                                                formData.currency === curr
                                                    ? "bg-cyan-500 border-cyan-500 text-white shadow-lg shadow-cyan-500/20"
                                                    : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                                            )}
                                        >
                                            {curr}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-[10px] text-gray-400 mt-2 italic">* We will auto-convert these values to NPR based on live rates.</p>
                            </div>

                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start gap-3">
                                    <svg className="h-5 w-5 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div className="text-sm text-red-300">{error}</div>
                                </div>
                            )}

                            {success && (
                                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 flex items-start gap-3">
                                    <svg className="h-5 w-5 text-green-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div className="text-sm text-green-300">Provider added! Services are being imported in the background. You can close this now.</div>
                                </div>
                            )}


                            <Button
                                type="submit"
                                disabled={isLoading || success}
                                className="w-full h-14 text-base font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 rounded-xl shadow-lg shadow-cyan-900/20 mt-8 gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <>
                                        <RefreshCw className="h-5 w-5 animate-spin" />
                                        FETCHING SERVICES...
                                    </>
                                ) : success ? (
                                    <>
                                        <CheckCircle className="h-5 w-5" />
                                        PROVIDER ADDED
                                    </>
                                ) : (
                                    <>
                                        <RefreshCw className="h-5 w-5" />
                                        FETCH & ADD PROVIDER
                                    </>
                                )}
                            </Button>

                            <p className="text-center text-[10px] text-gray-500 mt-4">
                                BY CLICKING, YOU AUTHORIZE NEOPOSMM TO PERFORM A HANDSHAKE WITH THE PROVIDER
                            </p>
                        </form>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

function EditServiceModal({ open, onOpenChange, service, onSuccess }: { open: boolean, onOpenChange: (open: boolean) => void, service: any, onSuccess: () => void }) {
    const [formData, setFormData] = useState<any>({
        name: '',
        category: '',
        rate: 0,
        margin: 45,
        description: '',
        average_time: '',
        guarantee: '',
        start_time: '',
        speed: '',
        status: 'active'
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isDetailLoading, setIsDetailLoading] = useState(false);

    useEffect(() => {
        if (service) {
            const fetchFullDetail = async () => {
                setIsDetailLoading(true);
                try {
                    const response = await fetch(`${API_URL}/services/${service.id}`);
                    if (response.ok) {
                        const fullService = await response.json();
                        setFormData({
                            name: fullService.name || '',
                            category: fullService.category || '',
                            rate: parseFloat(fullService.rate) || 0,
                            margin: fullService.margin || 45,
                            description: fullService.description || '',
                            average_time: fullService.average_time || '',
                            guarantee: fullService.guarantee || '',
                            start_time: fullService.start_time || '',
                            speed: fullService.speed || '',
                            status: fullService.status || 'active'
                        });
                    }
                } catch (error) {
                    console.error('Failed to fetch full service detail:', error);
                } finally {
                    setIsDetailLoading(false);
                }
            };
            fetchFullDetail();
        }
    }, [service]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/services/${service.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                onSuccess();
                onOpenChange(false);
            }
        } catch (error) {
            console.error('Failed to update service:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!service) return null;

    const sellingPrice = formData.rate * (1 + formData.margin / 100);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl bg-[#0d1829] border-cyan-500/20 text-white p-0 overflow-hidden">
                <div className="p-6 border-b border-white/5 bg-[#0a1220]">
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle className="text-xl font-bold flex items-center gap-2">
                                <Edit2 className="h-5 w-5 text-cyan-400" />
                                Edit Service
                            </DialogTitle>
                            <DialogDescription className="text-gray-400">
                                Service ID: <span className="text-cyan-400 font-mono">#{service.external_service_id}</span>
                            </DialogDescription>
                        </div>
                        <div className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                            formData.status === 'active' ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
                        )}>
                            {formData.status}
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Service Name</Label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="bg-[#0a1220] border-white/10 h-11"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Category</Label>
                            <Input
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="bg-[#0a1220] border-white/10 h-11"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Base Cost (NPR)</Label>
                            <Input
                                type="number"
                                step="0.000001"
                                value={formData.rate}
                                onChange={(e) => setFormData({ ...formData, rate: parseFloat(e.target.value) })}
                                className="bg-[#0a1220] border-white/10 h-11 font-mono text-cyan-400"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Profit Margin (%)</Label>
                            <div className="flex items-center gap-3">
                                <Slider
                                    value={[formData.margin]}
                                    onValueChange={(val) => setFormData({ ...formData, margin: val[0] })}
                                    max={500}
                                    className="flex-1"
                                />
                                <span className="font-bold text-indigo-400 min-w-[3rem] text-right">{formData.margin}%</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Selling Price (NPR)</Label>
                            <div className="h-11 flex items-center px-4 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400 font-mono font-bold">
                                {sellingPrice.toFixed(6)}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Description</Label>
                            {isDetailLoading && <span className="text-[10px] text-cyan-400 animate-pulse">Loading content...</span>}
                        </div>
                        <Textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder={isDetailLoading ? "Loading details..." : "Enter service instructions, quality details, etc."}
                            className="bg-[#0a1220] border-white/10 min-h-[100px] text-sm"
                            disabled={isDetailLoading}
                        />
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold text-gray-500 uppercase">Avg. Time</Label>
                            <Input
                                value={formData.average_time}
                                onChange={(e) => setFormData({ ...formData, average_time: e.target.value })}
                                placeholder="e.g. 5 mins"
                                className="bg-[#0a1220] border-white/10 h-10 text-xs"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold text-gray-500 uppercase">Guarantee</Label>
                            <Input
                                value={formData.guarantee}
                                onChange={(e) => setFormData({ ...formData, guarantee: e.target.value })}
                                placeholder="e.g. 30 Days"
                                className="bg-[#0a1220] border-white/10 h-10 text-xs"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold text-gray-500 uppercase">Start Time</Label>
                            <Input
                                value={formData.start_time}
                                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                                placeholder="e.g. Instant"
                                className="bg-[#0a1220] border-white/10 h-10 text-xs"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold text-gray-500 uppercase">Speed</Label>
                            <Input
                                value={formData.speed}
                                onChange={(e) => setFormData({ ...formData, speed: e.target.value })}
                                placeholder="e.g. 10k/day"
                                className="bg-[#0a1220] border-white/10 h-10 text-xs"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            className="flex-1 h-12 bg-white/5 hover:bg-white/10 font-bold"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 h-12 bg-cyan-500 hover:bg-cyan-600 font-bold shadow-lg shadow-cyan-900/20"
                        >
                            {isLoading ? "Saving..." : "Update Service"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function IntegrationStep({ number, title, description, icon }: any) {
    return (
        <div className="flex gap-4">
            <div className="h-10 w-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0 text-cyan-400">
                {icon}
            </div>
            <div>
                <div className="text-cyan-400 font-bold text-xs mb-1">{title}</div>
                <div className="text-gray-400 text-sm leading-relaxed">{description}</div>
            </div>
        </div>
    )
}

function ProviderDetailView({ providerId, onBack, onSyncSuccess }: { providerId: string, onBack: () => void, onSyncSuccess?: () => void }) {
    const { formatValue } = useCurrency();
    const [provider, setProvider] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [editingService, setEditingService] = useState<any>(null);
    const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedServices = React.useMemo(() => {
        let sortableItems = [...(provider?.servicesList || [])];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                if (sortConfig.key === 'rate' || sortConfig.key === 'min' || sortConfig.key === 'max') {
                    aValue = parseFloat(aValue || 0);
                    bValue = parseFloat(bValue || 0);
                }

                if (sortConfig.key === 'external_service_id') {
                    aValue = parseInt(aValue) || aValue;
                    bValue = parseInt(bValue) || bValue;
                }

                if (aValue < bValue) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [provider, sortConfig]);

    const fetchProviderDetail = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/providers/${providerId}`);
            if (response.ok) {
                const data = await response.json();
                setProvider(data);
            }
        } catch (error) {
            console.error('Failed to fetch provider details:', error);
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        fetchProviderDetail();
    }, [providerId]);

    const [syncError, setSyncError] = useState<string | null>(null);
    const [syncStats, setSyncStats] = useState<{ added: number, updated: number, deactivated: number, total: number } | null>(null);

    const handleSync = async () => {
        setIsSyncing(true);
        setSyncError(null);
        setSyncStats(null);
        try {
            const response = await fetch(`${API_URL}/providers/${providerId}/sync`, {
                method: 'POST'
            });
            const data = await response.json();
            if (response.ok) {
                await fetchProviderDetail();
                setSyncStats({
                    added: data.added || 0,
                    updated: data.updated || 0,
                    deactivated: data.deactivated || 0,
                    total: data.totalProcessing || 0
                });
                if (onSyncSuccess) onSyncSuccess();
            } else {
                setSyncError(data.details || data.error || 'Failed to sync services');
            }
        } catch (error: any) {
            console.error('Failed to sync services:', error);
            setSyncError(error.message || 'An unexpected error occurred during sync');
        } finally {
            setIsSyncing(false);
        }
    };

    const handleDeleteService = async (serviceId: string) => {
        if (!confirm('Are you sure you want to delete this service? This cannot be undone.')) return;

        try {
            const response = await fetch(`${API_URL}/services/${serviceId}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                fetchProviderDetail();
            }
        } catch (error) {
            console.error('Failed to delete service:', error);
        }
    };

    if (isLoading) {
        return <div className="p-12 text-center text-gray-400">Loading provider details...</div>;
    }

    if (!provider) {
        return <div className="p-12 text-center text-white">Provider not found</div>;
    }

    return (
        <>
            {/* Back Button & Provider Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Button
                        onClick={onBack}
                        variant="outline"
                        className="h-10 w-10 p-0 rounded-xl bg-[#0f172a] border-white/5 hover:bg-[#1e293b]"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-[#1e293b] flex items-center justify-center text-2xl border border-white/5">
                            {provider.type === "PREMIUM" ? "👑" : "🌐"}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">{provider.name}</h2>
                            <div className="flex items-center gap-3 text-xs">
                                <span className="text-gray-500 uppercase font-bold">{provider.type || "STANDARD"}</span>
                                <span className="text-gray-600">•</span>
                                <span className="text-cyan-400 font-mono">{provider.api_url.replace('https://', '')}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button
                        onClick={handleSync}
                        disabled={isSyncing}
                        variant="outline"
                        className="h-10 px-4 rounded-xl bg-[#0f172a] border-white/5 text-gray-300 hover:text-white hover:bg-[#1e293b] gap-2"
                    >
                        <RefreshCw className={cn("h-4 w-4", isSyncing && "animate-spin")} />
                        {isSyncing ? "Syncing..." : "Sync Services"}
                    </Button>
                    <Button className="h-10 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-bold gap-2">
                        <Plus className="h-4 w-4" />
                        Add to Catalog
                    </Button>
                </div>
            </div>

            {/* Show persisted sync error or ephemeral sync error */}
            {(syncError || (provider.sync_status === 'failed' && provider.sync_error)) && (
                <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 text-red-400 text-sm animate-in fade-in slide-in-from-top-2">
                    <XCircle className="h-5 w-5 shrink-0" />
                    <div className="flex-1 font-medium">
                        <span className="font-bold uppercase tracking-wider text-xs block mb-1">Sync Failed</span>
                        {syncError || provider.sync_error}
                    </div>
                    {/* If it's a persisted error, we allow clearing it via re-sync or just hiding (but re-sync is better) */}
                    {!syncError && (
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={handleSync}
                            className="h-8 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/20"
                        >
                            Retry
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSyncError(null)}
                        className="h-8 w-8 p-0 hover:bg-red-500/10 text-red-400"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            )}

            {syncStats && (
                <div className="mb-6 bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-center gap-3 text-green-400 text-sm animate-in fade-in slide-in-from-top-2">
                    <div className="flex-1 font-medium">
                        Sync Complete: Processed <span className="font-bold">{syncStats.total}</span> services.
                        Added <span className="font-bold">{syncStats.added}</span>,
                        Updated <span className="font-bold">{syncStats.updated}</span>,
                        Deactivated <span className="font-bold">{syncStats.deactivated}</span>.
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSyncStats(null)}
                        className="h-8 w-8 p-0 hover:bg-green-500/10 text-green-400"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            )}

            {/* Provider Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-5">
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Current Balance</div>
                    <div className="text-2xl font-bold text-green-400">{formatValue(provider.balance)}</div>
                </div>
                <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-5">
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Total Services</div>
                    <div className="text-2xl font-bold text-cyan-400">{(provider.servicesList || []).length}</div>
                </div>
                <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-5">
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Active in Catalog</div>
                    <div className="text-2xl font-bold text-indigo-400">{(provider.servicesList || []).filter((s: any) => s.status === 'active').length}</div>
                </div>
            </div>

            {/* Services Table */}
            <div className="bg-[#0f172a] border border-white/5 rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-white/5 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white">Provider Services</h3>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input
                            placeholder="Search services..."
                            className="pl-11 h-10 w-64 bg-[#0a1220] border-cyan-500/20 text-white placeholder:text-gray-600 focus-visible:ring-cyan-500/50 rounded-lg text-sm"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/5 text-[10px] font-bold text-gray-500 uppercase tracking-wider items-center">
                    <div className="col-span-1 flex items-center gap-3">
                        <Checkbox className="border-gray-600" />
                        <span>#</span>
                    </div>
                    <div
                        className="col-span-1 cursor-pointer hover:text-cyan-400 flex items-center gap-1 transition-colors"
                        onClick={() => handleSort('external_service_id')}
                    >
                        ID
                        {sortConfig?.key === 'external_service_id' ? (
                            sortConfig.direction === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                        ) : <ArrowUpDown className="h-3 w-3 opacity-30" />}
                    </div>
                    <div
                        className="col-span-3 cursor-pointer hover:text-cyan-400 flex items-center gap-1 transition-colors"
                        onClick={() => handleSort('name')}
                    >
                        Service Name
                        {sortConfig?.key === 'name' ? (
                            sortConfig.direction === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                        ) : <ArrowUpDown className="h-3 w-3 opacity-30" />}
                    </div>
                    <div
                        className="col-span-2 cursor-pointer hover:text-cyan-400 flex items-center gap-1 transition-colors"
                        onClick={() => handleSort('category')}
                    >
                        Category
                        {sortConfig?.key === 'category' ? (
                            sortConfig.direction === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                        ) : <ArrowUpDown className="h-3 w-3 opacity-30" />}
                    </div>
                    <div
                        className="col-span-1 text-right cursor-pointer hover:text-cyan-400 flex items-center justify-end gap-1 transition-colors"
                        onClick={() => handleSort('rate')}
                    >
                        Base Cost
                        {sortConfig?.key === 'rate' ? (
                            sortConfig.direction === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                        ) : <ArrowUpDown className="h-3 w-3 opacity-30" />}
                    </div>
                    <div className="col-span-1 text-right">Selling</div>
                    <div className="col-span-1 text-center">Margin</div>
                    <div
                        className="col-span-1 text-center cursor-pointer hover:text-cyan-400 flex items-center justify-center gap-1 transition-colors"
                        onClick={() => handleSort('status')}
                    >
                        Status
                        {sortConfig?.key === 'status' ? (
                            sortConfig.direction === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                        ) : <ArrowUpDown className="h-3 w-3 opacity-30" />}
                    </div>
                    <div className="col-span-1 text-center">Actions</div>
                </div>

                <div className="divide-y divide-white/5">
                    {sortedServices.map((service: any, idx: number) => (
                        <div key={service.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/[0.02] transition-colors group">
                            <div className="col-span-1 flex items-center gap-3">
                                <Checkbox className="data-[state=checked]:bg-indigo-500 border-gray-600" />
                                <span className="text-gray-500 font-mono text-[10px]">{(idx + 1).toString().padStart(2, '0')}</span>
                            </div>
                            <div className="col-span-1">
                                <span className="text-cyan-400 font-mono text-xs font-bold">#{service.external_service_id}</span>
                            </div>
                            <div className="col-span-3">
                                <div className="font-bold text-sm text-white mb-0.5 truncate group-hover:text-cyan-400 transition-colors">{service.name}</div>
                                <div className="text-[9px] text-gray-500 font-bold tracking-tighter uppercase">Limits: <span className="text-gray-400">{service.min}-{service.max}</span></div>
                            </div>
                            <div className="col-span-2">
                                <span className={cn(
                                    "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider",
                                    service.category?.toLowerCase() === 'instagram' ? 'text-pink-500 bg-pink-500/10 border-pink-500/20' :
                                        service.category?.toLowerCase() === 'tiktok' ? 'text-white bg-gray-800 border-gray-700' :
                                            service.category?.toLowerCase() === 'youtube' ? 'text-red-500 bg-red-500/10 border-red-500/20' :
                                                'text-blue-500 bg-blue-500/10 border-blue-500/20'
                                )}>
                                    {service.category || 'Uncategorized'}
                                </span>
                            </div>
                            <div className="col-span-1 text-right font-mono text-gray-400 font-medium text-xs">{formatValue(service.rate)}</div>
                            <div className="col-span-1 text-right font-mono text-cyan-400 font-bold text-xs">{formatValue(parseFloat(service.rate) * 1.45)}</div>
                            <div className="col-span-1 flex justify-center">
                                <span className="px-2 py-1 rounded bg-green-500/10 text-green-400 border border-green-500/20 text-xs font-bold font-mono">
                                    45%
                                </span>
                            </div>
                            <div className="col-span-1 flex justify-center">
                                {service.status === 'active' ? (
                                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[9px] font-black uppercase">
                                        <div className="h-1 w-1 rounded-full bg-cyan-400 animate-pulse"></div>
                                        Active
                                    </div>
                                ) : (
                                    <span className="px-2 py-1 rounded-full bg-gray-500/10 text-gray-500 border border-gray-500/20 text-[9px] font-black uppercase">
                                        Inactive
                                    </span>
                                )}
                            </div>
                            <div className="col-span-1 flex items-center justify-center gap-1">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingService(service);
                                    }}
                                    className="h-8 w-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-white/5 hover:text-white transition-all"
                                >
                                    <Edit2 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteService(service.id);
                                    }}
                                    className="h-8 w-8 rounded-lg flex items-center justify-center text-red-500/30 hover:bg-red-500/10 hover:text-red-500 transition-all"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <EditServiceModal
                open={!!editingService}
                onOpenChange={(open) => !open && setEditingService(null)}
                service={editingService}
                onSuccess={() => {
                    fetchProviderDetail();
                    if (onSyncSuccess) onSyncSuccess();
                }}
            />
        </>
    );
}