"use client"

import { useState, useEffect, useMemo } from "react"
import { useCurrency } from "@/context/CurrencyContext"
import Link from "next/link"
import {
  Search, Star, ChevronDown, Link as LinkIcon, Hash,
  DollarSign, Info, Zap, Shield, Instagram, Facebook,
  Youtube, Send, Video, Music2, Apple, Twitter,
  MessageSquare, Globe, History, RefreshCw, Plus
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const BACKEND_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000').replace(/\/$/, '');

interface Service {
  id: number;
  name: string;
  category: string;
  rate: number;
  min: number;
  max: number;
  status: string;
  average_time?: string;
  guarantee?: string;
  start_time?: string;
  speed?: string;
  description?: string;
}

interface Category {
  category: string;
  total_services: number;
  active_services: number;
  sort_order?: number;
}

const TikTokLogo = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

export function OrderForm({
  defaultTab = "new",
  selectedPlatform = "all"
}: {
  defaultTab?: "new" | "recent",
  selectedPlatform?: string
}) {
  const { formatValue } = useCurrency()
  console.log('OrderForm initialized with BACKEND_URL:', BACKEND_URL);
  const getPlatformIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("instagram") || n.includes("ig ")) return <Instagram className="h-4 w-4 text-pink-500" />;
    if (n.includes("facebook") || n.includes("fb ")) return <Facebook className="h-4 w-4 text-blue-600" />;
    if (n.includes("youtube") || n.includes("yt ")) return <Youtube className="h-4 w-4 text-red-600" />;
    if (n.includes("telegram")) return <Send className="h-4 w-4 text-sky-500" />;
    if (n.includes("tiktok")) return <TikTokLogo className="h-4 w-4 text-zinc-400" />;
    if (n.includes("spotify")) return <Music2 className="h-4 w-4 text-emerald-500" />;
    if (n.includes("apple")) return <Apple className="h-4 w-4 text-zinc-300" />;
    if (n.includes("twitter") || n.includes(" x ")) return <Twitter className="h-4 w-4 text-zinc-400" />;
    if (n.includes("reddit")) return <MessageSquare className="h-4 w-4 text-orange-500" />;
    return <Globe className="h-4 w-4 text-muted-foreground" />;
  };
  const [orderType, setOrderType] = useState<"new" | "recent">(defaultTab)
  const [services, setServices] = useState<Service[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [quantity, setQuantity] = useState<number | "">("")
  const [link, setLink] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [isRecentLoading, setIsRecentLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  // Fetch recent orders
  const fetchRecentOrders = async () => {
    try {
      setIsRecentLoading(true);
      const token = localStorage.getItem("nepo_token");
      if (!token) return;

      const res = await fetch(`${BACKEND_URL}/api/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setRecentOrders(data.slice(0, 5)); // Only show top 5
      }
    } catch (error) {
      console.error('Failed to fetch recent orders:', error);
    } finally {
      setIsRecentLoading(false);
    }
  };

  useEffect(() => {
    if (orderType === "recent") {
      fetchRecentOrders();
    }
  }, [orderType]);

  const handleSubmit = async () => {
    if (!selectedService || !link || !quantity) {
      toast.error("Please fill in all fields", {
        description: "Make sure you've selected a service and entered both link and quantity.",
      });
      return;
    }
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("nepo_token");
      if (!token) {
        toast.error("Authentication required", {
          description: "Please login to place an order.",
        });
        return;
      }

      console.log('Placing order:', { serviceId: selectedService.id, link, quantity });
      const response = await fetch(`${BACKEND_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          serviceId: selectedService.id,
          link,
          quantity: Number(quantity)
        })
      });

      const data = await response.json();
      console.log('Order response:', data);

      if (!response.ok) {
        throw new Error(data.error || "Failed to place order");
      }

      toast.success("Order Processed!", {
        description: `Successfully placed order for ${selectedService.name}.`,
      });

      setLink("");
      setQuantity("");

      // Refresh recent orders globally within component
      fetchRecentOrders();

      // Refresh balance in localStorage and notify other components
      const userStr = localStorage.getItem("nepo_user");
      if (userStr) {
        const user = JSON.parse(userStr);
        const charge = (Number(selectedService.rate) * Number(quantity) / 1000);
        user.balance = Number(user.balance) - charge;
        localStorage.setItem("nepo_user", JSON.stringify(user));
        window.dispatchEvent(new Event('userUpdate'));
      }
    } catch (error: any) {
      toast.error("Order Failed", {
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fetch services and categories on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch in parallel
        const [servicesRes, categoriesRes] = await Promise.all([
          fetch(`${BACKEND_URL}/api/services?status=active`),
          fetch(`${BACKEND_URL}/api/services/categories`)
        ]);

        if (!servicesRes.ok) throw new Error(`Services fetch failed: ${servicesRes.statusText}`);
        if (!categoriesRes.ok) throw new Error(`Categories fetch failed: ${categoriesRes.statusText}`);

        const [servicesData, categoriesData] = await Promise.all([
          servicesRes.json(),
          categoriesRes.json()
        ]);

        console.log('Fetched services:', servicesData);
        console.log('Fetched categories:', categoriesData);

        if (Array.isArray(servicesData)) {
          setServices(servicesData);
        }

        if (Array.isArray(categoriesData)) {
          setCategories(categoriesData);
        }

        // Set default service
        if (Array.isArray(servicesData) && servicesData.length > 0) {
          setSelectedService(servicesData[0]);
        }
      } catch (error) {
        console.error('Failed to fetch services/categories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter and sort categories
  const sortedCategories = useMemo(() => {
    return categories.map(c => {
      // Pre-calculate match strength
      const platform = selectedPlatform.toLowerCase();
      const categoryName = c.category.toLowerCase();
      const categoryServices = services.filter(s => s.category === c.category);

      // Primary platform match (e.g., "Instagram" platform matches "Instagram Followers" category)
      let matchStrength = 0; // 0 = no match, 1 = service match, 2 = category name match, 3 = exact match

      if (selectedPlatform === "all") {
        matchStrength = 1;
      } else {
        const platform = selectedPlatform.toLowerCase();

        // Comprehensive Platform Matching
        const isExactMatch = categoryName === platform ||
          (platform === "youtube" && (categoryName === "yt" || categoryName === "youtube")) ||
          (platform === "instagram" && (categoryName === "ig" || categoryName === "instagram")) ||
          (platform === "facebook" && (categoryName === "fb" || categoryName === "facebook")) ||
          (platform === "twitter" && (categoryName === "tw" || categoryName === "twitter" || categoryName === " x "));

        const isNameMatch = categoryName.includes(platform) ||
          (platform === "youtube" && (categoryName.includes("youtube") || categoryName.includes("yt"))) ||
          (platform === "instagram" && (categoryName.includes("instagram") || categoryName.includes("ig"))) ||
          (platform === "facebook" && (categoryName.includes("facebook") || categoryName.includes("fb"))) ||
          (platform === "twitter" && (categoryName.includes("twitter") || categoryName.includes(" x "))) ||
          (platform === "tiktok" && categoryName.includes("tiktok")) ||
          (platform === "telegram" && categoryName.includes("telegram")) ||
          (platform === "spotify" && categoryName.includes("spotify")) ||
          (platform === "reddit" && categoryName.includes("reddit")) ||
          (platform === "apple" && (categoryName.includes("apple") || categoryName.includes("itunes")));

        const isServiceMatch = categoryServices.some(s => {
          const name = s.name.toLowerCase();
          return name.includes(platform) ||
            (platform === "youtube" && (name.includes("youtube") || name.includes("yt"))) ||
            (platform === "instagram" && (name.includes("instagram") || name.includes("ig"))) ||
            (platform === "facebook" && (name.includes("facebook") || name.includes("fb"))) ||
            (platform === "twitter" && (name.includes("twitter") || name.includes(" x "))) ||
            (platform === "tiktok" && name.includes("tiktok")) ||
            (platform === "telegram" && name.includes("telegram")) ||
            (platform === "spotify" && name.includes("spotify")) ||
            (platform === "reddit" && name.includes("reddit")) ||
            (platform === "apple" && (name.includes("apple") || name.includes("itunes")));
        });

        if (isExactMatch) matchStrength = 3;
        else if (isNameMatch) matchStrength = 2;
        else matchStrength = 0; // Strictly filter by platform name (no service name fallback)
      }

      return { ...c, matchStrength, categoryServices };
    })
      .filter(c => c.matchStrength > 0 && c.categoryServices.length > 0)
      .sort((a, b) => {
        const isAll = selectedPlatform === "all";

        if (isAll) {
          // ADMIN-STYLE SORTING: sort_order first, then alphabetical
          const orderA = a.sort_order ?? 0;
          const orderB = b.sort_order ?? 0;
          if (orderA !== orderB) return orderA - orderB;
          return a.category.localeCompare(b.category, undefined, { sensitivity: 'base' });
        }

        // PLATFORM-SPECIFIC SORTING: Star Emoji > Match Strength > sort_order
        // 1. Star Emoji Prioritization (⭐)
        const hasStarA = a.category.includes('⭐');
        const hasStarB = b.category.includes('⭐');
        if (hasStarA && !hasStarB) return -1;
        if (!hasStarA && hasStarB) return 1;

        // 2. Match Strength (Exact Match > Name Match)
        if (b.matchStrength !== a.matchStrength) return b.matchStrength - a.matchStrength;

        // 3. Absolute Primary: sort_order
        const orderA = a.sort_order ?? 0;
        const orderB = b.sort_order ?? 0;
        if (orderA !== orderB) return orderA - orderB;

        // 4. Tertiary: Any Emoji
        const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F000}-\u{1F9FF}]/u;
        const hasEmojiA = emojiRegex.test(a.category);
        const hasEmojiB = emojiRegex.test(b.category);
        if (hasEmojiA && !hasEmojiB) return -1;
        if (!hasEmojiA && hasEmojiB) return 1;

        // 5. Quaternary: Alphabetical
        return a.category.localeCompare(b.category, undefined, { sensitivity: 'base' });
      });
  }, [categories, services, selectedPlatform]);

  // Map for category service counts for faster lookup
  const categoryCountMap = useMemo(() => {
    const map = new Map<string, number>();
    services.forEach(s => {
      map.set(s.category, (map.get(s.category) || 0) + 1);
    });
    return map;
  }, [services]);

  // Reset category/service if platform changes
  useEffect(() => {
    if (sortedCategories.length > 0) {
      // Find the currently selected category in the new sorted list
      const currentInNewList = sortedCategories.find(c => c.category === selectedCategory);

      // We should reset to the first category if:
      // 1. The selection is no longer in the sorted list
      // 2. Nothing is selected yet
      if (!currentInNewList || !selectedCategory) {
        const firstCat = sortedCategories[0].category;

        // Only update if it's actually different to avoid infinite loops or unnecessary renders
        if (selectedCategory !== firstCat) {
          setSelectedCategory(firstCat);
          const firstService = services.find(s => s.category === firstCat);
          if (firstService) setSelectedService(firstService);
        }
      }
    }
  }, [selectedPlatform, sortedCategories, services]);

  // Filter and sort services by selected category
  const filteredServices = useMemo(() => {
    const list = selectedCategory
      ? services.filter(s => s.category === selectedCategory)
      : services;

    return [...list].sort((a, b) => {
      const hasEmojiA = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F000}-\u{1F9FF}]/u.test(a.name) || a.name.toLowerCase().includes('emoji');
      const hasEmojiB = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F000}-\u{1F9FF}]/u.test(b.name) || b.name.toLowerCase().includes('emoji');

      if (hasEmojiA && !hasEmojiB) return -1;
      if (!hasEmojiA && hasEmojiB) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [services, selectedCategory]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []
    const q = searchQuery.toLowerCase().trim()
    return services.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.id.toString().includes(q)
    ).slice(0, 50)
  }, [services, searchQuery])

  const totalPrice = selectedService ? formatValue(Number(selectedService.rate) * (Number(quantity) / 1000)) : formatValue(0);

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      {/* Order Form */}
      <Card className="lg:col-span-3 bg-card border-border relative overflow-hidden">
        <CardHeader className="py-2 lg:py-3 relative pl-4 lg:pl-6">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 lg:w-1.5 h-4 lg:h-6 bg-primary rounded-r-full" />
          <div className="flex items-center justify-between">
            <CardTitle className="text-base lg:text-lg font-bold text-primary">New Order</CardTitle>
            <Tabs value={orderType} onValueChange={(v) => setOrderType(v as "new" | "recent")}>
              <TabsList className="bg-secondary/50 h-8 lg:h-10">
                <TabsTrigger value="new" className="data-[state=active]:!bg-primary data-[state=active]:!text-white transition-all duration-300 text-xs lg:text-sm px-2 lg:px-3">
                  <Plus className="h-3 w-3 mr-0.5 lg:mr-1" />
                  <span className="hidden sm:inline">New Order</span>
                  <span className="sm:hidden">New</span>
                </TabsTrigger>
                <TabsTrigger value="recent" className="data-[state=active]:!bg-primary data-[state=active]:!text-white transition-all duration-300 text-xs lg:text-sm px-2 lg:px-3">
                  <Star className="h-3 w-3 mr-0.5 lg:mr-1" />
                  <span className="hidden sm:inline">Recent Orders</span>
                  <span className="sm:hidden">Recent</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {orderType === "new" ? (
            <>
              {/* Search (Hide if Quick Order) */}
              <div className="relative z-50 mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search services..."
                  className="pl-12 bg-input border-border h-14 text-base rounded-xl"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                />

                {/* Search Results Dropdown */}
                {isSearchFocused && searchQuery && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-xl shadow-2xl overflow-hidden max-h-[400px] overflow-y-auto z-50 ring-1 ring-black/5 dark:ring-white/5">
                    {searchResults.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">No services found matching "{searchQuery}"</div>
                    ) : (
                      searchResults.map((service) => (
                        <div
                          key={service.id}
                          className="flex items-center gap-3 p-3 hover:bg-accent cursor-pointer border-b border-border/50 last:border-0 transition-colors group"
                          onClick={() => {
                            setSelectedCategory(service.category)
                            setSelectedService(service)
                            setSearchQuery("")
                            setIsSearchFocused(false)
                          }}
                        >
                          {/* ID badge */}
                          <span className="shrink-0 bg-blue-500/10 text-blue-500 text-[10px] font-bold px-1.5 py-0.5 rounded min-w-[35px] text-center font-mono border border-blue-500/20 group-hover:bg-blue-500/20 transition-colors">
                            {service.id}
                          </span>

                          {/* Dot Status */}
                          <div className={cn("h-2 w-2 rounded-full shrink-0 shadow-[0_0_8px_rgba(0,0,0,0.5)]",
                            service.name.toLowerCase().includes('tiktok') ? 'bg-cyan-500 shadow-cyan-500/50' :
                              service.name.toLowerCase().includes('instagram') ? 'bg-pink-500 shadow-pink-500/50' :
                                service.name.toLowerCase().includes('youtube') ? 'bg-red-500 shadow-red-500/50' :
                                  service.name.toLowerCase().includes('facebook') ? 'bg-blue-600 shadow-blue-600/50' :
                                    service.name.toLowerCase().includes('telegram') ? 'bg-sky-500 shadow-sky-500/50' :
                                      'bg-gray-400'
                          )} />

                          {/* Name */}
                          <span className="flex-1 text-sm text-foreground group-hover:text-primary pr-2 transition-colors leading-tight">
                            {service.name}
                          </span>

                          {/* Price */}
                          <span className="shrink-0 text-xs font-mono text-muted-foreground group-hover:text-primary transition-colors">
                            ≈ {formatValue(service.rate)}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Category & Service (Hide if Quick Order) */}
              {/* Category */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Category</Label>
                <Select
                  value={selectedCategory}
                  onValueChange={(v) => {
                    setSelectedCategory(v);
                    // Reset service selection when category changes
                    const firstServiceInCategory = services.find(s => s.category === v);
                    if (firstServiceInCategory) {
                      setSelectedService(firstServiceInCategory);
                    }
                  }}
                  disabled={isLoading || categories.length === 0}
                >
                  <SelectTrigger id="tour-new-order-category" className="w-full bg-input border-border h-14 text-base rounded-xl px-4">
                    <SelectValue placeholder={isLoading ? "Loading categories..." : (categories.length === 0 ? "No active categories found" : "Select category")} />
                  </SelectTrigger>
                  <SelectContent>
                    {sortedCategories.map((cat) => {
                      const verifiedCount = categoryCountMap.get(cat.category) || 0;
                      return (
                        <SelectItem key={cat.category} value={cat.category}>
                          <div className="flex items-center gap-2">
                            {getPlatformIcon(cat.category)}
                            <span>{cat.category} ({verifiedCount} services)</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Service */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Service</Label>
                <Select
                  value={selectedService?.id?.toString() || ""}
                  onValueChange={(v) => {
                    const service = services.find((s) => s.id?.toString() === v);
                    if (service) setSelectedService(service);
                  }}
                  disabled={isLoading || filteredServices.length === 0}
                >
                  <SelectTrigger id="tour-new-order-service" className="w-full bg-input border-border h-14 text-base rounded-xl px-4">
                    <SelectValue placeholder={isLoading ? "Loading services..." : (filteredServices.length === 0 ? "No verified services available" : "Select service")} />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredServices.map((service) => (
                      <SelectItem key={service.id} value={service.id.toString()}>
                        <div className="flex items-center gap-2">
                          {getPlatformIcon(service.name)}
                          <span className="shrink-0 bg-blue-500/10 text-blue-500 text-[10px] font-bold px-1.5 py-0.5 rounded min-w-[32px] text-center font-mono border border-blue-500/20 transition-colors">
                            {service.id}
                          </span>
                          <span className="flex-1 truncate">{service.name}</span>
                          <span className="ml-auto text-muted-foreground whitespace-nowrap">{formatValue(service.rate)}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Link */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <Label className="text-sm font-medium">Link</Label>
                  <div className="group relative">
                    <Info className="h-3.5 w-3.5 text-amber-500 cursor-help hover:text-amber-400 transition-colors" />
                    <div className="absolute bottom-full left-0 mb-2 w-72 p-3 bg-popover text-popover-foreground text-xs rounded-xl border border-border shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
                      <div className="font-bold mb-1 text-amber-500 flex items-center gap-1">
                        <Info className="h-3 w-3" />
                        Link Instructions
                      </div>
                      You need to enter the link of your target (profile, post, video, mail etc.) in this field. Always read the service description to check the allowed link format and make sure to use that format. If you don’t, your order will be cancelled automatically.
                      <div className="absolute -bottom-1 left-3 w-2 h-2 bg-popover border-r border-b border-border rotate-45" />
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder=""
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    className="pl-12 bg-input border-border h-14 text-base rounded-xl"
                  />
                </div>
              </div>

              {/* Quantity */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Quantity</Label>
                <div className="relative">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value === "" ? "" : Number(e.target.value))}
                    className="pl-12 bg-input border-border h-14 text-base rounded-xl"
                    placeholder=""
                  />
                </div>
                <div className="flex justify-end">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                    Min: {selectedService?.min?.toLocaleString() ?? 0} — Max: {selectedService?.max?.toLocaleString() ?? 0}
                  </span>
                </div>
              </div>

              {/* Total Charge */}
              <div className="rounded-xl bg-secondary/50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Charge</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-foreground transition-none">{totalPrice}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={cn(
                    "w-full h-12 rounded-xl border-0 font-black uppercase tracking-widest text-xs transition-all duration-300",
                    "bg-gradient-to-r from-primary/80 to-primary",
                    "text-white shadow-[0_8px_20px_-6px_rgba(var(--primary),0.3)]",
                    "hover:shadow-[0_12px_25px_-4px_rgba(var(--primary),0.4)] hover:-translate-y-0.5 active:translate-y-0",
                    "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  )}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Zap className="h-3.5 w-3.5 fill-white" />
                      <span>Submit Order</span>
                    </div>
                  )}
                </Button>
                <Button className="bg-emerald-500 hover:bg-emerald-600 text-white border-0 font-bold h-12 rounded-xl transition-colors" asChild>
                  <Link href="/add-funds">Add Funds</Link>
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              {isRecentLoading ? (
                <div className="flex items-center justify-center py-10 text-muted-foreground text-sm">
                  Loading recent orders...
                </div>
              ) : recentOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center space-y-2">
                  <History className="h-10 w-10 text-muted-foreground/20" />
                  <p className="text-muted-foreground text-sm">No recent orders yet</p>
                  <Button variant="link" onClick={() => setOrderType("new")} className="text-xs text-primary">Place your first order</Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border/50">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-muted-foreground">#{9908 + Number(order.id)}</span>
                          <span className="text-xs font-bold text-foreground leading-tight">{order.service_name}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground">
                          {(() => {
                            const d = new Date(order.created_at);
                            const day = d.getDate().toString().padStart(2, '0');
                            const month = d.toLocaleString('en-US', { month: 'short' });
                            const year = d.getFullYear();
                            return `${day} ${month}, ${year}`;
                          })()}
                        </span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-xs font-black text-primary">{formatValue(order.charge)}</span>
                        <span className={cn(
                          "text-[9px] font-black uppercase tracking-tighter",
                          order.status === 'completed' ? "text-emerald-500" :
                            order.status === 'processing' ? "text-blue-500" :
                              order.status === 'canceled' ? "text-red-500" : "text-amber-500"
                        )}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                  <Button variant="ghost" className="w-full text-xs text-muted-foreground hover:text-primary" asChild>
                    <Link href="/orders">View All Orders</Link>
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Service Info Panel */}
      <Card className="lg:col-span-2 bg-card border-border">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Service Details</CardTitle>
            <div className="flex gap-1">
              <span className="h-2 w-2 rounded-full bg-amber-500" title="Basic" />
              <span className="h-2 w-2 rounded-full bg-blue-500" title="Medium" />
              <span className="h-2 w-2 rounded-full bg-cyan-500" title="Elite" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Tabs */}
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="w-full bg-secondary">
              <TabsTrigger value="info" className="flex-1 data-[state=active]:bg-white data-[state=active]:text-black transition-none">
                <Info className="h-3 w-3 mr-1" />
                Service Info
              </TabsTrigger>
              <TabsTrigger value="guide" className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-none">
                Read Before
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Service Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-secondary/50 p-3">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Shield className="h-4 w-4" />
                <span className="text-xs">Guarantee</span>
              </div>
              <p className="font-semibold text-sm">{selectedService?.guarantee || "No Guarantee"}</p>
            </div>
            <div className="rounded-lg bg-secondary/50 p-3">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Zap className="h-4 w-4" />
                <span className="text-xs">Speed</span>
              </div>
              <p className="font-semibold text-sm">{selectedService?.speed || "N/A"}</p>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Description</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              {selectedService?.description ? (
                <div className="bg-secondary/30 p-3 rounded-lg border border-border/50 text-xs leading-relaxed whitespace-pre-wrap">
                  {selectedService.description}
                </div>
              ) : (
                <>
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5 shrink-0">
                      {selectedService ? getPlatformIcon(selectedService.name) : <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />}
                    </div>
                    <span>{selectedService?.name || "Select a service"}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                    <span>Geo: Worldwide</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <span>Start Time: {selectedService?.start_time || "Instant"}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 mt-1.5 shrink-0" />
                    <span>Min: {selectedService?.min?.toLocaleString() ?? 0} - Max: {selectedService?.max?.toLocaleString() ?? 0}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Warning */}
          <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3">
            <p className="text-xs text-amber-500">
              <strong>Note:</strong> Profile must be set to public for the order to start. Private profiles will not receive delivery.
            </p>
          </div>

          {/* Quality Tiers */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Quality Tiers</h4>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                <span className="text-muted-foreground">Basic - Budget friendly, may have drops</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                <span className="text-muted-foreground">Medium - Balanced quality and price</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="h-2 w-2 rounded-full bg-cyan-500" />
                <span className="text-muted-foreground">Elite - Premium quality, guaranteed</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
