"use client";

import { Wallet, MessageCircle } from "lucide-react"

export function AddFundsBanner() {
  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary/90 to-primary p-6">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-white/10 rounded-full translate-y-1/2" />
      </div>

      <div className="relative flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center sm:items-start gap-4 sm:gap-6">
          <div className="flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur shadow-xl border border-white/10">
            <Wallet className="h-7 w-7 sm:h-8 sm:w-8 text-primary-foreground" />
          </div>
          <div className="space-y-2 py-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-none uppercase italic">Add Funds</h1>
            <div className="flex items-center gap-2.5 text-primary-foreground/90">
              <div className="h-6 w-6 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                <MessageCircle className="h-3.5 w-3.5" />
              </div>
              <p className="text-xs sm:text-sm font-bold opacity-80 leading-snug">
                Don&apos;t hesitate to contact us for payment questions.
              </p>
            </div>
          </div>
        </div>

        <a
          href="https://wa.me/9779866887714"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-3 bg-[#25D366] hover:bg-[#20ba5a] text-white px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-wider shadow-lg shadow-[#25D366]/20 transition-all hover:scale-105 active:scale-95 shrink-0"
        >
          <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center">
            <MessageCircle className="h-5 w-5 fill-white" />
          </div>
          WhatsApp Support
        </a>
      </div>
    </div>
  )
}