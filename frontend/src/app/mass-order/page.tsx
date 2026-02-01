"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/header";
import { WhatsAppFloatButton } from "@/components/whatsapp-float-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { BACKEND_URL } from "@/lib/api-config";
import { useCurrency } from "@/context/CurrencyContext";
import {
    Upload,
    FileText,
    AlertCircle,
    CheckCircle2,
    Zap,
    Info,
    Trash2,
    RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Service {
    id: number;
    name: string;
    category: string;
    rate: number;
    min: number;
    max: number;
}

interface ParsedOrder {
    serviceId: number;
    link: string;
    quantity: number;
    valid: boolean;
    error?: string;
}

export default function MassOrderPage() {
    const { formatValue } = useCurrency();
    const [services, setServices] = useState<Service[]>([]);
    const [orderText, setOrderText] = useState("");
    const [parsedOrders, setParsedOrders] = useState<ParsedOrder[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

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

    const parseOrders = () => {
        const lines = orderText.trim().split("\n").filter(line => line.trim());
        const parsed: ParsedOrder[] = [];

        lines.forEach((line, index) => {
            const parts = line.trim().split("|").map(p => p.trim());

            if (parts.length !== 3) {
                parsed.push({
                    serviceId: 0,
                    link: line,
                    quantity: 0,
                    valid: false,
                    error: "Invalid format. Use: service_id|link|quantity"
                });
                return;
            }

            const [serviceIdStr, link, quantityStr] = parts;
            const serviceId = parseInt(serviceIdStr);
            const quantity = parseInt(quantityStr);

            if (isNaN(serviceId)) {
                parsed.push({
                    serviceId: 0,
                    link: line,
                    quantity: 0,
                    valid: false,
                    error: "Invalid service ID"
                });
                return;
            }

            // Find the service
            const service = services.find(s => s.id === serviceId);
            if (!service) {
                parsed.push({
                    serviceId,
                    link,
                    quantity: 0,
                    valid: false,
                    error: `Service #${serviceId} not found`
                });
                return;
            }

            if (!link || link.length < 5) {
                parsed.push({
                    serviceId,
                    link: link || "",
                    quantity: quantity || 0,
                    valid: false,
                    error: "Invalid link"
                });
                return;
            }

            if (isNaN(quantity) || quantity < service.min || quantity > service.max) {
                parsed.push({
                    serviceId,
                    link,
                    quantity: quantity || 0,
                    valid: false,
                    error: `Quantity must be between ${service.min} and ${service.max} for service #${serviceId}`
                });
                return;
            }

            parsed.push({
                serviceId,
                link,
                quantity,
                valid: true
            });
        });

        setParsedOrders(parsed);

        const validCount = parsed.filter(o => o.valid).length;
        const invalidCount = parsed.filter(o => !o.valid).length;

        if (invalidCount > 0) {
            toast.warning(`Parsed ${validCount} valid orders, ${invalidCount} invalid`);
        } else {
            toast.success(`Successfully parsed ${validCount} orders`);
        }
    };

    const handleSubmit = async () => {
        const validOrders = parsedOrders.filter(o => o.valid);

        if (validOrders.length === 0) {
            toast.error("No valid orders to submit");
            return;
        }

        try {
            setIsSubmitting(true);
            const token = localStorage.getItem("nepo_token");

            if (!token) {
                toast.error("Authentication required");
                return;
            }

            let successCount = 0;
            let failCount = 0;

            for (const order of validOrders) {
                try {
                    const response = await fetch(`${BACKEND_URL}/api/orders`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            serviceId: order.serviceId,
                            link: order.link,
                            quantity: order.quantity
                        })
                    });

                    if (response.ok) {
                        successCount++;
                    } else {
                        failCount++;
                    }
                } catch (error) {
                    failCount++;
                }
            }

            if (successCount > 0) {
                toast.success(`Successfully placed ${successCount} orders`);

                // Update balance
                const userStr = localStorage.getItem("nepo_user");
                if (userStr) {
                    const user = JSON.parse(userStr);
                    const totalCharge = validOrders.reduce((sum, order) => {
                        const service = services.find(s => s.id === order.serviceId);
                        if (!service) return sum;
                        return sum + (Number(service.rate) * order.quantity / 1000);
                    }, 0);
                    user.balance = Number(user.balance) - totalCharge;
                    localStorage.setItem("nepo_user", JSON.stringify(user));
                    window.dispatchEvent(new Event('userUpdate'));
                }

                // Clear form
                setOrderText("");
                setParsedOrders([]);
            }

            if (failCount > 0) {
                toast.error(`Failed to place ${failCount} orders`);
            }
        } catch (error: any) {
            toast.error("Failed to submit orders");
        } finally {
            setIsSubmitting(false);
        }
    };

    const totalCost = parsedOrders
        .filter(o => o.valid)
        .reduce((sum, order) => {
            const service = services.find(s => s.id === order.serviceId);
            if (!service) return sum;
            return sum + (Number(service.rate) * order.quantity / 1000);
        }, 0);

    const validOrdersCount = parsedOrders.filter(o => o.valid).length;

    return (
        <div className="min-h-screen bg-background">
            <Sidebar />
            <WhatsAppFloatButton />
            <div className="lg:pl-64">
                <Header />
                <main className="p-4 lg:p-6 space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">Mass Order</h1>
                            <p className="text-muted-foreground mt-1">Place multiple orders at once</p>
                        </div>
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                            Bulk Processing
                        </Badge>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Left Column - Input */}
                        <Card className="lg:col-span-2 bg-card border-border">
                            <CardHeader className="border-b border-border/50">
                                <CardTitle className="flex items-center gap-2">
                                    <Upload className="h-5 w-5 text-primary" />
                                    Order Input
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-6">
                                {/* Order Text Input */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-sm font-medium">Orders (One per line)</Label>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setOrderText("");
                                                setParsedOrders([]);
                                            }}
                                            className="h-7 text-xs"
                                        >
                                            <Trash2 className="h-3 w-3 mr-1" />
                                            Clear
                                        </Button>
                                    </div>
                                    <Textarea
                                        placeholder="123|https://example.com/profile1|1000&#x0A;456|https://example.com/profile2|2000&#x0A;789|https://example.com/profile3|1500"
                                        value={orderText}
                                        onChange={(e) => setOrderText(e.target.value)}
                                        className="min-h-[300px] font-mono text-sm bg-input border-border"
                                    />
                                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                                        <div className="flex items-start gap-2">
                                            <Info className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                            <div className="text-xs text-blue-500">
                                                <p className="font-semibold mb-1">Format: service_id | link | quantity</p>
                                                <p className="text-blue-500/80">Each order should be on a new line. Examples:</p>
                                                <code className="block mt-1 bg-blue-500/10 p-2 rounded space-y-0.5">
                                                    <div>123|https://instagram.com/username|1000</div>
                                                    <div>456|https://youtube.com/channel|5000</div>
                                                </code>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3">
                                    <Button
                                        onClick={parseOrders}
                                        disabled={!orderText.trim()}
                                        className="flex-1"
                                        variant="outline"
                                    >
                                        <FileText className="h-4 w-4 mr-2" />
                                        Parse Orders
                                    </Button>
                                    <Button
                                        onClick={handleSubmit}
                                        disabled={validOrdersCount === 0 || isSubmitting}
                                        className={cn(
                                            "flex-1 bg-gradient-to-r from-primary/80 to-primary text-white",
                                            "hover:shadow-lg transition-all"
                                        )}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                                Submitting...
                                            </>
                                        ) : (
                                            <>
                                                <Zap className="h-4 w-4 mr-2" />
                                                Submit {validOrdersCount} Orders
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Right Column - Summary */}
                        <div className="space-y-6">
                            {/* Stats Card */}
                            <Card className="bg-card border-border">
                                <CardHeader className="border-b border-border/50">
                                    <CardTitle className="text-base">Order Summary</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 pt-6">
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">Total Orders</span>
                                            <span className="text-lg font-bold">{parsedOrders.length}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                                                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                                                Valid
                                            </span>
                                            <span className="text-lg font-bold text-emerald-500">{validOrdersCount}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                                                <AlertCircle className="h-3 w-3 text-red-500" />
                                                Invalid
                                            </span>
                                            <span className="text-lg font-bold text-red-500">
                                                {parsedOrders.filter(o => !o.valid).length}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="border-t border-border/50 pt-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium">Total Cost</span>
                                            <span className="text-2xl font-bold text-primary">
                                                {formatValue(totalCost)}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Validation Results */}
                            {parsedOrders.length > 0 && (
                                <Card className="bg-card border-border">
                                    <CardHeader className="border-b border-border/50">
                                        <CardTitle className="text-base">Validation Results</CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-4">
                                        <div className="space-y-2 max-h-[400px] overflow-y-auto">
                                            {parsedOrders.map((order, index) => {
                                                const orderService = services.find(s => s.id === order.serviceId);
                                                return (
                                                    <div
                                                        key={index}
                                                        className={cn(
                                                            "p-3 rounded-lg border text-xs",
                                                            order.valid
                                                                ? "bg-emerald-500/5 border-emerald-500/20"
                                                                : "bg-red-500/5 border-red-500/20"
                                                        )}
                                                    >
                                                        <div className="flex items-start gap-2">
                                                            {order.valid ? (
                                                                <CheckCircle2 className="h-3 w-3 text-emerald-500 mt-0.5 shrink-0" />
                                                            ) : (
                                                                <AlertCircle className="h-3 w-3 text-red-500 mt-0.5 shrink-0" />
                                                            )}
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <span className="font-mono text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                                                                        #{order.serviceId}
                                                                    </span>
                                                                    {orderService && (
                                                                        <span className="text-[10px] text-muted-foreground truncate">
                                                                            {orderService.name}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <p className="font-mono truncate text-foreground">
                                                                    {order.link}
                                                                </p>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <span className="text-muted-foreground">
                                                                        Qty: {order.quantity.toLocaleString()}
                                                                    </span>
                                                                    {order.valid && orderService && (
                                                                        <span className="text-primary font-semibold">
                                                                            {formatValue(orderService.rate * order.quantity / 1000)}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                {order.error && (
                                                                    <p className="text-red-500 mt-1">{order.error}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
