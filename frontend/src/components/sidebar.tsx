"use client";

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { useState } from "react"
import { cn } from "@/lib/utils"
import {
  Plus,
  History,
  Wallet,
  Gift,
  LayoutDashboard,
  Package,
  Bell,
  Sparkles,
  Layers,
  Users,
  UserPlus,
  HelpCircle,
  Code,
  ChevronDown,
  ChevronRight,
  MessageCircle,
  Menu,
  X,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

interface NavItem {
  icon: React.ElementType
  label: string
  href: string
  badge?: string
}

const quickLinks: NavItem[] = [
  { icon: Plus, label: "New Order", href: "/" },
  { icon: History, label: "Orders History", href: "/orders" },
  { icon: Wallet, label: "Add Funds", href: "/add-funds" },
  { icon: Gift, label: "Giveaway", href: "/giveaway", badge: "NEW" },
]

const ordersServices: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Plus, label: "New Order", href: "/" },
  { icon: History, label: "Orders History", href: "/orders" },
  { icon: Package, label: "Services", href: "/services" },
  { icon: Bell, label: "Updates", href: "/updates" },
  { icon: Sparkles, label: "AI Recommended", href: "/ai-recommended" },
  { icon: Layers, label: "Mass Order", href: "/mass-order" },
]

const earnGrow: NavItem[] = [
  { icon: Users, label: "Child & Reseller", href: "/reseller" },
  { icon: UserPlus, label: "Affiliates", href: "/affiliates" },
  { icon: Gift, label: "Giveaway", href: "/giveaway" },
]

const support: NavItem[] = [
  { icon: HelpCircle, label: "FAQ", href: "/faq" },
  { icon: Code, label: "API", href: "/api-docs" },
]

function NavSection({
  title,
  items,
  defaultOpen = true,
  pathname,
}: {
  title: string
  items: NavItem[]
  defaultOpen?: boolean
  pathname: string
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex w-full items-center justify-between px-3 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
        {title}
        {isOpen ? (
          <ChevronDown className="h-3 w-3" />
        ) : (
          <ChevronRight className="h-3 w-3" />
        )}
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-0.5">
        {items.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={`${item.label}-${item.href}`}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-secondary",
                isActive && "bg-primary/10 text-primary font-medium"
              )}
            >
              <item.icon className={cn("h-4 w-4", isActive && "text-primary")} />
              <span>{item.label}</span>
              {item.badge && (
                <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </CollapsibleContent>
    </Collapsible>
  )
}

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      <Button
        variant="ghost"
        className={cn(
          "fixed top-[10.5px] left-4 z-50 lg:hidden h-11 w-11 p-0 flex items-center justify-center hover:bg-primary/10 transition-all duration-300",
          mobileOpen ? "opacity-0 pointer-events-none" : "opacity-100"
        )}
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="size-9" strokeWidth={2.5} />
      </Button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-[60] flex h-screen w-64 flex-col border-r border-border bg-sidebar transition-transform duration-300 lg:translate-x-0 lg:z-40",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-border h-20">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary flex-shrink-0 animate-in zoom-in duration-300">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-foreground truncate">NepoSMM</h1>
              <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest leading-none">Admin Panel</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(false)}
            className="lg:hidden h-10 w-10 min-w-[40px] flex items-center justify-center -mr-1"
          >
            <X className="size-7" strokeWidth={2.5} />
          </Button>
        </div>

        {/* User info */}
        <div className="px-4 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-sm font-semibold text-primary">JD</span>
            </div>
            <div>
              <p className="text-sm font-medium">John Doe</p>
              <p className="text-xs text-muted-foreground">Premium Member</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-4">
          <NavSection title="Quick Links" items={quickLinks} pathname={pathname} />
          <NavSection title="Orders & Services" items={ordersServices} pathname={pathname} />
          <NavSection title="Earn & Grow" items={earnGrow} pathname={pathname} />
          <NavSection title="Support & Help" items={support} pathname={pathname} />
        </nav>

        {/* Support CTA */}
        <div className="p-4 border-t border-border">
          <div className="rounded-xl bg-primary/10 p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">Need Help?</p>
                <p className="text-xs text-muted-foreground">24/7 Support</p>
              </div>
            </div>
            <Button className="w-full mt-3" size="sm">
              Contact Us
            </Button>
          </div>
        </div>
      </aside>
    </>
  )
}