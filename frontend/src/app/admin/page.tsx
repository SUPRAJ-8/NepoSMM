import { API_URL } from '@/lib/api-config'
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
    Search,
    Users,
    Puzzle,
    Banknote,
    Ticket,
    MoreHorizontal,
    Edit2,
    Ban,
    CheckCircle,
    Plus,
    AlertTriangle,
    Settings,
    TrendingDown,
    RefreshCw,
    Tag,
    Layers
} from "lucide-react";
import React from "react";
import { useDashboardCurrency } from "@/context/DashboardCurrencyContext";

function DashboardContent() {
    const { formatValue } = useDashboardCurrency();
    const [userCount, setUserCount] = React.useState(0);
    const [recentUsers, setRecentUsers] = React.useState<any[]>([]);
    const [providers, setProviders] = React.useState<any[]>([]);
    const [categories, setCategories] = React.useState<any[]>([]);
    const [services, setServices] = React.useState<any[]>([]);
    const [filteredServices, setFilteredServices] = React.useState<any[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    const fetchDashboardData = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem("nepo_admin_token");
            const [providersRes, usersRes, categoriesRes, servicesRes] = await Promise.all([
                fetch('${API_URL}/providers'),
                fetch('${API_URL}/users', {
                    headers: { "Authorization": `Bearer ${token}` }
                }),
                fetch('${API_URL}/services/categories'),
                fetch('${API_URL}/services')
            ]);

            if (providersRes.ok) {
                const providersData = await providersRes.json();
                setProviders(providersData);
            }

            if (usersRes.ok) {
                const usersData = await usersRes.json();
                setUserCount(usersData.length);
                // Get latest 3 users
                const mappedUsers = usersData.map((u: any) => ({
                    id: u.id,
                    username: u.username || u.email.split('@')[0],
                    email: u.email,
                    balance: parseFloat(u.balance) || 0,
                    status: 'Active', // Mock
                    spent: parseFloat(u.spent) || 0,
                    initials: (u.username || u.email || "U").charAt(0).toUpperCase(),
                    color: "bg-purple-600"
                })).sort((a: any, b: any) => b.id - a.id).slice(0, 3);
                setRecentUsers(mappedUsers);
            }

            if (categoriesRes.ok) {
                const categoriesData = await categoriesRes.json();
                const sorted = categoriesData.sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0));
                setCategories(sorted);
            }

            if (servicesRes.ok) {
                const servicesData = await servicesRes.json();
                setServices(servicesData);
                setFilteredServices(servicesData);
            }
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        fetchDashboardData();
    }, []);

    const activeProviders = providers.filter(p => p.status === 'active');
    const totalBalance = providers.reduce((acc, p) => acc + parseFloat(p.balance || 0), 0);


    return (
        <div className="space-y-8 animate-in fade-in duration-500 font-sans">
            {/* Top Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1">Super Admin Overview</h1>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-widest">Global metrics and system health</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatWidget
                    title="Registered Users"
                    value={userCount.toLocaleString()}
                    trend="+12.5% vs last month"
                    trendColor="text-green-400"
                    icon={Users}
                    iconColor="text-purple-400"
                />
                <StatWidget
                    title="Active APIs"
                    value={activeProviders.length.toString()}
                    trend={providers.length > 0 ? `${activeProviders.length}/${providers.length} Nodes online` : "No APIs configured"}
                    trendColor="text-gray-400"
                    icon={Puzzle}
                    iconColor="text-purple-400"
                />

                <StatWidget
                    title="Active Categories"
                    value={categories.length.toLocaleString()}
                    trend={`${categories.filter(c => c.active_services > 0).length} categories active`}
                    trendColor="text-cyan-400"
                    icon={Tag}
                    iconColor="text-cyan-400"
                />
                <StatWidget
                    title="Total Services"
                    value={services.length.toLocaleString()}
                    trend={`${services.filter(s => s.status === 'active').length} services online`}
                    trendColor="text-green-400"
                    icon={Layers}
                    iconColor="text-purple-400"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* User Management */}
                <div className="lg:col-span-2 bg-ocean-royal/30 border border-ocean-cyan/10 rounded-2xl p-6 backdrop-blur-xl">

                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-lg">User Management</h3>
                        <div className="flex items-center gap-2">
                            <div className="flex bg-ocean-deep rounded-lg p-1">
                                <button className="px-3 py-1 text-xs font-medium bg-ocean-bright rounded text-white shadow">All Users</button>
                                <button className="px-3 py-1 text-xs font-medium text-ocean-pale hover:text-white">Active</button>
                                <button className="px-3 py-1 text-xs font-medium text-ocean-pale hover:text-white">Suspended</button>
                            </div>
                            <Button size="sm" className="bg-ocean-medium hover:bg-ocean-bright h-8 text-xs text-white">Add User</Button>

                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-gray-500 text-xs uppercase tracking-wider border-b border-white/5">
                                    <th className="pb-3 pl-2">User</th>
                                    <th className="pb-3">Status</th>
                                    <th className="pb-3">Total Spent</th>
                                    <th className="pb-3 text-right pr-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {recentUsers.map((u) => (
                                    <UserRow
                                        key={u.id}
                                        name={u.username}
                                        email={u.email}
                                        status={u.status}
                                        spent={formatValue(u.spent)}
                                        initials={u.initials}
                                        color={u.color}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <button className="w-full mt-4 py-3 text-sm text-ocean-bright font-medium bg-ocean-bright/5 rounded-xl hover:bg-ocean-bright/10 transition-colors">
                        View All Users
                    </button>

                </div>

                {/* System Settings */}
                <div className="space-y-6">
                    <div className="bg-ocean-royal/30 border border-ocean-cyan/10 rounded-2xl p-6 backdrop-blur-xl">
                        <div className="flex items-center gap-2 mb-6">
                            <Settings className="h-5 w-5 text-ocean-bright" />
                            <h3 className="font-bold text-lg">System Settings</h3>
                        </div>


                        <div className="flex items-center justify-between mb-8 pb-8 border-b border-white/5">
                            <div>
                                <h4 className="font-medium text-sm">Maintenance Mode</h4>
                                <p className="text-xs text-gray-500">Disable front-end access</p>
                            </div>
                            <Switch />
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-xs uppercase font-bold text-gray-500">
                                <span>Site Announcement</span>
                                <span className="text-green-400">Live Preview</span>
                            </div>
                            <textarea
                                className="w-full h-24 bg-[#161c2e] border border-white/5 rounded-xl p-3 text-sm text-white resize-none focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                                placeholder="Type an announcement for all users to see..."
                            ></textarea>
                            <Button className="w-full bg-[#1e1b2e] text-[#a855f7] hover:bg-[#2d2a42] border border-[#a855f7]/20">Update Announcement</Button>
                        </div>

                        <div className="space-y-4 mt-8">
                            <SettingToggle label="Backup Daily" active />
                            <SettingToggle label="Auto-Refund Failed" active />
                            <SettingToggle label="Log API Responses" active={false} />
                        </div>
                    </div>

                    {/* System Health Widget Placeholder */}
                    <div className="bg-gradient-to-br from-ocean-medium to-ocean-deep rounded-2xl p-6 relative overflow-hidden border border-ocean-cyan/20">
                        <div className="relative z-10 text-white">

                            <h4 className="text-xs font-bold uppercase w-full mb-4 opacity-80">System Health</h4>
                            <div className="flex justify-between items-end mb-4">
                                <div>
                                    <div className="text-3xl font-bold">99.9%</div>
                                    <div className="text-[10px] opacity-70">UPTIME</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xl font-bold">1.2s</div>
                                    <div className="text-[10px] opacity-70">AVG LATENCY</div>
                                </div>
                            </div>
                            <div className="w-full bg-black/20 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-white h-full w-[42%]"></div>
                            </div>
                            <div className="flex justify-between text-[10px] mt-1 opacity-70">
                                <span>SERVER LOAD</span>
                                <span>42%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Categories & Providers Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
                <div className="bg-ocean-royal/30 border border-ocean-cyan/10 rounded-2xl p-6 backdrop-blur-xl">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-lg">Categories Overview</h3>
                        <Button size="sm" variant="ghost" className="text-ocean-bright hover:bg-ocean-bright/10 text-xs" onClick={() => window.location.href = '/admin/categories'}>
                            View All
                        </Button>
                    </div>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                        {isLoading ? (
                            <div className="text-gray-500 text-xs py-4 text-center">Loading categories...</div>
                        ) : categories.length === 0 ? (
                            <div className="text-gray-500 text-xs py-4 text-center">No categories found</div>
                        ) : (
                            categories.slice(0, 5).map(cat => (
                                <div key={cat.category} className="flex items-center justify-between p-3 bg-ocean-deep/50 rounded-xl border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-lg bg-ocean-bright/10 flex items-center justify-center">
                                            <Tag className="h-4 w-4 text-ocean-bright" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-white max-w-[180px] truncate" title={cat.category}>{cat.category}</div>
                                            <div className="text-[10px] text-gray-500 uppercase">{cat.providers}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-bold text-ocean-bright">{cat.total_services}</div>
                                        <div className="text-[10px] text-gray-500 uppercase">Services</div>
                                    </div>
                                </div>
                            ))
                        )}
                        {categories.length > 5 && (
                            <button
                                onClick={() => window.location.href = '/admin/categories'}
                                className="w-full py-2 text-[10px] font-bold text-gray-500 hover:text-white transition-colors uppercase tracking-widest"
                            >
                                + {categories.length - 5} More Categories
                            </button>
                        )}
                    </div>
                </div>

                <div className="bg-ocean-royal/30 border border-ocean-cyan/10 rounded-2xl p-6 overflow-hidden backdrop-blur-xl">

                    <h3 className="font-bold text-lg mb-6 text-gray-500 uppercase text-xs">Current Provider Balances</h3>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                        {isLoading ? (
                            <div className="text-gray-500 text-xs py-4 text-center">Loading status...</div>
                        ) : providers.length === 0 ? (
                            <div className="text-gray-500 text-xs py-4 text-center">No providers configured</div>
                        ) : (
                            providers.map(provider => (
                                <ProviderBalance
                                    key={provider.id}
                                    name={provider.name}
                                    balance={formatValue(provider.balance)}
                                    status={provider.status === 'active' ? 'active' : 'inactive'}
                                />
                            ))
                        )}
                    </div>
                </div>

            </div>

            {/* Service Explorer */}
            <div className="bg-ocean-royal/30 border border-ocean-cyan/10 rounded-2xl p-6 backdrop-blur-xl mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="font-bold text-lg">Service Explorer</h3>
                        <p className="text-xs text-gray-500 font-medium">Quickly find and check services across all providers</p>
                    </div>
                    <div className="relative w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input
                            placeholder="Search service name or category..."
                            className="pl-10 bg-ocean-deep/50 border-white/5 h-10 text-xs text-white"
                            onChange={(e) => {
                                const val = e.target.value.toLowerCase();
                                const filtered = services.filter(s =>
                                    s.name.toLowerCase().includes(val) ||
                                    s.category.toLowerCase().includes(val) ||
                                    s.external_service_id.toString().includes(val)
                                );
                                setFilteredServices(filtered);
                            }}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-gray-500 text-[10px] uppercase tracking-wider border-b border-white/5">
                                <th className="pb-3 px-2">ID</th>
                                <th className="pb-3">Service Name</th>
                                <th className="pb-3">Category</th>
                                <th className="pb-3">Rate</th>
                                <th className="pb-3 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="text-xs">
                            {isLoading ? (
                                <tr><td colSpan={5} className="py-8 text-center text-gray-500">Loading services...</td></tr>
                            ) : filteredServices.length === 0 ? (
                                <tr><td colSpan={5} className="py-8 text-center text-gray-500">No services match your search</td></tr>
                            ) : (
                                filteredServices.slice(0, 5).map(service => (
                                    <tr key={service.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                                        <td className="py-3 px-2 font-mono text-gray-500">{service.external_service_id}</td>
                                        <td className="py-3 font-medium text-white max-w-[300px] truncate" title={service.name}>{service.name}</td>
                                        <td className="py-3">
                                            <span className="px-2 py-0.5 rounded bg-ocean-bright/10 text-ocean-bright border border-ocean-bright/20 inline-block max-w-[150px] truncate" title={service.category}>{service.category}</span>
                                        </td>
                                        <td className="py-3 font-bold text-green-400">{formatValue(service.rate)}</td>
                                        <td className="py-3 text-center">
                                            <span className={cn(
                                                "text-[10px] font-bold px-2 py-0.5 rounded border",
                                                service.status === 'active' ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
                                            )}>
                                                {service.status.toUpperCase()}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <button
                    onClick={() => window.location.href = '/admin/api-config'}
                    className="w-full mt-4 py-3 text-sm text-ocean-bright font-medium bg-ocean-bright/5 rounded-xl hover:bg-ocean-bright/10 transition-colors"
                >
                    View All {services.length} Services in Catalog
                </button>
            </div>
        </div>
    );
}

function StatWidget({ title, value, trend, trendColor, icon: Icon, iconColor }: any) {
    return (
        <div className="bg-ocean-royal/20 border border-ocean-cyan/10 rounded-2xl p-5 flex flex-col justify-between h-32 relative overflow-hidden group hover:border-ocean-bright/30 transition-colors backdrop-blur-md">
            <div className="flex justify-between items-start z-10">
                <div>
                    <div className="text-ocean-pale text-xs font-medium mb-1">{title}</div>
                    <div className="text-2xl font-bold text-white">{value}</div>
                </div>
                <Icon className={`h-5 w-5 ${iconColor}`} />
            </div>
            <div className={`text-[10px] font-bold ${trendColor} z-10`}>{trend}</div>

            {/* Glow effect */}
            <div className="absolute right-0 top-0 w-24 h-24 bg-ocean-bright/5 blur-2xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-ocean-bright/10 transition-all"></div>
        </div>

    )
}

function UserRow({ name, email, status, spent, initials, color }: any) {
    const statusStyles: any = {
        Active: "bg-green-500/10 text-green-400 border-green-500/20",
        Pending: "bg-orange-500/10 text-orange-400 border-orange-500/20",
        Suspended: "bg-red-500/10 text-red-500 border-red-500/20",
    };

    return (
        <tr className="border-b border-white/5 hover:bg-white/[0.02] group">
            <td className="py-4 pl-2">
                <div className="flex items-center gap-3">
                    <div className={`h-9 w-9 rounded bg-[#161c2e] flex items-center justify-center text-xs font-bold text-gray-300`}>
                        {initials}
                    </div>
                    <div>
                        <div className="font-medium text-white text-sm">{name}</div>
                        <div className="text-xs text-gray-500">{email}</div>
                    </div>
                </div>
            </td>
            <td className="py-4">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${statusStyles[status] || ""}`}>
                    {status.toUpperCase()}
                </span>
            </td>
            <td className="py-4 font-medium text-gray-300">{spent}</td>
            <td className="py-4 pr-2 text-right">
                <div className="flex justify-end gap-2">
                    <button className="h-7 w-7 rounded bg-[#161c2e] flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#a855f7]">
                        <Edit2 className="h-3 w-3" />
                    </button>
                    <button className="h-7 w-7 rounded bg-[#161c2e] flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-red-500/10">
                        <Ban className="h-3 w-3" />
                    </button>
                </div>
            </td>
        </tr>
    )
}

function SettingToggle({ label, active }: { label: string, active?: boolean }) {
    return (
        <div className="flex items-center justify-between py-1">
            <span className="text-sm text-gray-300">{label}</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${active ? 'bg-green-500/10 text-green-400' : 'bg-gray-800 text-gray-500'}`}>
                {active ? 'ENABLED' : 'DISABLED'}
            </span>
        </div>
    )
}

function ProviderBalance({ name, balance, status }: any) {
    const dotColor = status === 'active' ? 'bg-green-400' : 'bg-gray-600';
    const amountColor = status === 'inactive' ? 'text-gray-500' : 'text-purple-400';


    return (
        <div className="flex items-center justify-between p-3 bg-ocean-deep/50 rounded-xl border border-ocean-cyan/10 hover:bg-ocean-deep/80 transition-colors">
            <div className="flex items-center gap-3">
                <div className={`h-2 w-2 rounded-full ${dotColor}`}></div>
                <span className="font-medium text-ocean-crystal">{name}</span>
            </div>
            <span className={`font-mono font-bold ${amountColor}`}>{balance}</span>
        </div>

    )
}

export default DashboardContent;

