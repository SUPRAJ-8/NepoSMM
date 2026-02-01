"use client";

import { API_URL } from '@/lib/api-config'


import { useState, useEffect } from "react"
import { Bell, ChevronDown, Gift, Wallet, TrendingUp, Sun, Moon } from "lucide-react"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { useCurrency } from "@/context/CurrencyContext"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface HeaderProps {
  title?: string
  showBadge?: boolean
}

export function Header({ title = "New Order", showBadge = true }: HeaderProps) {
  const { currency, setCurrency, formatValue, availableCurrencies } = useCurrency()
  const [isBalanceOpen, setIsBalanceOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  // Avoid hydration mismatch by waiting for mount
  useEffect(() => {
    setMounted(true)

    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("nepo_token");
        if (!token) return;

        const response = await fetch(`${API_URL}/users/profile`, {
          headers: { "Authorization": `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          // Ensure balance is a number
          const updatedUser = {
            ...data,
            balance: typeof data.balance === 'string' ? parseFloat(data.balance) : data.balance
          };
          setUser(updatedUser);
          localStorage.setItem("nepo_user", JSON.stringify(updatedUser));

          // Trigger sync for other components
          window.dispatchEvent(new Event('userUpdate'));
        }
      } catch (error) {
        console.error("Header: Failed to fetch profile", error);
      }
    };

    const savedUser = localStorage.getItem("nepo_user")
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (e) {
        localStorage.removeItem("nepo_user")
      }
    }

    fetchProfile();

    const handleSync = () => {
      const updated = localStorage.getItem("nepo_user");
      if (updated) {
        try {
          setUser(JSON.parse(updated));
        } catch (e) { }
      }
    };
    window.addEventListener('userUpdate', handleSync);
    return () => window.removeEventListener('userUpdate', handleSync);
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("nepo_token")
    localStorage.removeItem("nepo_user")
    toast.info("Signed out successfully")
    window.location.href = "/"
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 lg:px-6">
      {/* Left - Page title */}
      <div className="flex items-center gap-4 pl-16 lg:pl-0">
        <h1 className="text-xl font-bold">{title}</h1>

      </div>

      {/* Right - Actions */}
      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="relative h-9 w-16 rounded-full border-border bg-secondary/50 p-1"
        >
          <div
            className={`absolute h-7 w-7 rounded-full bg-white transition-all duration-300 ease-in-out flex items-center justify-center ${mounted && theme === "dark" ? "left-1" : "left-[calc(100%-1.75rem-0.25rem)]"
              }`}
          >
            {mounted && theme === "dark" ? (
              <Moon className="h-4 w-4 text-black" />
            ) : (
              <Sun className="h-4 w-4 text-black" />
            )}
          </div>
          <span className="sr-only">Toggle theme</span>
        </Button>

        {/* Balance & Currency Dropdown */}
        <div className="relative">
          <Button
            variant="outline"
            onClick={() => setIsBalanceOpen(!isBalanceOpen)}
            className={cn(
              "hidden sm:flex items-center gap-2 border-border bg-secondary/50",
              isBalanceOpen && "ring-2 ring-primary/20 bg-primary/5 border-primary/20"
            )}
          >
            <Wallet className="h-4 w-4 text-primary" />
            <span className="font-semibold text-sm text-foreground">
              <span className="text-muted-foreground mr-1 text-xs font-normal">≈</span>
              {formatValue(user?.balance || 0)}
            </span>
            <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform duration-200", isBalanceOpen && "rotate-180")} />
          </Button>

          <AnimatePresence>
            {isBalanceOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsBalanceOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-2xl shadow-xl overflow-hidden z-50 p-2"
                >
                  {/* Add Funds Quick Link */}
                  <div className="px-2 pb-2 mb-2 border-b border-border/50">
                    <Button
                      onClick={() => {
                        router.push('/add-funds');
                        setIsBalanceOpen(false);
                      }}
                      className="w-full bg-blue-600 text-white hover:bg-blue-500 h-10 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20"
                    >
                      Add Funds
                    </Button>
                  </div>

                  {/* Currency Header -- */}
                  <div className="px-3 py-2 mb-1">
                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Select Currency</span>
                  </div>

                  <div className="max-h-80 overflow-y-auto custom-scrollbar flex flex-col gap-0.5">
                    {availableCurrencies.map((c) => (
                      <button
                        key={c.code}
                        onClick={() => {
                          setCurrency(c.code);
                          setIsBalanceOpen(false);
                        }}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all group",
                          currency.code === c.code
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-black min-w-[32px]">{c.symbol}</span>
                          <span className="text-[11px] font-bold uppercase opacity-60"> - {c.code}</span>
                        </div>
                        {currency.code === c.code && (
                          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        )}
                      </button>
                    ))}
                  </div>

                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>



        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-3 cursor-pointer p-1.5 rounded-xl bg-transparent hover:bg-transparent active:bg-transparent transition-none outline-none ring-0 border-none group">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-bold leading-none text-foreground">{user?.username || "Guest User"}</span>
                <span className="text-[10px] text-muted-foreground font-medium mt-1">{user?.email || "guest@example.com"}</span>
              </div>
              <div className="h-9 w-9 rounded-full bg-white/5 flex items-center justify-center border border-white/10 shadow-sm transition-none">
                <span className="text-sm font-semibold text-foreground">
                  {(user?.username || user?.email || "U").charAt(0).toUpperCase()}
                </span>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground transition-none" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-xl border-border bg-card shadow-xl p-1">
            <div className="px-3 py-2 border-b border-border/50 mb-1 sm:hidden">
              <p className="text-xs font-bold truncate">{user?.username || "Guest User"}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user?.email || "guest@example.com"}</p>
            </div>
            <DropdownMenuItem onClick={() => router.push('/account')} className="rounded-lg cursor-pointer">Account Settings</DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/orders')} className="rounded-lg cursor-pointer">Order History</DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/tickets')} className="rounded-lg cursor-pointer">Support Tickets</DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-destructive rounded-lg cursor-pointer"
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}