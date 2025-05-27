"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getData, saveData } from "@/lib/storage"

const questions = [
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

export default function MBTITestContent() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [petInfo, setPetInfo] = useState<any>(null)

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

      // 결과 저장
      if (petInfo) {
        const updatedPetInfo = { ...petInfo, mbti: mbtiResult }
        saveData("petInfo", updatedPetInfo)
        setPetInfo(updatedPetInfo)
      }

      // 결과 페이지로 이동
      router.push(`/mbti/result?type=${mbtiResult}`)
    }
  }

  return (
    <div className="min-h-screen bg-beige pb-20">
      <div className="bg-pink-200 p-4 flex items-center">
        <Link href="/mbti" className="text-gray-800">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-bold text-gray-800 ml-4">반려견 MBTI 테스트</h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-5"
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
    </div>
  )
} 