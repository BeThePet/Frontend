"use client"

import dynamic from 'next/dynamic'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { motion } from "framer-motion"

// 클라이언트 사이드에서만 로드되도록 동적 임포트
const MBTIContent = dynamic(() => import('@/components/mbti/MBTIContent'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-beige flex justify-center items-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500"></div>
    </div>
  )
})

export default function MBTIPage() {
  return <MBTIContent />
}

function MbtiCategory({ title, description }: { title: string; description: string }) {
  // 제목에 따라 이모지 선택
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
