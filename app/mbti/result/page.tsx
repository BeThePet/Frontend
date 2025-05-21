"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Share2 } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"

// MBTI 결과 데이터 - 16가지 유형별 설명
const mbtiData = {
  ENFP: {
    title: "활발한 감성 탐험가",
    description:
      "에너지가 넘치고 감정 표현이 풍부한 반려견이에요. 낯선 사람이나 장소에도 주저 없이 다가가며, 주인의 기분에도 민감하게 반응하죠.",
    training: "칭찬과 보상을 활용한 놀이 중심의 훈련이 효과적입니다.",
    toys: "지능형 장난감, 인터랙티브 토이",
    food: "고단백 사료, 다양한 간식",
    emoji: "🦮",
    color: "bg-pink-100",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/KakaoTalk_20250503_223748129.jpg-M9Qc0Caf4pnAYu3Y8r5zcxVNqvWAQY.jpeg",
  },
  ISTJ: {
    title: "조용한 질서 정착러",
    description:
      "조용하고 규칙적인 생활을 선호하는 아이예요. 새로운 환경에는 민감하게 반응하며, 익숙한 루틴 안에서 안정감을 느낍니다.",
    training: "반복적이고 루틴 기반의 훈련이 잘 맞습니다.",
    toys: "단순한 구조의 장난감, 씹을 수 있는 장난감",
    food: "일정한 시간에 동일한 사료",
    emoji: "🐕",
    color: "bg-pink-100",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/KakaoTalk_20250503_223803424.jpg-eL0uu2QQ5PkSOm9V32mGQSHYPOK3qj.jpeg",
  },
  INFP: {
    title: "감성 깊은 혼자러",
    description:
      "혼자 있는 걸 좋아하고 감정에 예민한 반려견이에요. 주인의 기분에도 민감하게 반응하고, 낯선 자극엔 쉽게 위축될 수 있어요.",
    training: "강한 명령보다는 칭찬 중심의 부드러운 훈련이 효과적입니다.",
    toys: "부드러운 촉감의 장난감, 조용한 장난감",
    food: "소화가 잘 되는 부드러운 사료",
    emoji: "🐩",
    color: "bg-pink-100",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/KakaoTalk_20250503_223727979.jpg-6DMcYWK5elyiJdLX3eyVVcUrUvK2fu.jpeg",
  },
  ENTJ: {
    title: "리더 기질의 전략가",
    description:
      "자신감 있고 추진력이 강한 아이예요. 목표 지향적이고 상황 판단이 빠르며, 주도적으로 행동하는 경향이 있어요.",
    training: "명확하고 일관된 지시가 중요하며, 도전 과제를 포함한 훈련이 효과적입니다.",
    toys: "퍼즐 장난감, 지능형 장난감",
    food: "고단백, 고에너지 사료",
    emoji: "🐺",
    color: "bg-pink-100",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/KakaoTalk_20250503_223628196.jpg-KLWpStuL1cb7p3EY8ehEds3H95aYzw.jpeg",
  },
  INFJ: {
    title: "조용한 직관가",
    description:
      "내면이 풍부하고 주인을 깊이 신뢰하는 성향이에요. 섬세한 감정 교류를 좋아하며, 낯선 환경보다는 익숙한 공간에서 안정감을 느낍니다.",
    training: "감정적 교감을 중시한 훈련이 적합하며, 서두르지 않는 접근이 필요합니다.",
    toys: "부드러운 촉감의 장난감, 조용한 장난감",
    food: "민감한 위장에 맞는 저자극 사료",
    emoji: "🐶",
    color: "bg-pink-100",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/KakaoTalk_20250503_223658769.jpg-12nMN6UBOMsvJh0vcrgIQnBQBqHBzA.jpeg",
  },
  ESFP: {
    title: "에너지 넘치는 퍼포머",
    description:
      "즐거움을 추구하고 활동적인 반려견입니다. 주인의 관심을 좋아하며, 놀이나 산책 같은 활동에 큰 만족을 느껴요.",
    training: "칭찬과 보상이 빠르게 이어지는 훈련이 효과적입니다.",
    toys: "움직이는 장난감, 소리나는 장난감",
    food: "다양한 맛과 질감의 사료와 간식",
    emoji: "🐕‍🦺",
    color: "bg-pink-100",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/KakaoTalk_20250503_223923515.jpg-OgOLEcn7wLDyM1C4g1l4CCHRAini6O.jpeg",
  },
  INTP: {
    title: "호기심 많은 관찰자",
    description:
      "분석적이고 조용히 관찰하는 성향의 아이예요. 독립성이 강하고, 새로운 장난감이나 놀이에 대한 반응이 좋습니다.",
    training: "문제 해결 중심의 놀이와 학습이 효과적입니다.",
    toys: "퍼즐 장난감, 지능형 장난감",
    food: "균형 잡힌 영양소의 사료",
    emoji: "🦝",
    color: "bg-pink-100",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/KakaoTalk_20250503_223616529.jpg-wScHryXyciHyrY9UfHIuhGYb8r6PYY.jpeg",
  },
  ESTJ: {
    title: "책임감 있는 조직가",
    description: "책임감이 강하고 계획적인 성격의 반려견입니다. 훈련이나 규칙을 잘 따르며, 명확한 기준을 좋아해요.",
    training: "명확한 지시와 일관성 있는 훈련이 적합합니다.",
    toys: "튼튼한 장난감, 씹을 수 있는 장난감",
    food: "고품질의 균형 잡힌 사료",
    emoji: "🐕",
    color: "bg-pink-100",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/KakaoTalk_20250503_223823497.jpg-bCBu1nX24KVS6nR4f2WFVA6WHaxchQ.jpeg",
  },
  ENFJ: {
    title: "따뜻한 리더형",
    description:
      "사람 중심의 따뜻한 성격으로, 보호자와의 유대감을 깊이 느끼는 반려견입니다. 감정적인 교감을 중요하게 여기며, 함께 있는 것만으로도 안정감을 얻어요.",
    training: "칭찬과 긍정적인 피드백 중심의 훈련이 효과적입니다.",
    toys: "함께 놀 수 있는 장난감, 인터랙티브 토이",
    food: "고품질 사료, 간식으로 보상",
    emoji: "🐩",
    color: "bg-pink-100",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/KakaoTalk_20250503_223738648.jpg-KuUpzwQmKbGBcYA7FOvdxHumCBxAXY.jpeg",
  },
  INTJ: {
    title: "독립적인 전략가",
    description: "독립적이고 상황 판단이 빠른 아이예요. 주인의 행동을 빠르게 이해하며, 혼자서도 잘 놉니다.",
    training: "체계적인 문제 해결 훈련이나 자율성을 키우는 놀이가 적합합니다.",
    toys: "퍼즐 장난감, 지능형 장난감",
    food: "고단백, 저탄수화물 사료",
    emoji: "🐺",
    color: "bg-pink-100",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/KakaoTalk_20250503_223605456.jpg-bmiYiSY0T084ySginMFbTuyA6Ki06i.jpeg",
  },
  ISFP: {
    title: "예민한 감각가",
    description: "감각이 예민하고 부드러운 성격의 반려견입니다. 시끄럽거나 복잡한 환경엔 스트레스를 받을 수 있어요.",
    training: "감정적 교감을 활용한 훈련이 효과적이며 강압은 피해야 해요.",
    toys: "부드러운 촉감의 장난감, 조용한 장난감",
    food: "민감한 위장에 맞는 저자극 사료",
    emoji: "🐕‍🦺",
    color: "bg-pink-100",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/KakaoTalk_20250503_223901043.jpg-4ER0ke6HrHtljkVytL4NoAOOqrQMej.jpeg",
  },
  ESFJ: {
    title: "사교적인 도우미형",
    description:
      "가족 중심의 따뜻하고 사교적인 아이입니다. 보호자뿐 아니라 주변 사람들과도 잘 어울리며, 관심과 칭찬에 크게 반응합니다.",
    training: "반복적이고 칭찬 중심의 훈련이 효과적입니다.",
    toys: "함께 놀 수 있는 장난감, 소리나는 장난감",
    food: "다양한 맛과 질감의 사료와 간식",
    emoji: "🦮",
    color: "bg-pink-100",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/KakaoTalk_20250503_223836084.jpg-tnn5UsfI0E5wDPhblamGGceezfMbjy.jpeg",
  },
  ISTP: {
    title: "분석적이고 신중한 독립자",
    description: "조용하고 분석적인 성향을 가진 반려견입니다. 독립적으로 잘 지내며, 주변 환경을 세심하게 관찰합니다.",
    training: "구조화된 환경에서 점진적 학습이 효과적입니다.",
    toys: "분해 가능한 장난감, 씹을 수 있는 장난감",
    food: "고단백, 저탄수화물 사료",
    emoji: "🐕",
    color: "bg-pink-100",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/KakaoTalk_20250503_223850460.jpg-wN3N4ZC7OUyvODbCtM45lQq3s9CVUM.jpeg",
  },
  ENTP: {
    title: "도전적인 창의가",
    description: "호기심이 많고 창의적인 반려견입니다. 다양한 활동을 좋아하고, 반복적인 일상엔 쉽게 싫증을 느낍니다.",
    training: "다양한 환경을 활용한 훈련이 효과적입니다.",
    toys: "새로운 장난감, 지능형 장난감",
    food: "다양한 종류의 사료와 간식",
    emoji: "🐩",
    color: "bg-pink-100",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/KakaoTalk_20250503_223644553.jpg-1lmnjsIlp1s6NSGcZdjjc9cw98Gf8r.jpeg",
  },
  ISFJ: {
    title: "충실한 보호자",
    description:
      "충성심이 강하고 세심한 반려견입니다. 주인과 가족을 보호하려는 성향이 강하며, 안정적인 환경을 선호합니다.",
    training: "일관된 방식의 부드러운 훈련이 효과적입니다.",
    toys: "부드러운 촉감의 장난감, 안전한 장난감",
    food: "일정한 시간에 동일한 사료",
    emoji: "🐶",
    color: "bg-pink-100",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/KakaoTalk_20250503_223812323.jpg-lEQRuM7TAscVZD7zgNgJiW5MqJ8jtc.jpeg",
  },
  ESTP: {
    title: "활동적인 모험가",
    description:
      "에너지가 넘치고 행동력이 강한 반려견입니다. 신체 활동을 좋아하며 새로운 경험에 대한 두려움이 적습니다.",
    training: "활동적인 훈련과 즉각적인 보상이 효과적입니다.",
    toys: "튼튼한 장난감, 활동적인 장난감",
    food: "고에너지 사료, 단백질 풍부한 간식",
    emoji: "🐕‍🦺",
    color: "bg-pink-100",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/KakaoTalk_20250503_223913231.jpg-OeopJziEhoApXIZqkXM6sCkUhNv2QP.jpeg",
  },
}

export default function MbtiResultPage() {
  const searchParams = useSearchParams()
  const type = searchParams.get("type") || "ENFP"

  const mbtiResult = mbtiData[type as keyof typeof mbtiData] || mbtiData.ENFP

  return (
    <div className="min-h-screen bg-pink-50 overflow-y-auto">
      <div className="bg-pink-200 p-4 flex items-center shadow-md">
        <Link href="/mbti" className="text-gray-800">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-bold text-gray-800 ml-4">MBTI 분석 결과</h1>
      </div>

      <div className="p-5 space-y-6 max-w-md mx-auto pb-20">
        {/* 결과 카드 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full"
        >
          <div className="rounded-2xl shadow-md overflow-hidden border border-pink-200 bg-white">
            <div className="p-6 text-center">
              {/* MBTI 이미지 */}
              <div className="w-32 h-32 mx-auto mb-4 relative">
                <Image
                  src={mbtiResult.image || "/placeholder.svg"}
                  alt={`${type} 강아지 캐릭터`}
                  fill
                  className="object-contain"
                />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-1">
                <span className="text-pink-500">{type}</span>
              </h2>
              <h3 className="text-xl font-semibold text-gray-700">{mbtiResult.title}</h3>
            </div>
          </div>
        </motion.div>

        {/* 결과 상세 정보 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-white p-5 rounded-2xl shadow-md border border-pink-100"
        >
          <div className="space-y-5">
            <div>
              <h3 className="text-lg font-bold text-pink-500 mb-2 flex items-center">
                <span className="mr-2">✨</span>성격 특징
              </h3>
              <p className="text-base text-gray-700 leading-relaxed">{mbtiResult.description}</p>
            </div>

            <div>
              <h3 className="text-lg font-bold text-pink-500 mb-2 flex items-center">
                <span className="mr-2">🎓</span>훈련 팁
              </h3>
              <p className="text-base text-gray-700 leading-relaxed">{mbtiResult.training}</p>
            </div>

            <div className="space-y-4">
              <div className="bg-pink-50 p-4 rounded-xl border border-pink-100">
                <h3 className="text-base font-bold text-pink-500 mb-2 flex items-center">
                  <span className="mr-2">🧸</span>추천 장난감
                </h3>
                <p className="text-sm text-gray-700">{mbtiResult.toys}</p>
              </div>
              <div className="bg-pink-50 p-4 rounded-xl border border-pink-100">
                <h3 className="text-base font-bold text-pink-500 mb-2 flex items-center">
                  <span className="mr-2">🍖</span>추천 사료
                </h3>
                <p className="text-sm text-gray-700">{mbtiResult.food}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 다른 유형 보기 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-white p-5 rounded-2xl shadow-md border border-pink-100"
        >
          <h3 className="text-lg font-bold text-pink-500 mb-3">다른 MBTI 유형 보기</h3>
          <div className="grid grid-cols-4 gap-2">
            {Object.keys(mbtiData)
              .slice(0, 8)
              .map((mbtiType) => (
                <Link key={mbtiType} href={`/mbti/result?type=${mbtiType}`}>
                  <div
                    className={`${
                      mbtiType === type ? "bg-pink-500 text-white" : "bg-white border border-pink-200"
                    } rounded-lg p-2 text-center text-sm font-medium shadow-sm`}
                  >
                    {mbtiType}
                  </div>
                </Link>
              ))}
          </div>
          <div className="grid grid-cols-4 gap-2 mt-2">
            {Object.keys(mbtiData)
              .slice(8, 16)
              .map((mbtiType) => (
                <Link key={mbtiType} href={`/mbti/result?type=${mbtiType}`}>
                  <div
                    className={`${
                      mbtiType === type ? "bg-pink-500 text-white" : "bg-white border border-pink-200"
                    } rounded-lg p-2 text-center text-sm font-medium shadow-sm`}
                  >
                    {mbtiType}
                  </div>
                </Link>
              ))}
          </div>
        </motion.div>

        {/* 공유 및 다시 테스트 버튼 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="space-y-4"
        >
          <button className="w-full h-12 rounded-full border-2 border-pink-300 bg-white text-pink-600 text-base font-bold flex items-center justify-center gap-2 shadow-md">
            <Share2 className="w-5 h-5" />
            <span>결과 공유하기</span>
          </button>

          <Link href="/mbti/test" className="block w-full">
            <button className="w-full h-12 rounded-full bg-pink-500 text-white text-base font-bold">
              다시 테스트하기
            </button>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
