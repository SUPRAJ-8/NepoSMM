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
import { GoogleProvider } from "@/components/providers/GoogleProvider"
import { LoginBonusPopup } from "@/components/login-bonus-popup"

const _inter = Inter({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: 'NepoSMM - #1 Best SMM Panel Nepal | Social Media Marketing',
    template: '%s | NepoSMM Panel',
  },
  description: 'Boost your digital presence with NepoSMM, the best and cheapest SMM panel in Nepal. High-quality Followers, Likes, Views, and Watch Time for all social platforms.',
  keywords: ['NepoSMM', 'Nepo SMM', 'SMM Panel Nepal', 'Best SMM Nepal', 'Cheap SMM Panel', 'Social Media Marketing Nepal', 'Followers Nepal', 'TikTok Likes Nepal'],
  authors: [{ name: 'NepoSMM' }],
  creator: 'NepoSMM',
  publisher: 'NepoSMM',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://neposmm.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'NepoSMM - Grow Your Social Media Instantly',
    description: 'The world\'s #1 SMM Panel for high-quality social media services. Followers, Likes & Views for all platforms.',
    url: 'https://neposmm.com',
    siteName: 'NepoSMM',
    images: [
      {
        url: '/logo.png',
        width: 800,
        height: 600,
        alt: 'NepoSMM Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NepoSMM - #1 Social Media Marketing Panel',
    description: 'Boost your social media presence with NepoSMM. High-quality services for Instagram, TikTok, and more.',
    images: ['/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  category: 'technology',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  manifest: '/manifest.json',
  verification: {
    google: '6XW8KvRpl50rpJVhunIGln7X60OwHUQBvNBMM6vHegI',
  },
}

export const viewport = {
  themeColor: '#020617',
  width: 'device-width',
  initialScale: 1,
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
                <GoogleProvider>
                  <LoginBonusPopup />
                  {children}
                </GoogleProvider>
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
