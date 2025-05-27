"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function DailyRecordContent() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/health-record?today=true")
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-pink-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-4"></div>
        <p className="text-gray-600">페이지 이동 중...</p>
      </div>
    </div>
  )
} 