"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Calendar,
  Pill,
  Scale,
  FileText,
  BarChart,
  TrendingUp,
  TrendingDown,
  Minus,
  Info,
  Droplets,
  Bone,
  Activity,
  AlertTriangle,
  Moon,
  Thermometer,
  MapPin,
} from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getData } from "@/lib/storage"
import { WeightChart } from "@/app/report/weight-chart"
import { LinkButton } from "@/components/link-button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function ReportContent() {
  const [petInfo, setPetInfo] = useState<any>(null)
  const [healthData, setHealthData] = useState<any>(null)
  const [medications, setMedications] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState("overview")
  const [timeRange, setTimeRange] = useState("week")

  useEffect(() => {
    // 반려견 정보 불러오기
    const savedPetInfo = getData("petInfo")
    if (savedPetInfo) {
      setPetInfo(savedPetInfo)
    }

    // 건강 데이터 불러오기
    const savedHealthData = getData("healthData")
    if (savedHealthData) {
      setHealthData(savedHealthData)
    }

    // 약 정보 불러오기
    const savedMedications = getData("medications")
    if (savedMedications) {
      setMedications(savedMedications)
    }
  }, [])

  // 오늘 복용할 약 필터링
  const activeMedications = medications.filter((med) => med.isActive)

  // 시간 범위에 따른 데이터 필터링
  const getFilteredActivities = (type) => {
    if (!healthData?.activities) return []

    const now = new Date()
    const activities = healthData.activities.filter((a) => a.type === type)

    if (timeRange === "week") {
      // 최근 7일 데이터
      const weekAgo = new Date()
      weekAgo.setDate(now.getDate() - 7)
      return activities.filter((a) => new Date(a.date) >= weekAgo)
    } else if (timeRange === "month") {
      // 최근 30일 데이터
      const monthAgo = new Date()
      monthAgo.setDate(now.getDate() - 30)
      return activities.filter((a) => new Date(a.date) >= monthAgo)
    } else {
      // 전체 데이터
      return activities
    }
  }

  // 산책 통계 계산
  const walkStats = () => {
    const walks = getFilteredActivities("walk")
    if (walks.length === 0) return { count: 0, avgDistance: 0, avgDuration: 0 }

    const totalDistance = walks.reduce((sum, walk) => sum + (walk.distance || 0), 0)
    const totalDuration = walks.reduce((sum, walk) => sum + (walk.duration || 0), 0)

    return {
      count: walks.length,
      avgDistance: totalDistance / walks.length,
      avgDuration: totalDuration / walks.length,
    }
  }

  // 사료 통계 계산
  const feedStats = () => {
    const feeds = getFilteredActivities("feed")
    if (feeds.length === 0) return { count: 0, avgAmount: 0 }

    const totalAmount = feeds.reduce((sum, feed) => sum + (feed.amount || 0), 0)

    return {
      count: feeds.length,
      avgAmount: totalAmount / feeds.length,
    }
  }

  // 물 통계 계산
  const waterStats = () => {
    const waters = getFilteredActivities("water")
    if (waters.length === 0) return { count: 0, avgAmount: 0, totalAmount: 0, totalCount: 0 }

    const totalAmount = waters.reduce((sum, water) => sum + (water.amount || 0), 0)
    const totalCount = waters.reduce((sum, water) => sum + (water.count || 0), 0)

    return {
      count: waters.length,
      avgAmount: totalAmount / waters.filter((w) => w.amount > 0).length || 1,
      totalAmount: totalAmount,
      totalCount: totalCount,
    }
  }

  // 체중 통계 계산
  const weightStats = () => {
    if (!healthData?.weights || healthData.weights.length === 0) {
      return { current: 0, initial: 0, change: 0, trend: "stable" }
    }

    const weights = [...healthData.weights]
    weights.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    const current = weights[0].weight
    const initial = healthData.initialWeight || weights[weights.length - 1].weight
    const change = current - initial
    const trend = change > 0.2 ? "up" : change < -0.2 ? "down" : "stable"

    return { current, initial, change, trend }
  }

  // 건강 체크 통계
  const healthCheckStats = () => {
    const healthChecks = healthData?.healthChecks || []
    if (healthChecks.length === 0) return { count: 0, abnormalCount: 0 }

    const abnormalChecks = healthChecks.filter((check) => check.items.some((item) => item.status === "abnormal"))

    return {
      count: healthChecks.length,
      abnormalCount: abnormalChecks.length,
    }
  }

  // 주간 활동 요약
  const getWeeklySummary = () => {
    if (!healthData?.activities) return { total: 0, walk: 0, feed: 0, water: 0, health: 0 }

    const now = new Date()
    const weekAgo = new Date()
    weekAgo.setDate(now.getDate() - 7)

    const weeklyActivities = healthData.activities.filter((a) => new Date(a.date) >= weekAgo)

    return {
      total: weeklyActivities.length,
      walk: weeklyActivities.filter((a) => a.type === "walk").length,
      feed: weeklyActivities.filter((a) => a.type === "feed").length,
      water: weeklyActivities.filter((a) => a.type === "water").length,
      health: weeklyActivities.filter((a) => a.type === "health").length,
    }
  }

  const weeklySummary = getWeeklySummary()

  return (
    <div className="min-h-screen bg-pink-50 pb-20">
      <div className="bg-pink-200 p-4 flex items-center">
        <Link href="/dashboard" className="text-gray-800">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-bold text-gray-800 ml-4">건강 리포트</h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-5 space-y-6"
      >
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full bg-pink-50 p-1 rounded-lg">
            <TabsTrigger value="overview" className="flex-1">
              개요
            </TabsTrigger>
            <TabsTrigger value="activities" className="flex-1">
              활동
            </TabsTrigger>
            <TabsTrigger value="health" className="flex-1">
              건강
            </TabsTrigger>
          </TabsList>

          {/* 여기에 TabsContent 컴포넌트들을 추가하세요 */}
        </Tabs>
      </motion.div>
    </div>
  )
} 