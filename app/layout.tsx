import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import MobileLayout from "@/components/mobile-layout"
import "./globals.css"
import { Nunito } from "next/font/google"
import InstallPwaScript from "@/components/install-pwa-script"

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-nunito",
})

export const metadata = {
  title: "멍멍케어 - 반려견 헬스케어 앱",
  description: "우리 강아지의 건강을 더 똑똑하게 관리하세요",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#FFD6E5" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/logo.png" />
      </head>
      <body className={`${nunito.variable} font-nunito`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <div className="app-container">
            <MobileLayout>{children}</MobileLayout>
            <Toaster />
          </div>
        </ThemeProvider>
        <InstallPwaScript />
      </body>
    </html>
  )
}
