"use client";

import { useState } from "react"
import { ExternalLink, MoreHorizontal, RefreshCw, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useCurrency } from "@/context/CurrencyContext"
import type { Order } from "@/app/orders/page"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface OrdersTableProps {
  orders: Order[]
}

const statusStyles: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  processing: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  completed: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  partial: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  canceled: "bg-red-500/10 text-red-500 border-red-500/20",
}

const statusLabels: Record<string, string> = {
  pending: "Pending",
  processing: "Processing",
  completed: "Completed",
  partial: "Partial",
  canceled: "Canceled",
}

export function OrdersTable({ orders }: OrdersTableProps) {
  const { formatValue } = useCurrency()
  const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000').replace(/\/$/, '');
  const apiUrl = `${backendUrl}/api`;
  const [refreshingId, setRefreshingId] = useState<string | null>(null);

  const handleRefresh = async (id: string) => {
    setRefreshingId(id);
    try {
      const token = localStorage.getItem("nepo_token");
      const res = await fetch(`${apiUrl}/orders/${id}/refresh`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success("Order status updated!");
        // We could trigger a global refresh or wait for the next periodic fetch
        // For simplicity, we just reload the page as it's the most reliable way to sync all components
        window.location.reload();
      }
    } catch (e) {
      toast.error("Failed to refresh order status");
    } finally {
      setRefreshingId(null);
    }
  };

  const handleCancel = async (id: string) => {
    try {
      const token = localStorage.getItem("nepo_token");
      const res = await fetch(`${apiUrl}/orders/${id}/cancel`, {
        method: 'PUT',
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success("Cancellation requested!");
        window.location.reload();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to cancel order");
      }
    } catch (e) {
      toast.error("An error occurred while canceling");
    }
  };

  const handleRefill = async (id: string) => {
    try {
      const token = localStorage.getItem("nepo_token");
      const res = await fetch(`${apiUrl}/orders/${id}/refill`, {
        method: 'PUT',
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success("Refill sequence started!");
        window.location.reload();
      } else {
        const data = await res.json();
        toast.error(data.error || "Refill not available for this order");
      }
    } catch (e) {
      toast.error("An error occurred during refill request");
    }
  };


  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const day = d.getDate().toString().padStart(2, '0');
    const month = d.toLocaleString('en-US', { month: 'short' });
    const year = d.getFullYear();
    return `${day} ${month}, ${year}`;
  };

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Table header - Desktop */}
      <div className="hidden md:grid grid-cols-9 gap-4 px-4 py-3 text-sm font-medium text-muted-foreground bg-secondary/30 border-b border-border">
        <div>ID</div>
        <div>Date</div>
        <div>Link</div>
        <div>Charge</div>
        <div>Start count</div>
        <div>Quantity</div>
        <div>Service</div>
        <div>Status</div>
        <div>Remains</div>
      </div>

      {/* Table body */}
      <div className="divide-y divide-border">
        {orders.map((order) => {
          return (
            <div key={order.id} className="group hover:bg-secondary/5 transition-colors">
              {/* Desktop View */}
              <div className="hidden md:grid grid-cols-9 gap-4 px-4 py-3 text-sm items-center">
                <div className="font-mono text-xs font-bold text-white">ORD-{9908 + Number(order.id)}</div>
                <div className="text-muted-foreground whitespace-nowrap">{formatDate(order.created_at)}</div>
                <div className="col-span-1">
                  <a
                    href={order.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1 group/link"
                  >
                    <span className="break-all text-[11px] leading-tight truncate max-w-[120px] block">{order.link}</span>
                    <ExternalLink className="h-3 w-3 shrink-0 opacity-50 group-hover/link:opacity-100" />
                  </a>
                </div>
                <div>{formatValue(Number(order.charge))}</div>
                <div>{order.start_count?.toLocaleString() ?? 0}</div>
                <div>{order.quantity.toLocaleString()}</div>
                <div className="col-span-1 text-xs font-semibold text-white leading-tight line-clamp-2" title={order.service_name}>
                  {order.service_name}
                </div>
                <div>
                  <Badge variant="outline" className={cn("whitespace-nowrap", statusStyles[order.status?.toLowerCase()] || "bg-gray-500/10")}>
                    {statusLabels[order.status?.toLowerCase()] || order.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>{order.remains?.toLocaleString() ?? 0}</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10">
                        {refreshingId === order.id ? (
                          <RefreshCw className="h-4 w-4 animate-spin text-primary" />
                        ) : (
                          <MoreHorizontal className="h-4 w-4" />
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleRefresh(order.id)}>
                        <RefreshCw className={cn("h-4 w-4 mr-2", refreshingId === order.id && "animate-spin")} />
                        Refresh Status
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleRefill(order.id)}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refill
                      </DropdownMenuItem>
                      {order.status?.toLowerCase() !== 'completed' && (
                        <DropdownMenuItem className="text-destructive" onClick={() => handleCancel(order.id)}>
                          <XCircle className="h-4 w-4 mr-2" />
                          Cancel
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Mobile View - Card Layout */}
              <div className="md:hidden p-4 space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1 flex-1">
                    <div className="font-bold text-white text-sm leading-tight">{order.service_name}</div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-mono font-bold text-white/70">ORD-{9908 + Number(order.id)}</span>
                      <span>•</span>
                      <span>{formatDate(order.created_at)}</span>
                    </div>
                  </div>
                  <Badge variant="outline" className={cn("shrink-0", statusStyles[order.status?.toLowerCase()] || "bg-gray-500/10")}>
                    {statusLabels[order.status?.toLowerCase()] || order.status}
                  </Badge>
                </div>

                <div className="bg-secondary/20 p-3 rounded-lg flex items-center gap-3">
                  <ExternalLink className="h-4 w-4 text-primary shrink-0" />
                  <a href={order.link} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline break-all line-clamp-1">
                    {order.link}
                  </a>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-secondary/10 p-2 rounded-lg text-center border border-white/5">
                    <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-0.5">Quantity</div>
                    <div className="text-sm font-bold text-white">{order.quantity.toLocaleString()}</div>
                  </div>
                  <div className="bg-secondary/10 p-2 rounded-lg text-center border border-white/5">
                    <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-0.5">Charge</div>
                    <div className="text-sm font-bold text-emerald-400">{formatValue(Number(order.charge))}</div>
                  </div>
                  <div className="bg-secondary/10 p-2 rounded-lg text-center border border-white/5">
                    <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-0.5">Remains</div>
                    <div className="text-sm font-bold text-blue-400">{order.remains?.toLocaleString() ?? 0}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <div className="text-xs font-medium text-muted-foreground">
                    Start Count: <span className="text-white">{order.start_count?.toLocaleString() ?? 0}</span>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="secondary" size="sm" className="h-8 gap-2 bg-white/5 hover:bg-white/10 border-white/10 text-xs font-medium">
                        Actions
                        {refreshingId === order.id ? (
                          <RefreshCw className="h-3 w-3 animate-spin text-primary" />
                        ) : (
                          <MoreHorizontal className="h-3 w-3" />
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleRefresh(order.id)}>
                        <RefreshCw className={cn("h-4 w-4 mr-2", refreshingId === order.id && "animate-spin")} />
                        Refresh Status
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleRefill(order.id)}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refill
                      </DropdownMenuItem>
                      {['pending', 'processing', 'in progress'].includes(order.status?.toLowerCase()) && (
                        <DropdownMenuItem className="text-destructive" onClick={() => handleCancel(order.id)}>
                          <XCircle className="h-4 w-4 mr-2" />
                          Cancel
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  )
}