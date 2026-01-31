"use client"

import { Smile } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface OrdersEmptyStateProps {
  username: string
}

export function OrdersEmptyState({ username }: OrdersEmptyStateProps) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Top gradient section */}
      <div className="relative bg-gradient-to-br from-card via-card to-primary/20 px-6 py-16 flex flex-col items-center justify-center text-center">
        {/* Smiley icon */}
        <div className="mb-6">
          <div className="h-16 w-16 rounded-full border-2 border-foreground/80 flex items-center justify-center">
            <Smile className="h-10 w-10 text-foreground/80" strokeWidth={1.5} />
          </div>
        </div>

        {/* Message */}
        <h2 className="text-xl font-semibold mb-2">
          Hello {username}, you&apos;ve never placed an order before.
        </h2>
        <p className="text-muted-foreground mb-6">
          You can add a balance and order any service on the New Order page.
        </p>

        {/* CTA Button */}
        <Link href="/">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
            Place New Order
          </Button>
        </Link>
      </div>

      {/* Table header */}
      <div className="border-t border-border">
        <div className="hidden md:grid grid-cols-9 gap-4 px-4 py-3 text-sm font-medium text-muted-foreground bg-secondary/30">
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
      </div>
    </div>
  )
}
