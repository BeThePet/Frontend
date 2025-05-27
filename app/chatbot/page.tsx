"use client"

import dynamic from 'next/dynamic'
import { Loading } from '@/components/ui/loading'

// 클라이언트 사이드에서만 로드되도록 동적 임포트
const ChatbotContent = dynamic(() => import('@/components/chatbot/ChatbotContent'), {
  ssr: false,
  loading: () => <Loading />
})

export default function ChatbotPage() {
  return <ChatbotContent />
}
