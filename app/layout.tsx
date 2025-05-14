import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/providers/theme-provider"
import type { Metadata } from "next"
import { siteConfig } from "@/config/site"
import { ChatWidget } from "@/components/chatbot/chat-widget"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "Farmer Credit",
    "Agricultural Loans",
    "Farm Financing",
    "Nigeria Farming",
    "Farmer Loans",
    "Agricultural Credit",
    "Farm Investment",
    "Rural Finance",
    "Agribusiness Funding",
    "Crop Financing",
  ],
  authors: [
    {
      name: "FarmCredit Team",
      url: "https://farmcredit.ng",
    },
  ],
  creator: "FarmCredit Team",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    creator: "@farmcredit",
  },
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
  manifest: "/site.webmanifest",
    generator: 'v0.dev'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <ChatWidget />
        </ThemeProvider>
      </body>
    </html>
  )
}
