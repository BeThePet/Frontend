"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Heart, Activity, Stethoscope, Shield } from "lucide-react"

export default function OnboardingPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="h-screen flex flex-col items-center justify-between relative overflow-hidden bg-gradient-to-b from-pink-50 to-white">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-30">
        <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-pink-200 blur-3xl" />
        <div className="absolute bottom-10 right-10 w-72 h-72 rounded-full bg-blue-200 blur-3xl" />
      </div>

      {/* Main content */}
      <div className="w-full flex flex-col items-center justify-between h-full z-10 px-6 py-8">
        {/* Top section */}
        <div className="w-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mb-4 relative flex justify-center"
          >
            {/* Circle container for the dog logo */}
            <div className="relative w-32 h-32 rounded-full bg-white shadow-md flex items-center justify-center overflow-hidden border border-pink-100">
              <Image src="/logo.png" alt="멍멍케어 로고" width={110} height={110} className="object-contain" priority />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mb-6 text-center"
          >
            <h1 className="text-3xl font-bold mb-1 text-gray-800 tracking-tight">멍멍케어</h1>
            <div className="flex items-center justify-center gap-1 mb-2">
              <span className="h-1 w-8 bg-pink-300 rounded-full"></span>
              <span className="text-sm text-pink-500 font-medium">반려견 건강 관리 플랫폼</span>
              <span className="h-1 w-8 bg-pink-300 rounded-full"></span>
            </div>
            <p className="text-sm text-gray-700 max-w-xs mx-auto tracking-normal">
              우리 아이의 건강을 체계적으로
              <br />
              관리하는 스마트 헬스케어
            </p>
          </motion.div>
        </div>

        {/* Middle section with feature cards and buttons */}
        <div className="w-full">
          {/* Health monitoring features highlight */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="grid grid-cols-2 gap-2 mb-6 max-w-xs w-full mx-auto"
          >
            <div className="bg-white rounded-xl p-3 shadow-sm border border-pink-100 flex flex-col items-center">
              <Heart size={18} className="text-pink-400 mb-1" />
              <span className="text-xs font-medium text-gray-700">건강 모니터링</span>
            </div>
            <div className="bg-white rounded-xl p-3 shadow-sm border border-blue-100 flex flex-col items-center">
              <Activity size={18} className="text-blue-400 mb-1" />
              <span className="text-xs font-medium text-gray-700">활동 기록</span>
            </div>
            <div className="bg-white rounded-xl p-3 shadow-sm border border-purple-100 flex flex-col items-center">
              <Stethoscope size={18} className="text-purple-400 mb-1" />
              <span className="text-xs font-medium text-gray-700">의료 관리</span>
            </div>
            <div className="bg-white rounded-xl p-3 shadow-sm border border-green-100 flex flex-col items-center">
              <Shield size={18} className="text-green-400 mb-1" />
              <span className="text-xs font-medium text-gray-700">예방 케어</span>
            </div>
          </motion.div>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex flex-col w-full max-w-xs gap-3 mx-auto"
          >
            <Link href="/dashboard" className="w-full">
              <button className="w-full h-11 rounded-full bg-pink-400 text-white text-base font-bold shadow-md hover:bg-pink-500 active:scale-98 transition-all duration-300">
                건강 관리 시작하기
              </button>
            </Link>

            <Link href="/login" className="w-full">
              <button className="w-full h-11 rounded-full bg-white border-2 border-pink-200 text-pink-500 text-base font-bold shadow-sm hover:bg-pink-50 active:scale-98 transition-all duration-300">
                로그인
              </button>
            </Link>
          </motion.div>
        </div>

        {/* Bottom section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="text-center w-full py-3"
        >
          <p className="text-gray-600 text-xs font-medium">체계적인 건강 관리로 반려견의 행복한 삶을 지켜주세요</p>
        </motion.div>
      </div>
    </div>
  )
}
