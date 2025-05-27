"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Send, MapPin } from "lucide-react"

interface Analysis {
  possibleCauses: string[]
  recommendation: string
  emergency: boolean
}

interface Conversation {
  isUser: boolean
  message: string
  isAnalysis?: boolean
  analysis?: Analysis
}

export default function ConversationContent() {
  const [mounted, setMounted] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])

  useEffect(() => {
    setMounted(true)
    // 예시 대화 데이터 설정
    setConversations([
      {
        isUser: true,
        message: "우리 강아지가 기침을 해요. 어제부터 계속 기침을 하는데 걱정이 돼요.",
      },
      {
        isUser: false,
        message:
          "안녕하세요! 강아지의 기침에 대해 걱정이 되시는군요. 기침의 빈도와 강도는 어떤가요? 그리고 다른 증상(콧물, 식욕 감소, 무기력함 등)도 함께 나타나고 있나요?",
      },
      {
        isUser: true,
        message: "하루에 5-6번 정도 기침을 하고, 콧물도 조금 있어요. 식욕은 평소와 비슷해요.",
      },
      {
        isUser: false,
        message:
          "알려주셔서 감사합니다. 기침과 콧물이 함께 나타나는 것은 상부 호흡기 감염을 의심해볼 수 있어요. 강아지의 나이와 예방접종 상태는 어떻게 되나요?",
        isAnalysis: false,
      },
      {
        isUser: true,
        message: "2살이고, 예방접종은 모두 완료했어요.",
      },
      {
        isUser: false,
        message: "증상 분석 결과",
        isAnalysis: true,
        analysis: {
          possibleCauses: ["경미한 상부 호흡기 감염", "알레르기성 비염", "기관지염"],
          recommendation:
            "현재 증상은 심각해 보이지 않지만, 48시간 이상 지속된다면 수의사 진료를 권장합니다. 실내 습도를 높이고 먼지가 많은 환경은 피해주세요.",
          emergency: false,
        },
      },
    ])
  }, [])

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-[#FFF8F0] flex flex-col">
      <div className="bg-[#FBD6E4] p-4 flex items-center">
        <Link href="/chatbot" className="text-gray-800">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-bold text-gray-800 ml-4">멍멍 상담사와의 대화</h1>
      </div>

      <div className="flex-1 p-5 flex flex-col">
        {/* 대화 내용 */}
        <div className="flex-1 space-y-4 mb-4 overflow-y-auto">
          {conversations.map((conv, index) =>
            conv.isAnalysis && conv.analysis ? (
              <AnalysisMessage key={index} analysis={conv.analysis} />
            ) : (
              <ChatMessage key={index} message={conv.message} isUser={conv.isUser} />
            ),
          )}
        </div>

        {/* 채팅 입력 */}
        <div className="mt-auto">
          <div className="relative">
            <Input placeholder="질문을 입력해주세요" className="pr-12 rounded-full border-gray-300" />
            <Button
              size="icon"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-full bg-[#FBD6E4] hover:bg-[#f5c0d5]"
            >
              <Send className="w-4 h-4 text-gray-800" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ChatMessage({ message, isUser }: { message: string; isUser: boolean }) {
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-2xl p-3 ${
          isUser ? "bg-[#FBD6E4] text-gray-800" : "bg-white border border-gray-200 text-gray-700"
        }`}
      >
        <p className="text-sm">{message}</p>
      </div>
    </div>
  )
}

function AnalysisMessage({ analysis }: { analysis: Analysis }) {
  return (
    <Card className="bg-white border-[#D6ECFA] rounded-xl shadow-sm">
      <CardContent className="p-4">
        <h3 className="font-semibold text-gray-800 mb-2">증상 분석 결과</h3>

        <div className="mb-3">
          <h4 className="text-sm font-medium text-gray-700 mb-1">가능성 있는 원인:</h4>
          <ul className="text-sm text-gray-600 pl-5 list-disc">
            {analysis.possibleCauses.map((cause: string, index: number) => (
              <li key={index}>{cause}</li>
            ))}
          </ul>
        </div>

        <div className="mb-3">
          <h4 className="text-sm font-medium text-gray-700 mb-1">권장 사항:</h4>
          <p className="text-sm text-gray-600">{analysis.recommendation}</p>
        </div>

        {analysis.emergency && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start">
            <div className="text-red-600 mr-2 mt-0.5">⚠️</div>
            <div>
              <h4 className="text-sm font-medium text-red-700">긴급 안내</h4>
              <p className="text-xs text-red-600">즉시 수의사의 진료가 필요합니다.</p>
            </div>
          </div>
        )}

        <Button
          variant="outline"
          className="w-full mt-3 rounded-lg border-[#D6ECFA] text-gray-700 flex items-center justify-center gap-2"
        >
          <MapPin className="w-4 h-4" />
          <span>가까운 동물병원 찾기</span>
        </Button>
      </CardContent>
    </Card>
  )
} 