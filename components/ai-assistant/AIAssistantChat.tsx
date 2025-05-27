"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { ArrowLeft, Send, Brain } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"
import { useSearchParams } from "next/navigation"
import { getData } from "@/lib/storage"

interface Message {
  role: "user" | "assistant"
  content: string
}

interface AIAssistantChatProps {
  onSendMessage?: (message: string) => Promise<void>
}

export default function AIAssistantChat({ onSendMessage }: AIAssistantChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [petInfo, setPetInfo] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const searchParams = useSearchParams()
  const [processedQuery, setProcessedQuery] = useState<string | null>(null)

  // 초기 메시지 설정
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

    // sessionStorage 초기화
    if (typeof window !== 'undefined') {
      const storedQuery = sessionStorage.getItem("processedQuery")
      setProcessedQuery(storedQuery)
    }
  }, [])

  // URL 파라미터 처리
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const q = searchParams.get("q")
    if (q && q !== processedQuery) {
      sessionStorage.setItem("processedQuery", q)
      setProcessedQuery(q)
      setTimeout(() => {
        setInput(q)
        handleSendMessage(q)
      }, 100)
    }
  }, [searchParams, processedQuery])

  // 메시지 스크롤 자동 이동
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // 메시지 전송 처리
  const handleSendMessage = async (message: string = input) => {
    if (!message.trim()) return

    // 사용자 메시지 추가
    setMessages(prev => [...prev, { role: "user", content: message }])
    setInput("")
    setIsLoading(true)

    try {
      if (onSendMessage) {
        await onSendMessage(message)
      } else {
        // 임시 응답 로직
        await new Promise(resolve => setTimeout(resolve, 1000))
        let response = ""

        // 간단한 응답 로직
        if (message.includes("기침") || message.includes("토해요") || message.includes("구토")) {
          response = `${petInfo?.name ? petInfo.name : "반려견"}의 기침이나 구토 증상이 있으시군요. 
          
          1. 일시적인 자극에 의한 것일 수 있습니다.
          2. 식이 문제로 인한 것일 수 있습니다.
          3. 호흡기 감염이나 다른 질병의 증상일 수 있습니다.
          
          증상이 24시간 이상 지속되거나 심해진다면 반드시 수의사의 진료를 받아보세요.`
        } else if (message.includes("사료") || message.includes("먹")) {
          response = `${petInfo?.name ? petInfo.name : "반려견"}의 식이 관련 질문이시군요.`
        } else {
          response = `${petInfo?.name ? petInfo.name : "반려견"}에 대한 질문 감사합니다.`
        }

        setMessages(prev => [...prev, { role: "assistant", content: response }])
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "죄송합니다. 메시지 처리 중 오류가 발생했습니다." 
      }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
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
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 입력 영역 */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSendMessage()
        }}
        className="flex items-center space-x-2 border-2 border-pink-200 rounded-full p-2 shadow-lg bg-white"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="질문을 입력하세요..."
          className="flex-1 bg-transparent focus:outline-none px-3 py-2 text-gray-800"
        />
        <Button
          type="submit"
          className="rounded-full bg-gradient-to-r from-[#D6ECFA] to-[#FBD6E4] hover:opacity-90 transition-opacity"
        >
          <Send className="w-5 h-5 text-white" />
        </Button>
      </form>
    </div>
  )
} 