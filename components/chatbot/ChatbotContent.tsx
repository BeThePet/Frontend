"use client"

import { useApi } from "@/hooks/useApi"
import { Loading } from "@/components/ui/loading"

export default function ChatbotContent() {
  // TODO: API 연동 후 실제 데이터로 교체
  const mockData = {
    title: "챗봇 상담",
    description: "반려동물의 건강과 관련된 상담을 도와드립니다."
  }

  return (
    <div className="min-h-screen bg-[#FFF8F0] p-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">{mockData.title}</h1>
      <p className="text-gray-600 mb-8">{mockData.description}</p>
      
      {/* TODO: 실제 챗봇 UI 구현 */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <p className="text-gray-500 text-center">챗봇 기능 준비 중입니다.</p>
      </div>
    </div>
  )
} 