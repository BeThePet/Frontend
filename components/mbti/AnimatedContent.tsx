"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { motion } from "framer-motion"

function MbtiCategory({ title, description }: { title: string; description: string }) {
  let emoji = "🧩"
  if (title.includes("외향형")) emoji = "🗣️"
  if (title.includes("감각형")) emoji = "👁️"
  if (title.includes("사고형")) emoji = "🧠"
  if (title.includes("판단형")) emoji = "⚖️"

  return (
    <div className="p-4 rounded-2xl bg-pink-100">
      <h3 className="text-base font-bold text-gray-800">
        {title} {emoji}
      </h3>
      <p className="text-sm text-gray-700 mt-1">
        {title}은(는) {description}
      </p>
    </div>
  )
}

export default function AnimatedContent() {
  return (
    <div className="min-h-screen bg-beige pb-20">
      <div className="bg-lavender-light p-6 flex items-center shadow-md rounded-b-3xl">
        <Link href="/dashboard" className="text-gray-800">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-2xl font-extrabold text-gray-800 ml-4">반려견 MBTI 분석</h1>
      </div>

      <div className="p-6 space-y-8">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-6"
        >
          <div className="relative w-48 h-48 bg-white rounded-full shadow-md flex items-center justify-center">
            <div className="text-6xl animate-float">🐶</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Card className="overflow-hidden">
            <div className="bg-gradient-warm p-4">
              <h2 className="text-xl font-extrabold text-gray-800">우리 아이의 성격 유형을 알아보세요!</h2>
            </div>
            <CardContent className="p-6">
              <p className="text-base text-gray-700 mb-6 leading-relaxed">
                20개의 질문에 답하고 반려견의 MBTI 성격 유형을 확인해보세요. 각 질문에 '매우 그렇다'부터 '전혀
                아니다'까지 5단계로 답변해주세요.
              </p>
              <Link href="/mbti/test">
                <Button className="w-full h-16 text-lg font-bold rounded-full bg-gradient-to-r from-pink-400 to-purple-400 hover:opacity-90 text-white shadow-lg transform transition-transform hover:scale-105 active:scale-95">
                  테스트 시작하기 🚀
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Card>
            <div className="bg-gradient-cool p-4">
              <h2 className="text-xl font-extrabold text-gray-800">MBTI란 무엇인가요?</h2>
            </div>
            <CardContent className="p-6">
              <p className="text-base text-gray-700 mb-5 leading-relaxed">
                MBTI(Myers-Briggs Type Indicator)는 인간의 성격 유형을 16가지로 분류하는 심리 검사입니다. 이를 반려견에
                적용하여 아이의 성격과 행동 패턴을 이해하는 데 도움을 줍니다.
              </p>
              <div className="space-y-4">
                <MbtiCategory
                  title="외향형(E) vs 내향형(I)"
                  description="다른 강아지나 사람과의 상호작용에 대한 선호도"
                />
                <MbtiCategory title="감각형(S) vs 직관형(N)" description="정보를 수집하고 처리하는 방식" />
                <MbtiCategory title="사고형(T) vs 감정형(F)" description="결정을 내리는 방식과 반응 패턴" />
                <MbtiCategory title="판단형(J) vs 인식형(P)" description="외부 세계에 대한 접근 방식과 생활 패턴" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <Card>
            <div className="bg-gradient-pastel p-4">
              <h2 className="text-xl font-extrabold text-gray-800">테스트 결과로 알 수 있는 것</h2>
            </div>
            <CardContent className="p-6">
              <ul className="space-y-3 text-base text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="text-pink-500 text-xl">•</span>
                  <span>반려견의 성격 특성과 행동 패턴 이해</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-pink-500 text-xl">•</span>
                  <span>효과적인 훈련 방법 추천</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-pink-500 text-xl">•</span>
                  <span>맞춤형 사료 및 장난감 추천</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-pink-500 text-xl">•</span>
                  <span>스트레스 요인 파악 및 관리 방법</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
} 