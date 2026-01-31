import React from "react"
import type { Metadata } from 'next'
import { Inter, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from "@/components/theme-provider"
import { CurrencyProvider } from "@/context/CurrencyContext"
import { DashboardCurrencyProvider } from "@/context/DashboardCurrencyContext"
import { Toaster } from "sonner"
import './globals.css'

import { ContactLinksProvider } from "@/contexts/ContactLinksContext"
import { SessionManager } from "@/components/SessionManager"

const _inter = Inter({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: 'NepoSMM - Grow Your Social Media Instantly',
    template: 'NepoSMM - %s',
  },
  description: 'Followers, Likes & Views for Instagram, TikTok & YouTube. The world\'s #1 SMM Panel for high-quality social media services.',
  generator: 'v0.app',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <SessionManager />
          <CurrencyProvider>
            <DashboardCurrencyProvider>
              <ContactLinksProvider>
                {children}
              </ContactLinksProvider>
            </DashboardCurrencyProvider>
          </CurrencyProvider>
        </ThemeProvider>
        <Toaster position="top-right" richColors />
        <Analytics />
      </body>
    </html>
  )
}
