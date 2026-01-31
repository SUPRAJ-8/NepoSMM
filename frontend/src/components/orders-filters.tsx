"use client";

import { Search, Filter, ListFilter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"

interface OrdersFiltersProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  statusFilter: string
  onStatusFilterChange: (value: string) => void
  serviceFilter: string
  onServiceFilterChange: (value: string) => void
}

const statusOptions = [
  { value: "all", label: "All Orders" },
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "completed", label: "Completed" },
  { value: "partial", label: "Partial" },
  { value: "canceled", label: "Canceled" },
]

const serviceOptions = [
  { value: "all", label: "All Services" },
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "youtube", label: "YouTube" },
  { value: "facebook", label: "Facebook" },
  { value: "twitter", label: "X/Twitter" },
  { value: "telegram", label: "Telegram" },
]

export function OrdersFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  serviceFilter,
  onServiceFilterChange,
}: OrdersFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Filter Orders Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" className="bg-white/5 hover:bg-white/10 border border-white/10 text-white gap-2 transition-none">
            <Filter className="h-4 w-4" />
            Filter Orders
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {statusOptions.map((option) => (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={statusFilter === option.value}
              onCheckedChange={() => onStatusFilterChange(option.value)}
            >
              {option.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Filter by Services ID Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" className="bg-white/5 hover:bg-white/10 border border-white/10 text-white gap-2 transition-none">
            <ListFilter className="h-4 w-4" />
            Filter by Services ID
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuLabel>Filter by Service</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {serviceOptions.map((option) => (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={serviceFilter === option.value}
              onCheckedChange={() => onServiceFilterChange(option.value)}
            >
              {option.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 bg-secondary/50 border-border"
        />
      </div>
    </div>
  )
}