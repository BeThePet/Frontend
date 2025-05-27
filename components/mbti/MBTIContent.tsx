"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getData, saveData } from "@/lib/storage"

interface Question {
  id: number
  text: string
  options: {
    text: string
    type: string
  }[]
}

const questions: Question[] = [
  {
    id: 1,
    text: "반려견이 새로운 사람을 만났을 때 주로 보이는 반응은?",
    options: [
      { text: "적극적으로 다가가 인사하고 관심을 보인다", type: "E" },
      { text: "처음에는 조심스럽게 관찰하다가 천천히 다가간다", type: "I" },
    ],
  },
  {
    id: 2,
    text: "반려견이 새로운 장난감을 받았을 때의 모습은?",
    options: [
      { text: "즉시 가지고 놀면서 장난감의 용도를 파악한다", type: "S" },
      { text: "장난감을 이리저리 관찰하고 새로운 방식으로 가지고 논다", type: "N" },
    ],
  },
  {
    id: 3,
    text: "반려견이 다른 강아지와 문제가 생겼을 때 주로 보이는 반응은?",
    options: [
      { text: "직접적으로 감정을 표현하고 즉각 대응한다", type: "T" },
      { text: "상황을 피하거나 보호자에게 의지하려 한다", type: "F" },
    ],
  },
  {
    id: 4,
    text: "반려견의 일상적인 생활 패턴은 어떤가요?",
    options: [
      { text: "정해진 시간에 맞춰 규칙적으로 행동한다", type: "J" },
      { text: "그때그때 상황에 따라 유연하게 행동한다", type: "P" },
    ],
  },
]

const mbtiDescriptions: { [key: string]: { title: string; description: string } } = {
  ISTJ: {
    title: "신중하고 책임감 있는 보호견",
    description:
      "규칙적인 생활을 좋아하고 충실한 성격입니다. 주인에 대한 충성심이 매우 강하며, 안정적이고 신뢰할 수 있는 반려견입니다.",
  },
  ISFJ: {
    title: "다정하고 헌신적인 수호견",
    description:
      "조용하고 친근한 성격으로, 가족을 향한 깊은 애정을 가지고 있습니다. 주변 환경의 변화를 민감하게 감지하는 세심한 반려견입니다.",
  },
  INFJ: {
    title: "이해심 많은 통찰력견",
    description:
      "사려 깊고 이해심이 많은 성격입니다. 주인의 감정을 잘 읽고 공감하며, 조화로운 관계를 중요시하는 반려견입니다.",
  },
  INTJ: {
    title: "독립적인 전략가견",
    description:
      "독립적이고 분석적인 성격입니다. 영리하고 통찰력이 뛰어나며, 효율적인 방식으로 문제를 해결하는 반려견입니다.",
  },
  ISTP: {
    title: "모험을 즐기는 탐험견",
    description:
      "호기심이 많고 모험을 즐기는 성격입니다. 실용적이고 적응력이 뛰어나며, 새로운 기술을 빠르게 습득하는 반려견입니다.",
  },
  ISFP: {
    title: "예술적인 감성견",
    description:
      "온화하고 예술적 감성이 풍부한 성격입니다. 현재의 순간을 즐기며, 주변의 아름다움을 민감하게 느끼는 반려견입니다.",
  },
  INFP: {
    title: "이상적인 몽상견",
    description:
      "이상주의적이고 창의적인 성격입니다. 깊은 내면의 감정을 가지고 있으며, 주인과 특별한 유대관계를 형성하는 반려견입니다.",
  },
  INTP: {
    title: "논리적인 사색견",
    description:
      "논리적이고 창의적인 성격입니다. 복잡한 문제 해결을 즐기며, 독특한 관점으로 세상을 바라보는 반려견입니다.",
  },
  ESTP: {
    title: "활동적인 모험견",
    description:
      "활동적이고 모험을 즐기는 성격입니다. 순발력이 뛰어나고 현재의 순간을 즐기며, 새로운 경험을 추구하는 반려견입니다.",
  },
  ESFP: {
    title: "즐거운 연예견",
    description:
      "밝고 활기찬 성격으로 주변을 즐겁게 만듭니다. 사교적이고 낙천적이며, 항상 새로운 재미를 찾는 반려견입니다.",
  },
  ENFP: {
    title: "열정적인 자유견",
    description:
      "열정적이고 창의적인 성격입니다. 새로운 가능성을 발견하는 것을 좋아하며, 주변에 긍정적인 에너지를 전파하는 반려견입니다.",
  },
  ENTP: {
    title: "창의적인 혁신견",
    description:
      "창의적이고 도전적인 성격입니다. 새로운 아이디어를 탐구하기를 좋아하며, 영리하고 적응력이 뛰어난 반려견입니다.",
  },
  ESTJ: {
    title: "체계적인 관리견",
    description:
      "체계적이고 실용적인 성격입니다. 명확한 규칙과 질서를 좋아하며, 책임감이 강하고 신뢰할 수 있는 반려견입니다.",
  },
  ESFJ: {
    title: "사교적인 친선견",
    description:
      "친절하고 배려심이 많은 성격입니다. 사회성이 뛰어나고 조화를 중시하며, 가족을 행복하게 만드는 반려견입니다.",
  },
  ENFJ: {
    title: "카리스마 있는 지도견",
    description:
      "카리스마 있고 영향력 있는 성격입니다. 다른 동물들을 이끄는 능력이 있으며, 주변을 배려하고 돕는 것을 좋아하는 반려견입니다.",
  },
  ENTJ: {
    title: "결단력 있는 지휘견",
    description:
      "결단력 있고 전략적인 성격입니다. 목표 지향적이며 효율적으로 문제를 해결하는 능력이 뛰어난 반려견입니다.",
  },
}

export default function MBTIContent() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [result, setResult] = useState<string | null>(null)
  const [petInfo, setPetInfo] = useState<any>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedPetInfo = getData("petInfo")
    if (savedPetInfo) {
      setPetInfo(savedPetInfo)
    }
  }, [])

  if (!mounted) return null

  const handleAnswer = (type: string) => {
    const newAnswers = [...answers, type]
    setAnswers(newAnswers)

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      // 결과 계산
      const types = ["E/I", "S/N", "T/F", "J/P"]
      const result = types.map((type, index) => {
        const [first, second] = type.split("/")
        const firstCount = newAnswers.filter((answer, i) => i % 4 === index && answer === first).length
        const secondCount = newAnswers.filter((answer, i) => i % 4 === index && answer === second).length
        return firstCount >= secondCount ? first : second
      })
      const mbtiResult = result.join("")
      setResult(mbtiResult)

      // 결과 저장
      if (petInfo) {
        const updatedPetInfo = { ...petInfo, mbti: mbtiResult }
        saveData("petInfo", updatedPetInfo)
        setPetInfo(updatedPetInfo)
      }
    }
  }

  const handleReset = () => {
    setCurrentQuestion(0)
    setAnswers([])
    setResult(null)
  }

  return (
    <div className="min-h-screen bg-beige pb-20">
      <div className="bg-pink-200 p-4 flex items-center">
        <Link href="/dashboard" className="text-gray-800">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-bold text-gray-800 ml-4">반려견 MBTI 테스트</h1>
      </div>

      <div className="p-5">
        {!result ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="bg-white rounded-xl shadow-sm mb-6">
              <CardContent className="p-6">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-semibold text-gray-800">
                      {petInfo?.name ? `${petInfo.name}의 ` : ""}성격 유형 테스트
                    </h2>
                    <span className="text-sm text-gray-500">
                      {currentQuestion + 1} / {questions.length}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-pink-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                    />
                  </div>
                </div>

                <h3 className="text-lg font-medium text-gray-800 mb-6">{questions[currentQuestion].text}</h3>

                <div className="space-y-3">
                  {questions[currentQuestion].options.map((option, index) => (
                    <Button
                      key={index}
                      className="w-full h-auto py-4 px-6 bg-pink-50 hover:bg-pink-100 text-pink-700"
                      onClick={() => handleAnswer(option.type)}
                    >
                      {option.text}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="bg-white rounded-xl shadow-sm mb-6">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    {petInfo?.name ? `${petInfo.name}의 ` : ""}MBTI 결과
                  </h2>
                  <div className="text-3xl font-bold text-pink-500 mb-2">{result}</div>
                  <h3 className="text-xl font-semibold text-gray-700">{mbtiDescriptions[result].title}</h3>
                </div>

                <div className="bg-pink-50 rounded-lg p-4 mb-6">
                  <p className="text-gray-700 leading-relaxed">{mbtiDescriptions[result].description}</p>
                </div>

                <Button className="w-full bg-pink-500 hover:bg-pink-600" onClick={handleReset}>
                  테스트 다시하기
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
} 