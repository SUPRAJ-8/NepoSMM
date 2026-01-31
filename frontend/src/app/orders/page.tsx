"use client";

import { useEffect, useState } from "react"
import { Sidebar } from "@/components/dashboard/Sidebar"
import { WelcomeTour } from "@/components/dashboard/welcome-tour"
import { Header } from "@/components/header"
import { OrdersFilters } from "@/components/orders-filters"
import { OrdersTable } from "@/components/orders-table"
import { OrdersEmptyState } from "@/components/orders-empty-state"
import { Loader2 } from "lucide-react"
import { API_URL } from "@/lib/api-config"
import { toast } from "sonner"

export interface Order {
  id: string
  created_at: string
  link: string
  charge: number
  start_count?: number
  quantity: number
  service_name: string
  status: "pending" | "processing" | "completed" | "partial" | "canceled"
  remains?: number
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [serviceFilter, setServiceFilter] = useState<string>("all")
  const [username, setUsername] = useState("User")

  useEffect(() => {
    const savedUser = localStorage.getItem("nepo_user")
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser)
        setUsername(user.username || user.email || "User")
      } catch (e) { }
    }
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("nepo_token")
        if (!token) return

        const response = await fetch(`${API_URL}/orders`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        console.log("Fetch Orders Response Status:", response.status);

        if (response.ok) {
          const data = await response.json()
          console.log("Fetched Orders Data:", data);
          setOrders(data)
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error("Fetch Orders Error Data:", errorData);
          toast.error(`Failed to fetch orders: ${response.statusText}`);
        }
      } catch (error) {
        console.error("Failed to fetch orders", error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      (9908 + Number(order.id)).toString().includes(searchQuery.toLowerCase()) ||
      `ORD-${9908 + Number(order.id)}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.link.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.service_name.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    const matchesService = serviceFilter === "all" || order.service_name.includes(serviceFilter)

    return matchesSearch && matchesStatus && matchesService
  })

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <WelcomeTour />
      <Sidebar />
      <main className="flex-1 lg:pl-64">
        <Header title="Orders" />
        <div className="p-4 lg:p-6 space-y-6">
          <OrdersFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            serviceFilter={serviceFilter}
            onServiceFilterChange={setServiceFilter}
          />

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <OrdersEmptyState username={username} />
          ) : (
            <OrdersTable orders={filteredOrders} />
          )}
        </div>
      </main>
    </div>
  )
}