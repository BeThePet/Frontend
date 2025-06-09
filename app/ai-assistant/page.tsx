"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loading } from '@/components/ui/loading'

export default function AIAssistantPage() {
  const router = useRouter()

  useEffect(() => {
    // AI 어시스턴트 페이지는 챗봇 페이지로 리다이렉트
    router.replace('/chatbot')
  }, [router])

  return (
    <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center">
      <Loading />
    </div>
  )
}
