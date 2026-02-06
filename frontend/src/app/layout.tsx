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
    default: 'NepoSMM - #1 Social Media Marketing (SMM) Panel in Nepal',
    template: '%s | NepoSMM Panel',
  },
  description: 'Boost your social media presence with NepoSMM. High-quality Followers, Likes, Views, and Watch Time for Instagram, TikTok, YouTube, and Facebook.',
  keywords: ['NepoSMM', 'Nepo SMM', 'SMM Panel Nepal', 'Best SMM Nepal', 'Cheap SMM Panel', 'Social Media Marketing Nepal', 'Followers Nepal', 'TikTok Likes Nepal'],
  authors: [{ name: 'NepoSMM' }],
  creator: 'NepoSMM',
  publisher: 'NepoSMM',
  applicationName: 'NepoSMM',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://neposmm.com'),
  alternates: {
    canonical: 'https://neposmm.com',
  },
  openGraph: {
    title: 'NepoSMM - #1 Social Media Marketing (SMM) Panel in Nepal',
    description: 'Boost your social media presence with NepoSMM. High-quality Followers, Likes, Views, and Watch Time for Instagram, TikTok, YouTube, and Facebook.',
    url: 'https://neposmm.com',
    siteName: 'Nepo SMM',
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
    icon: [
      { url: '/logo.png', sizes: '32x32', type: 'image/png' },
      { url: '/logo.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/logo.png', sizes: '180x180', type: 'image/png' },
    ],
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
