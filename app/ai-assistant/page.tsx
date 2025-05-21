"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { ArrowLeft, Send, Brain } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"
import { useSearchParams } from "next/navigation"
import { getData } from "@/lib/storage"

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [petInfo, setPetInfo] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const searchParams = useSearchParams()

  // 초기 메시지 설정 부분을 두 개의 useEffect로 분리
  useEffect(() => {
    // 반려견 정보 불러오기
    const savedPetInfo = getData("petInfo")
    if (savedPetInfo) {
      setPetInfo(savedPetInfo)
    }

    // 시스템 메시지 추가
    setMessages([
      {
        role: "assistant",
        content: `안녕하세요! 반려견 건강 AI 챗봇입니다. ${
          savedPetInfo?.name ? `${savedPetInfo.name}` : "반려견"
        }에 대해 어떤 도움이 필요하신가요?`,
      },
    ])
  }, []) // 빈 의존성 배열로 컴포넌트 마운트 시 한 번만 실행

  // URL 파라미터 처리를 위한 별도의 useEffect
  useEffect(() => {
    // URL 파라미터에서 질문 가져오기
    const q = searchParams.get("q")
    if (q) {
      // 이미 처리된 질문인지 확인하기 위한 커스텀 속성 사용
      const processedQuery = sessionStorage.getItem("processedQuery")
      if (processedQuery !== q) {
        sessionStorage.setItem("processedQuery", q)
        // 약간의 지연을 두어 초기 메시지가 설정된 후 실행
        setTimeout(() => {
          setInput(q)
          handleSendMessage(q)
        }, 100)
      }
    }
  }, [searchParams]) // searchParams가 변경될 때만 실행

  // 메시지 스크롤 자동 이동
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // 메시지 전송 처리
  const handleSendMessage = (message: string = input) => {
    if (!message.trim()) return

    // 사용자 메시지 추가
    setMessages((prev) => [...prev, { role: "user", content: message }])
    setInput("")
    setIsLoading(true)

    // AI 응답 시뮬레이션 (실제로는 API 호출)
    setTimeout(() => {
      let response = ""

      // 간단한 응답 로직
      if (message.includes("기침") || message.includes("토해요") || message.includes("구토")) {
        response = `${
          petInfo?.name ? petInfo.name : "반려견"
        }의 기침이나 구토 증상이 있으시군요. 이런 증상은 여러 원인이 있을 수 있어요. 
        
        1. 일시적인 자극에 의한 것일 수 있습니다.
        2. 식이 문제로 인한 것일 수 있습니다.
        3. 호흡기 감염이나 다른 질병의 증상일 수 있습니다.
        
        증상이 24시간 이상 지속되거나 심해진다면 반드시 수의사의 진료를 받아보세요.`
      } else if (message.includes("사료") || message.includes("먹")) {
        response = `${petInfo?.name ? petInfo.name : "반려견"}의 식이 관련 질문이시군요. 
        
        반려견의 사료 선택은 나이, 크기, 활동량, 건강 상태에 따라 달라질 수 있어요. 일반적으로 양질의 단백질이 풍부하고 인공 첨가물이 적은 사료가 좋습니다.
        
        식욕이 없다면 다음을 확인해보세요:
        1. 사료의 신선도
        2. 최근 건강 상태 변화
        3. 스트레스 요인
        
        지속적인 식욕 부진은 수의사와 상담하는 것이 좋습니다.`
      } else if (message.includes("산책")) {
        response = `${petInfo?.name ? petInfo.name : "반려견"}의 산책에 대해 궁금하시군요.
        
        반려견의 크기, 나이, 품종에 따라 필요한 산책량이 다릅니다. 일반적으로:
        - 소형견: 하루 30분~1시간
        - 중형견: 하루 1~2시간
        - 대형견: 하루 2시간 이상
        
        산책은 신체적 건강뿐만 아니라 정신적 자극과 사회화에도 중요합니다. 날씨가 너무 덥거나 추울 때는 산책 시간을 조절하세요.`
      } else {
        response = `${petInfo?.name ? petInfo.name : "반려견"}에 대한 질문 감사합니다. 
        
        더 구체적인 정보가 필요하시면 증상이나 상황에 대해 자세히 알려주세요. 건강, 행동, 식이, 훈련 등 다양한 주제에 대해 도움을 드릴 수 있습니다.
        
        반려견의 건강에 심각한 문제가 있다고 판단되면 즉시 수의사의 진료를 받으시는 것이 가장 중요합니다.`
      }

      // AI 응답 추가
      setMessages((prev) => [...prev, { role: "assistant", content: response }])
      setIsLoading(false)
    }, 1500)
  }

  // 폼 제출 처리
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSendMessage()
  }

  return (
    <div className="min-h-screen bg-[#FFF8F0] flex flex-col">
      <div className="bg-gradient-to-r from-[#D6ECFA] to-[#FBD6E4] p-4 flex items-center">
        <Link href="/chatbot" className="text-gray-800">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-bold text-gray-800 ml-4">AI 챗봇</h1>
      </div>

      <div className="flex-1 flex flex-col p-4 overflow-hidden">
        {/* 메시지 영역 */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-4">
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {message.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#D6ECFA] to-[#FBD6E4] flex items-center justify-center mr-2">
                  <Brain className="w-4 h-4 text-white" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl p-3 ${
                  message.role === "user"
                    ? "bg-blue-500 text-white rounded-tr-none"
                    : "bg-white text-gray-800 rounded-tl-none"
                }`}
              >
                <p className="whitespace-pre-line text-sm">{message.content}</p>
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#D6ECFA] to-[#FBD6E4] flex items-center justify-center mr-2">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white text-gray-800 rounded-2xl rounded-tl-none p-4">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 입력 영역 */}
        <form
          onSubmit={handleSubmit}
          className="flex items-center space-x-2 border-2 border-pink-200 rounded-full p-2 shadow-lg bg-white"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="질문을 입력하세요..."
            className="flex-1 bg-transparent focus:outline-none px-3 py-2 text-gray-800"
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="icon"
            className="rounded-full bg-gradient-to-r from-[#D6ECFA] to-[#FBD6E4] hover:opacity-90 text-gray-800"
            disabled={isLoading || !input.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
