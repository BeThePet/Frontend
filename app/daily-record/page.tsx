"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function DailyRecordRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/health-record?today=true")
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-pink-50">
      <p className="text-gray-600">페이지 이동 중...</p>
    </div>
  )
}
