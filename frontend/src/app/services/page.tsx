"use client";

import { useState, useEffect, useMemo } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/header";
import { WhatsAppFloatButton } from "@/components/whatsapp-float-button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Search,
    Filter,
    ArrowUp,
    ArrowDown,
    Info,
    CheckCircle2,
    Clock,
    Zap,
    Shield
} from "lucide-react";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useCurrency } from "@/context/CurrencyContext";
import { BACKEND_URL } from "@/lib/api-config";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Service {
    id: number;
    name: string;
    category: string;
    rate: number;
    min: number;
    max: number;
    average_time?: string;
    speed?: string;
    guarantee?: string;
    description?: string;
}

export default function ServicesPage() {
    const { formatValue } = useCurrency();
    const [services, setServices] = useState<Service[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [sortConfig, setSortConfig] = useState<{ key: keyof Service; direction: "asc" | "desc" } | null>(null);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const res = await fetch(`${BACKEND_URL}/api/services?status=active`);
                if (res.ok) {
                    const data = await res.json();
                    setServices(data);
                }
            } catch (error) {
                console.error("Failed to fetch services:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchServices();
    }, []);

    const categories = useMemo(() => {
        const cats = new Set(services.map(s => s.category));
        return Array.from(cats).sort();
    }, [services]);

    const filteredServices = useMemo(() => {
        let filtered = services.filter(service => {
            const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                service.id.toString().includes(searchQuery);
            const matchesCategory = selectedCategory === "all" || service.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });

        if (sortConfig) {
            filtered.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];

                if (aValue === undefined || bValue === undefined) return 0;

                if (aValue < bValue) {
                    return sortConfig.direction === "asc" ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === "asc" ? 1 : -1;
                }
                return 0;
            });
        }

        return filtered;
    }, [services, searchQuery, selectedCategory, sortConfig]);

    const handleSort = (key: keyof Service) => {
        let direction: "asc" | "desc" = "asc";
        if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }
        setSortConfig({ key, direction });
    };

    return (
        <div className="min-h-screen bg-background">
            <Sidebar />
            <WhatsAppFloatButton />
            <div className="lg:pl-64">
                <Header />
                <main className="p-4 lg:p-6 space-y-6">
                    <Card className="bg-card border-border shadow-sm">
                        <CardHeader className="pb-4 border-b border-border/50">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <CardTitle className="text-2xl font-bold">Services List</CardTitle>
                                    <p className="text-muted-foreground text-sm mt-1">
                                        Browse all our active services and prices
                                    </p>
                                </div>
                                <div className="flex items-center gap-3 bg-secondary/30 p-1 rounded-xl">
                                    <Badge variant="outline" className="bg-background">
                                        {services.length} Total Services
                                    </Badge>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {/* Filters Toolbar */}
                            <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 bg-secondary/10">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search services..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-9 h-10 bg-background border-border"
                                    />
                                </div>
                                <div>
                                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                        <SelectTrigger className="h-10 bg-background border-border">
                                            <div className="flex items-center gap-2">
                                                <Filter className="h-4 w-4 text-muted-foreground" />
                                                <SelectValue placeholder="All Categories" />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Categories</SelectItem>
                                            {categories.map(cat => (
                                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-secondary/30">
                                        <TableRow className="hover:bg-transparent border-border/50">
                                            <TableHead className="w-[80px]">ID</TableHead>
                                            <TableHead className="cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort("name")}>
                                                <div className="flex items-center gap-1">
                                                    Service
                                                    {sortConfig?.key === "name" && (
                                                        sortConfig.direction === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                                                    )}
                                                </div>
                                            </TableHead>
                                            <TableHead className="w-[150px] cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort("rate")}>
                                                <div className="flex items-center gap-1">
                                                    Rate / 1000
                                                    {sortConfig?.key === "rate" && (
                                                        sortConfig.direction === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                                                    )}
                                                </div>
                                            </TableHead>
                                            <TableHead className="w-[180px]">Limits</TableHead>
                                            <TableHead className="w-[200px] hidden md:table-cell">Details</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {isLoading ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                                                        Loading services...
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : filteredServices.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                                                    No services found matching your criteria
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredServices.map((service) => (
                                                <TableRow key={service.id} className="border-border/50 hover:bg-secondary/20 transition-colors group">
                                                    <TableCell className="font-mono text-xs text-muted-foreground">
                                                        {service.id}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="space-y-1">
                                                            <div className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">
                                                                {service.name}
                                                            </div>
                                                            <div className="text-xs text-muted-foreground flex items-center gap-2">
                                                                <span className="bg-secondary px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider">
                                                                    {service.category}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="font-bold text-base font-mono text-primary">
                                                            {formatValue(service.rate)}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="text-xs font-mono text-muted-foreground">
                                                            <div>Min: {service.min.toLocaleString()}</div>
                                                            <div>Max: {service.max.toLocaleString()}</div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="hidden md:table-cell">
                                                        <div className="flex flex-wrap gap-2">
                                                            {service.average_time && (
                                                                <Badge variant="outline" className="bg-background/50 h-6 text-[10px] gap-1 px-2 border-border/50">
                                                                    <Clock className="h-3 w-3" />
                                                                    {service.average_time}
                                                                </Badge>
                                                            )}
                                                            {service.guarantee && (
                                                                <Badge variant="outline" className="bg-background/50 h-6 text-[10px] gap-1 px-2 border-border/50">
                                                                    <Shield className="h-3 w-3" />
                                                                    {service.guarantee}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Pagination/Footer could go here */}
                            <div className="p-4 border-t border-border/50 text-xs text-center text-muted-foreground">
                                Showing {filteredServices.length} active services
                            </div>
                        </CardContent>
                    </Card>
                </main>
            </div>
        </div>
    );
}
