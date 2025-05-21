"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

// MBTI 질문 데이터
const questions = [
  {
    category: "E/I",
    questions: [
      "낯선 사람에게 먼저 다가간다.",
      "집에 손님이 오면 반가워서 흥분한다.",
      "산책 중 다른 강아지를 보면 반응한다.",
      "외출을 자주 하고 싶어한다.",
      "주인이 없을 때 외로움을 많이 느낀다.",
    ],
  },
  {
    category: "S/N",
    questions: [
      "낯선 장소에서 긴장하거나 행동이 느려진다.",
      "기존에 사용하던 장난감을 고집한다.",
      "규칙적으로 산책하던 루트가 아니면 혼란스러워한다.",
      "시끄러운 환경에서 빠르게 반응한다.",
      "새로운 상황에서도 빠르게 적응한다.",
    ],
  },
  {
    category: "T/F",
    questions: [
      "보호자의 표정이나 말투에 따라 행동이 달라진다.",
      "'앉아', '기다려' 등 명령어에 정확히 반응한다.",
      "다른 강아지가 혼나는 걸 보면 불안해한다.",
      "칭찬받았을 때 행동이 눈에 띄게 좋아진다.",
      "논리적인 훈련보다 감정 표현에 더 반응한다.",
    ],
  },
  {
    category: "J/P",
    questions: [
      "매일 정해진 시간에 식사를 원한다.",
      "사료를 잘못 주면 예민하게 반응한다.",
      "산책 루트가 바뀌면 스트레스를 느낀다.",
      "스스로 새로운 놀이를 만들어 낸다.",
      "집안의 새로운 환경에 쉽게 적응한다.",
    ],
  },
]

export default function MbtiTestPage() {
  const router = useRouter()
  const [currentCategory, setCurrentCategory] = useState(0)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number[]>>({
    "E/I": Array(5).fill(3), // 기본값 3 (보통이다)
    "S/N": Array(5).fill(3),
    "T/F": Array(5).fill(3),
    "J/P": Array(5).fill(3),
  })

  const currentCategoryData = questions[currentCategory]
  const questionText = currentCategoryData.questions[currentQuestion]
  const progress = ((currentCategory * 5 + currentQuestion + 1) / 20) * 100

  const handleAnswer = (score: number) => {
    const category = currentCategoryData.category
    const newAnswers = { ...answers }
    newAnswers[category][currentQuestion] = score
    setAnswers(newAnswers)

    // 다음 질문으로 이동
    if (currentQuestion < 4) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      // 다음 카테고리로 이동
      if (currentCategory < 3) {
        setCurrentCategory(currentCategory + 1)
        setCurrentQuestion(0)
      } else {
        // 테스트 완료, 결과 페이지로 이동
        const result = calculateMbti(answers)
        router.push(`/mbti/result?type=${result}`)
      }
    }
  }

  const calculateMbti = (answers: Record<string, number[]>) => {
    // E/I 계산 (높은 점수가 E 성향)
    const eScore = answers["E/I"].reduce((sum, score) => sum + score, 0)
    const firstLetter = eScore > 15 ? "E" : "I" // 중간값 15 (5문항 × 3점)

    // S/N 계산 (높은 점수가 S 성향)
    const sScore = answers["S/N"].reduce((sum, score) => sum + score, 0)
    const secondLetter = sScore > 15 ? "S" : "N"

    // T/F 계산 (높은 점수가 F 성향)
    const fScore = answers["T/F"].reduce((sum, score) => sum + score, 0)
    const thirdLetter = fScore > 15 ? "F" : "T"

    // J/P 계산 (높은 점수가 J 성향)
    const jScore = answers["J/P"].reduce((sum, score) => sum + score, 0)
    const fourthLetter = jScore > 15 ? "J" : "P"

    return `${firstLetter}${secondLetter}${thirdLetter}${fourthLetter}`
  }

  return (
    <div className="min-h-screen bg-[#FFE4E1]">
      <div className="bg-white p-6 flex items-center shadow-md rounded-b-3xl">
        <Link href="/mbti" className="text-gray-800">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-2xl font-extrabold text-gray-800 ml-4">반려견 MBTI 테스트</h1>
      </div>

      <div className="p-6 space-y-6">
        {/* 진행 상황 */}
        <div className="space-y-2">
          <div className="w-full bg-white rounded-full h-3 shadow-inner overflow-hidden">
            <div
              className="bg-gradient-to-r from-pink-300 to-pink-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm font-bold text-gray-700 text-right">{currentCategory * 5 + currentQuestion + 1}/20</p>
        </div>

        {/* 질문 카드 */}
        <motion.div
          key={`${currentCategory}-${currentQuestion}`}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="shadow-app">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-8 text-center leading-relaxed">{questionText}</h2>

              <div className="flex flex-col gap-4">
                <Button
                  onClick={() => handleAnswer(5)}
                  className="w-full py-4 rounded-2xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-lg"
                >
                  매우 그렇다
                </Button>
                <Button
                  onClick={() => handleAnswer(4)}
                  className="w-full py-4 rounded-2xl bg-pink-400 hover:bg-pink-500 text-white font-bold text-lg"
                >
                  그렇다
                </Button>
                <Button
                  onClick={() => handleAnswer(3)}
                  className="w-full py-4 rounded-2xl bg-pink-300 hover:bg-pink-400 text-white font-bold text-lg"
                >
                  보통이다
                </Button>
                <Button
                  onClick={() => handleAnswer(2)}
                  className="w-full py-4 rounded-2xl bg-pink-200 hover:bg-pink-300 text-gray-700 font-bold text-lg"
                >
                  아니다
                </Button>
                <Button
                  onClick={() => handleAnswer(1)}
                  className="w-full py-4 rounded-2xl bg-pink-100 hover:bg-pink-200 text-gray-700 font-bold text-lg"
                >
                  전혀 아니다
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
