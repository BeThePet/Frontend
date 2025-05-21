"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Send, Stethoscope, PawPrint, Brain, Search } from "lucide-react"
import { motion } from "framer-motion"
import { getData } from "@/lib/storage"

// 예시 질문 데이터
const exampleQuestions = {
  medical: [
    "우리 강아지가 기침을 해요",
    "강아지가 밥을 잘 안 먹어요",
    "강아지 눈에 눈곱이 많이 껴요",
    "강아지가 자꾸 긁어요",
    "강아지가 구토를 했어요",
    "강아지가 설사를 해요",
  ],
  general: [
    "강아지 목욕은 얼마나 자주 시켜야 하나요?",
    "강아지 사료 추천해주세요",
    "강아지 훈련은 언제부터 시작해야 하나요?",
    "강아지 산책 시간은 얼마나 필요한가요?",
    "강아지 이갈이 어떻게 해결하나요?",
    "강아지 털 관리는 어떻게 하나요?",
  ],
}

export default function ChatbotPage() {
  const [activeTab, setActiveTab] = useState<"medical" | "general">("medical")
  const [petInfo, setPetInfo] = useState<any>(null)

  useEffect(() => {
    // 반려견 정보 불러오기
    const savedPetInfo = getData("petInfo")
    if (savedPetInfo) {
      setPetInfo(savedPetInfo)
    }
  }, [])

  // 탭 변경 처리
  const handleTabChange = (value: string) => {
    setActiveTab(value as "medical" | "general")
  }

  return (
    <div className="min-h-screen bg-[#FFF8F0] flex flex-col">
      <div className="bg-gradient-to-r from-[#D6ECFA] to-[#FBD6E4] p-4 flex items-center">
        <Link href="/dashboard" className="text-gray-800">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-bold text-gray-800 ml-4">AI 어시스턴트</h1>
      </div>

      <div className="flex-1 p-5 flex flex-col">
        {/* AI 어시스턴트 프로필 */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center mb-6"
        >
          <div className="relative w-24 h-24 mb-2">
            <div className="w-full h-full bg-gradient-to-r from-[#D6ECFA] to-[#FBD6E4] rounded-full flex items-center justify-center">
              <Brain className="w-12 h-12 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-green-500 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center">
              <span className="text-white text-xs">AI</span>
            </div>
          </div>
          <h2 className="text-lg font-semibold text-gray-800">AI 반려동물 어시스턴트</h2>
          <p className="text-sm text-gray-600 text-center">
            {petInfo?.name ? `${petInfo.name}의 ` : "반려견의 "}건강 상담 및 일반 정보를 제공합니다
          </p>
        </motion.div>

        {/* 탭 선택 */}
        <Tabs defaultValue="medical" value={activeTab} onValueChange={handleTabChange} className="mb-4">
          <TabsList className="w-full bg-[#FFF8F0] p-1 rounded-lg">
            <TabsTrigger
              value="medical"
              className="flex-1 rounded-md data-[state=active]:bg-white text-gray-700 data-[state=active]:text-gray-800"
            >
              <Stethoscope className="w-4 h-4 mr-2" />
              증상 상담 🩺
            </TabsTrigger>
            <TabsTrigger
              value="general"
              className="flex-1 rounded-md data-[state=active]:bg-white text-gray-700 data-[state=active]:text-gray-800"
            >
              <Search className="w-4 h-4 mr-2" />
              일반 정보 📚
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* 예시 질문 버튼 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="grid grid-cols-2 gap-2 mb-4"
        >
          {exampleQuestions[activeTab].map((question, index) => (
            <Link href={`/ai-assistant?q=${encodeURIComponent(question)}`} key={index}>
              <Button
                variant="outline"
                className="justify-start h-auto py-3 px-4 rounded-xl border-gray-300 text-gray-700 hover:bg-blue-50 text-sm w-full"
              >
                <PawPrint className="w-4 h-4 mr-2 text-blue-500" />
                {question}
              </Button>
            </Link>
          ))}
        </motion.div>

        {/* 메시지 입력 영역 */}
        <div className="mt-auto">
          <Link href="/ai-assistant">
            <div className="relative">
              <Input
                placeholder={
                  activeTab === "medical" ? "증상이나 건강 상태에 대해 질문해주세요" : "반려견 케어에 대해 질문해주세요"
                }
                className="pr-12 rounded-full border-gray-300"
                readOnly
              />
              <Button
                size="icon"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-full bg-gradient-to-r from-[#D6ECFA] to-[#FBD6E4] hover:opacity-90 text-gray-800"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
