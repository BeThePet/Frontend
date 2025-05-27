"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, AlertTriangle } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function EmergencyContent() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-beige pb-20">
      <div className="bg-pink-200 p-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/dashboard" className="text-gray-800">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-bold text-gray-800 ml-4">긴급 상황 가이드</h1>
        </div>
        <Badge variant="destructive" className="bg-red-500 text-white">
          응급 처치
        </Badge>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-5 space-y-6"
      >
        <Card className="bg-white rounded-xl shadow-sm border-2 border-red-100">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">긴급 상황 안내 🚨</h2>
                <p className="text-sm text-gray-600">응급 상황 시 즉시 가까운 동물병원을 방문하세요.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
} 