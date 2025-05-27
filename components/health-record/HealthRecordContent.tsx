"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Calendar, FileText, Scale, Activity, Heart } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getData, saveData } from "@/lib/storage"
import { useToast } from "@/hooks/use-toast"

export default function HealthRecordContent() {
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState("daily")
  const { toast } = useToast()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-beige flex justify-center items-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-beige pb-20">
      {/* 헤더 */}
      <div className="bg-blue-light p-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-gray-800">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-lg font-bold text-gray-800">건강 기록</h1>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-5 space-y-6"
      >
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full bg-white rounded-lg p-1">
            <TabsTrigger value="daily" className="flex-1">
              일일 체크
            </TabsTrigger>
            <TabsTrigger value="weight" className="flex-1">
              체중 기록
            </TabsTrigger>
            <TabsTrigger value="history" className="flex-1">
              기록 내역
            </TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>오늘의 건강 체크</CardTitle>
              </CardHeader>
              <CardContent>
                {/* 일일 건강 체크 폼 구현 예정 */}
                <p>일일 건강 체크 내용이 들어갈 예정입니다.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="weight" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>체중 기록</CardTitle>
              </CardHeader>
              <CardContent>
                {/* 체중 기록 폼 구현 예정 */}
                <p>체중 기록 내용이 들어갈 예정입니다.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>기록 내역</CardTitle>
              </CardHeader>
              <CardContent>
                {/* 기록 내역 목록 구현 예정 */}
                <p>기록 내역 목록이 들어갈 예정입니다.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
} 