"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Bone, Brain, BarChart3, Home, Calendar, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import NotificationManager from "@/components/notification-manager"
import OfflineIndicator from "@/components/offline-indicator"
import { useEffect } from "react"
import { initializeNotifications } from "@/lib/notification"
import { registerServiceWorker } from "@/lib/pwa"

interface MobileLayoutProps {
  children: React.ReactNode
}

export default function MobileLayout({ children }: MobileLayoutProps) {
  const pathname = usePathname()

  // Skip navigation on certain pages
  const hideNavigation = ["/", "/login", "/signup"].includes(pathname)

  // 현재 활성화된 탭 확인 함수
  const isActive = (path: string) => {
    if (path === "/dashboard") return pathname === "/dashboard"
    return pathname.startsWith(path)
  }

  // 앱 초기화
  useEffect(() => {
    // 알림 초기화
    initializeNotifications()

    // 서비스 워커 등록 (PWA 지원)
    registerServiceWorker()
  }, [])

  return (
    <div className="relative flex flex-col min-h-screen w-full h-full mx-auto bg-pink-50">
      {/* 오프라인 상태 표시 */}
      <OfflineIndicator />

      {/* Main content */}
      <main className="flex-1 overflow-y-auto w-full max-w-md mx-auto pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="h-full w-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* 알림 관리자 */}
      {!hideNavigation && <NotificationManager />}

      {/* Bottom navigation */}
      {!hideNavigation && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-pink-100 h-16 z-50 safe-area-inset-bottom max-w-screen-md mx-auto shadow-md">
          <div className="flex justify-around items-center h-full">
            <NavItem href="/dashboard" icon={<Home />} label="홈" isActive={isActive("/dashboard")} />
            <NavItem href="/health-record" icon={<Calendar />} label="건강기록" isActive={isActive("/health-record")} />
            <NavItem href="/food" icon={<Bone />} label="사료추천" isActive={isActive("/food")} />
            <NavItem
              href="/ai-assistant"
              icon={<Brain />}
              label="AI챗봇"
              isActive={isActive("/ai-assistant") || isActive("/chatbot")}
            />
            <NavItem href="/report" icon={<BarChart3 />} label="리포트" isActive={isActive("/report")} />
            <NavItem href="/emergency" icon={<AlertTriangle />} label="응급" isActive={isActive("/emergency")} />
          </div>
        </nav>
      )}
    </div>
  )
}

interface NavItemProps {
  href: string
  icon: React.ReactNode
  label: string
  isActive: boolean
}

function NavItem({ href, icon, label, isActive }: NavItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col items-center justify-center px-2 py-1 rounded-xl transition-colors relative",
        isActive ? "text-pink-500" : "text-gray-500",
      )}
    >
      {isActive && (
        <motion.div
          layoutId="activeTab"
          className="absolute inset-0 bg-pink-50 rounded-xl"
          transition={{ type: "spring", duration: 0.5 }}
        />
      )}
      <div className="w-5 h-5 relative z-10">{icon}</div>
      <span className="text-xs mt-1 font-medium relative z-10">{label}</span>
    </Link>
  )
}
