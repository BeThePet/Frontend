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
import { WeightChart } from "./weight-chart"
import { LinkButton } from "@/components/link-button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function ReportPage() {
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
            <TabsTrigger
              value="overview"
              className="flex-1 rounded-md data-[state=active]:bg-white text-gray-700 data-[state=active]:text-gray-800"
            >
              개요
            </TabsTrigger>
            <TabsTrigger
              value="statistics"
              className="flex-1 rounded-md data-[state=active]:bg-white text-gray-700 data-[state=active]:text-gray-800"
            >
              통계
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4 space-y-6">
            {/* 주간 활동 요약 */}
            <Card className="bg-white rounded-xl shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  주간 활동 요약
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>최근 7일간의 활동 기록입니다</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm text-gray-500">총 활동 기록</div>
                  <div className="text-xl font-bold text-gray-800">{weeklySummary.total}회</div>
                </div>
                <div className="bg-gray-100 h-2 rounded-full w-full mb-4">
                  <div
                    className="bg-gradient-to-r from-pink-400 to-pink-500 h-2 rounded-full"
                    style={{ width: `${weeklySummary.total > 0 ? 100 : 0}%` }}
                  ></div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <div className="bg-blue-50 p-2 rounded-lg text-center">
                    <div className="text-xs text-gray-600">산책</div>
                    <div className="text-lg font-bold text-blue-600">{weeklySummary.walk}회</div>
                  </div>
                  <div className="bg-amber-50 p-2 rounded-lg text-center">
                    <div className="text-xs text-gray-600">사료</div>
                    <div className="text-lg font-bold text-amber-600">{weeklySummary.feed}회</div>
                  </div>
                  <div className="bg-purple-50 p-2 rounded-lg text-center">
                    <div className="text-xs text-gray-600">물</div>
                    <div className="text-lg font-bold text-purple-600">{weeklySummary.water}회</div>
                  </div>
                  <div className="bg-green-50 p-2 rounded-lg text-center">
                    <div className="text-xs text-gray-600">건강체크</div>
                    <div className="text-lg font-bold text-green-600">{weeklySummary.health}회</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 건강 인사이트 */}
            <Card className="bg-white rounded-xl shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  건강 인사이트
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>건강 체크 데이터를 기반으로 한 분석입니다</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 px-0">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="insights" className="border-0">
                    <AccordionTrigger className="py-2 px-6 hover:no-underline">
                      <span className="text-sm text-gray-500">클릭하여 건강 인사이트 보기</span>
                    </AccordionTrigger>
                    <AccordionContent className="px-6">
                      <HealthInsights healthData={healthData} />
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

            {/* 건강 관리 메뉴 */}
            <Card className="bg-white rounded-xl shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-gray-800">건강 관리</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-3">
                  <Link href="/health-record?tab=health&today=true">
                    <Button className="w-full h-20 rounded-xl bg-pink-100 hover:bg-pink-200 text-pink-700 flex flex-col items-center justify-center">
                      <Calendar className="w-5 h-5 mb-1" />
                      <span className="text-sm">건강 체크</span>
                    </Button>
                  </Link>
                  <Link href="/report/medication">
                    <Button className="w-full h-20 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-700 flex flex-col items-center justify-center">
                      <Pill className="w-5 h-5 mb-1" />
                      <span className="text-sm">약 복용 관리</span>
                    </Button>
                  </Link>
                  <Link href="/report/vaccine">
                    <Button className="w-full h-20 rounded-xl bg-green-100 hover:bg-green-200 text-green-700 flex flex-col items-center justify-center">
                      <FileText className="w-5 h-5 mb-1" />
                      <span className="text-sm">예방접종 기록</span>
                    </Button>
                  </Link>
                  <Link href="/health-record?tab=weight">
                    <Button className="w-full h-20 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-700 flex flex-col items-center justify-center">
                      <Scale className="w-5 h-5 mb-1" />
                      <span className="text-sm">체중 기록</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* 약 복용 알림 */}
            {activeMedications.length > 0 && (
              <Card className="bg-white rounded-xl shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg font-semibold text-gray-800">약 복용 알림</CardTitle>
                    <LinkButton href="/report/medication" variant="outline" size="sm">
                      모두 보기
                    </LinkButton>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {activeMedications.slice(0, 2).map((med) => (
                      <div key={med.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Pill className="h-5 w-5 text-pink-500" />
                          <div>
                            <div className="font-medium">{med.name}</div>
                            <div className="text-sm text-gray-600">{med.dosage}</div>
                          </div>
                        </div>
                        <span className="text-sm font-medium">{med.time}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 체중 차트 */}
            {healthData?.weights && healthData.weights.length > 0 && (
              <Card className="bg-white rounded-xl shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg font-semibold text-gray-800">체중 변화</CardTitle>
                    <div className="flex items-center gap-2">
                      {weightStats().trend === "up" ? (
                        <TrendingUp className="w-4 h-4 text-red-500" />
                      ) : weightStats().trend === "down" ? (
                        <TrendingDown className="w-4 h-4 text-blue-500" />
                      ) : (
                        <Minus className="w-4 h-4 text-gray-500" />
                      )}
                      <span
                        className={`text-sm font-medium ${
                          weightStats().trend === "up"
                            ? "text-red-500"
                            : weightStats().trend === "down"
                              ? "text-blue-500"
                              : "text-gray-500"
                        }`}
                      >
                        {weightStats().change > 0 ? "+" : ""}
                        {weightStats().change.toFixed(1)}kg
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="h-64">
                    <WeightChart weights={healthData.weights} />
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="statistics" className="mt-4 space-y-6">
            {/* 시간 범위 선택 */}
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">상세 통계</h2>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="기간 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">최근 7일</SelectItem>
                  <SelectItem value="month">최근 30일</SelectItem>
                  <SelectItem value="all">전체 기간</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 산책 통계 */}
            <Card className="bg-white rounded-xl shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <BarChart className="w-5 h-5 text-blue-500" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-800">산책 통계</h3>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-blue-50 p-3 rounded-lg text-center">
                    <div className="text-xs text-gray-600">총 산책 횟수</div>
                    <div className="text-lg font-bold text-gray-800">{walkStats().count}회</div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg text-center">
                    <div className="text-xs text-gray-600">평균 거리</div>
                    <div className="text-lg font-bold text-gray-800">{walkStats().avgDistance.toFixed(1)}km</div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg text-center">
                    <div className="text-xs text-gray-600">평균 시간</div>
                    <div className="text-lg font-bold text-gray-800">{Math.round(walkStats().avgDuration)}분</div>
                  </div>
                </div>

                <div className="mt-4 text-sm text-gray-500 text-center">
                  {timeRange === "week" ? "최근 7일" : timeRange === "month" ? "최근 30일" : "전체 기간"} 동안의 산책
                  통계입니다.
                </div>
              </CardContent>
            </Card>

            {/* 물 섭취 통계 */}
            <Card className="bg-white rounded-xl shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Droplets className="w-5 h-5 text-purple-500" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-800">물 섭취 통계</h3>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-purple-50 p-3 rounded-lg text-center">
                    <div className="text-xs text-gray-600">총 물 섭취 횟수</div>
                    <div className="text-lg font-bold text-gray-800">{waterStats().totalCount}회</div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg text-center">
                    <div className="text-xs text-gray-600">총 물 섭취량</div>
                    <div className="text-lg font-bold text-gray-800">{waterStats().totalAmount}ml</div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg text-center">
                    <div className="text-xs text-gray-600">평균 섭취량</div>
                    <div className="text-lg font-bold text-gray-800">{Math.round(waterStats().avgAmount)}ml</div>
                  </div>
                </div>

                <div className="mt-4 text-sm text-gray-500 text-center">
                  {timeRange === "week" ? "최근 7일" : timeRange === "month" ? "최근 30일" : "전체 기간"} 동안의 물 섭취
                  통계입니다.
                </div>
              </CardContent>
            </Card>

            {/* 사료 통계 */}
            <Card className="bg-white rounded-xl shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                    <BarChart className="w-5 h-5 text-amber-500" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-800">사료 통계</h3>
                </div>

                <div className="bg-amber-50 p-3 rounded-lg mb-3">
                  <div className="text-xs text-gray-600">사료 급여 횟수</div>
                  <div className="text-lg font-bold text-gray-800">{feedStats().count}회</div>
                  <div className="text-xs text-gray-500 mt-1">평균 {feedStats().avgAmount.toFixed(0)}g/회</div>
                </div>

                <div className="mt-4 text-sm text-gray-500 text-center">
                  {timeRange === "week" ? "최근 7일" : timeRange === "month" ? "최근 30일" : "전체 기간"} 동안의 급여
                  통계입니다.
                </div>
              </CardContent>
            </Card>

            {/* 체중 통계 */}
            <Card className="bg-white rounded-xl shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Scale className="w-5 h-5 text-green-500" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-800">체중 통계</h3>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-green-50 p-3 rounded-lg text-center">
                    <div className="text-xs text-gray-600">현재 체중</div>
                    <div className="text-lg font-bold text-gray-800">{weightStats().current.toFixed(1)}kg</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg text-center">
                    <div className="text-xs text-gray-600">초기 체중</div>
                    <div className="text-lg font-bold text-gray-800">{weightStats().initial.toFixed(1)}kg</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg text-center">
                    <div className="text-xs text-gray-600">변화량</div>
                    <div
                      className={`text-lg font-bold ${
                        weightStats().trend === "up"
                          ? "text-red-500"
                          : weightStats().trend === "down"
                            ? "text-blue-500"
                            : "text-gray-800"
                      }`}
                    >
                      {weightStats().change > 0 ? "+" : ""}
                      {weightStats().change.toFixed(1)}kg
                    </div>
                  </div>
                </div>

                {healthData?.weights && healthData.weights.length > 0 && (
                  <div className="h-48 mt-4">
                    <WeightChart weights={healthData.weights} />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 건강 체크 통계 */}
            <Card className="bg-white rounded-xl shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-pink-500" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-800">건강 체크 통계</h3>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-pink-50 p-3 rounded-lg text-center">
                    <div className="text-xs text-gray-600">총 체크 횟수</div>
                    <div className="text-lg font-bold text-gray-800">{healthCheckStats().count}회</div>
                  </div>
                  <div className="bg-pink-50 p-3 rounded-lg text-center">
                    <div className="text-xs text-gray-600">이상 발견 횟수</div>
                    <div className="text-lg font-bold text-gray-800">{healthCheckStats().abnormalCount}회</div>
                    <div className="text-xs text-gray-500 mt-1">
                      (
                      {healthCheckStats().count > 0
                        ? Math.round((healthCheckStats().abnormalCount / healthCheckStats().count) * 100)
                        : 0}
                      %)
                    </div>
                  </div>
                </div>

                <div className="mt-4 text-sm text-center">
                  <Link href="/health-record?tab=health">
                    <Button variant="outline" size="sm">
                      건강 체크 바로가기
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}

// HealthInsights 컴포넌트를 완전히 교체합니다
/**
 * 건강 인사이트 컴포넌트
 * 건강 체크 데이터를 분석하여 인사이트를 제공합니다.
 */
function HealthInsights({ healthData }) {
  if (!healthData) {
    return (
      <div className="text-center py-6 text-gray-500">
        <p>아직 건강 데이터가 없습니다.</p>
        <p className="text-sm mt-1">건강 체크와 활동을 기록하면 맞춤형 인사이트를 확인할 수 있습니다.</p>
        <Link href="/health-record?tab=health" className="mt-3 inline-block">
          <Button variant="outline" size="sm">
            건강 체크하기
          </Button>
        </Link>
      </div>
    )
  }

  // 최근 7일간의 데이터 분석
  const now = new Date()
  const weekAgo = new Date()
  weekAgo.setDate(now.getDate() - 7)

  // 건강 체크 데이터 필터링 (최근 7일)
  const recentChecks = (healthData.healthChecks || []).filter((check) => {
    const checkDate = new Date(check.date.replace(/\./g, "-"))
    return checkDate >= weekAgo
  })

  // 활동 데이터 필터링 (최근 7일)
  const recentActivities = (healthData.activities || []).filter((activity) => {
    const activityDate = new Date(activity.date.replace(/\./g, "-"))
    return activityDate >= weekAgo
  })

  // 산책 데이터
  const walkActivities = recentActivities.filter((a) => a.type === "walk")
  const walkCount = walkActivities.length
  const walkDistance = walkActivities.reduce((sum, a) => sum + (a.distance || 0), 0)
  const walkDuration = walkActivities.reduce((sum, a) => sum + (a.duration || 0), 0)

  // 사료 데이터
  const feedActivities = recentActivities.filter((a) => a.type === "feed")
  const feedCount = feedActivities.length
  const feedAmount = feedActivities.reduce((sum, a) => sum + (a.amount || 0), 0)

  // 물 섭취 데이터
  const waterActivities = recentActivities.filter((a) => a.type === "water")
  const waterCount = waterActivities.reduce((sum, a) => sum + (a.count || 0), 0)
  const waterAmount = waterActivities.reduce((sum, a) => sum + (a.amount || 0), 0)

  // 체중 데이터
  const weightActivities = recentActivities.filter((a) => a.type === "weight")
  const currentWeight = healthData.weight || 0
  const weightChange =
    healthData.weights && healthData.weights.length > 1
      ? currentWeight - healthData.weights[healthData.weights.length - 2].weight
      : 0

  // 건강 체크 항목별 데이터 분석
  const appetiteData = analyzeHealthCheckItem(recentChecks, "appetite")
  const energyData = analyzeHealthCheckItem(recentChecks, "energy")
  const stoolData = analyzeHealthCheckItem(recentChecks, "stool")
  const sleepData = analyzeHealthCheckItem(recentChecks, "sleep")
  const temperatureData = analyzeHealthCheckItem(recentChecks, "temperature")

  // 반려견 정보 가져오기
  const petInfo = getData("petInfo") || {}

  // 종합 건강 점수 계산 (100점 만점)
  const healthScoreResult = calculateComprehensiveHealthScore({
    appetite: appetiteData,
    energy: energyData,
    stool: stoolData,
    sleep: sleepData,
    temperature: temperatureData,
    walkCount,
    walkDistance,
    feedCount,
    waterCount,
    waterAmount,
    petInfo,
  })

  const healthScore = healthScoreResult.score
  const scoreDeductions = healthScoreResult.deductions

  // 종합 건강 인사이트 생성
  const healthInsight = generateComprehensiveInsight({
    appetite: appetiteData,
    energy: energyData,
    stool: stoolData,
    sleep: sleepData,
    temperature: temperatureData,
    walkCount,
    walkDistance,
    walkDuration,
    feedCount,
    feedAmount,
    waterCount,
    waterAmount,
    currentWeight,
    weightChange,
    petInfo,
  })

  return (
    <div className="space-y-4">
      {/* 건강 점수 */}
      <div className="flex justify-between items-center mb-2">
        <div className="text-sm text-gray-600">종합 건강 점수</div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <div className="text-xl font-bold text-gray-800 flex items-center gap-1">
                {healthScore}/100
                <Info className="h-4 w-4 text-gray-400" />
              </div>
            </TooltipTrigger>
            <TooltipContent className="w-64">
              <p className="text-sm font-medium mb-1">점수 산정 내역:</p>
              <ul className="text-xs space-y-1">
                {scoreDeductions.length > 0 ? (
                  scoreDeductions.map((item, index) => <li key={index}>{item}</li>)
                ) : (
                  <li>감점 요소가 없습니다.</li>
                )}
              </ul>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="bg-gray-100 h-2 rounded-full w-full mb-4">
        <div
          className={`h-2 rounded-full ${
            healthScore >= 80 ? "bg-green-500" : healthScore >= 60 ? "bg-yellow-500" : "bg-red-500"
          }`}
          style={{ width: `${healthScore}%` }}
        ></div>
      </div>

      {/* 종합 건강 인사이트 */}
      <Card className="bg-gray-50 border-none">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
              <Activity className="w-5 h-5 text-pink-500" />
            </div>
            <h3 className="text-base font-semibold text-gray-800">주간 건강 인사이트</h3>
          </div>
          <div className="text-sm text-gray-700 space-y-2">
            {healthInsight.map((insight, index) => (
              <p key={index}>{insight}</p>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 주간 활동 요약 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-gray-700">산책</span>
          </div>
          <div className="text-lg font-bold text-gray-800">{walkCount}회</div>
          <div className="text-xs text-gray-500">
            총 {walkDistance.toFixed(1)}km ({walkDuration}분)
          </div>
        </div>

        <div className="bg-amber-50 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Bone className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-medium text-gray-700">사료</span>
          </div>
          <div className="text-lg font-bold text-gray-800">{feedCount}회</div>
          <div className="text-xs text-gray-500">총 {feedAmount}g</div>
        </div>

        <div className="bg-purple-50 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Droplets className="w-4 h-4 text-purple-500" />
            <span className="text-sm font-medium text-gray-700">물</span>
          </div>
          <div className="text-lg font-bold text-gray-800">{waterCount}회</div>
          <div className="text-xs text-gray-500">총 {waterAmount}ml</div>
        </div>

        <div className="bg-green-50 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Scale className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-gray-700">체중</span>
          </div>
          <div className="text-lg font-bold text-gray-800">{currentWeight}kg</div>
          <div className="text-xs text-gray-500">
            {weightChange > 0
              ? `+${weightChange.toFixed(1)}kg`
              : weightChange < 0
                ? `${weightChange.toFixed(1)}kg`
                : "변화 없음"}
          </div>
        </div>
      </div>

      {/* 건강 체크 요약 */}
      <div className="mt-2">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-700">건강 체크 요약</h3>
          <Badge variant="outline" className="bg-white">
            최근 7일
          </Badge>
        </div>

        <div className="space-y-2">
          {appetiteData && (
            <HealthCheckSummaryItem
              title="식욕"
              icon={<Bone className="h-4 w-4" />}
              iconColor="text-amber-500"
              status={appetiteData.status}
              count={appetiteData.count}
              explanation={appetiteData.explanation}
            />
          )}

          {energyData && (
            <HealthCheckSummaryItem
              title="활력"
              icon={<Activity className="h-4 w-4" />}
              iconColor="text-blue-500"
              status={energyData.status}
              count={energyData.count}
              explanation={energyData.explanation}
            />
          )}

          {stoolData && (
            <HealthCheckSummaryItem
              title="배변 상태"
              icon={<AlertTriangle className="h-4 w-4" />}
              iconColor="text-orange-500"
              status={stoolData.status}
              count={stoolData.count}
              explanation={stoolData.explanation}
            />
          )}

          {sleepData && (
            <HealthCheckSummaryItem
              title="수면"
              icon={<Moon className="h-4 w-4" />}
              iconColor="text-indigo-500"
              status={sleepData.status}
              count={sleepData.count}
              average={sleepData.average}
              unit={sleepData.unit}
              explanation={sleepData.explanation}
            />
          )}

          {temperatureData && (
            <HealthCheckSummaryItem
              title="체온"
              icon={<Thermometer className="h-4 w-4" />}
              iconColor="text-red-500"
              status={temperatureData.status}
              count={temperatureData.count}
              average={temperatureData.average}
              unit={temperatureData.unit}
              explanation={temperatureData.explanation}
            />
          )}
        </div>
      </div>
    </div>
  )
}

// 건강 체크 요약 항목 컴포넌트를 개선합니다
function HealthCheckSummaryItem({ title, icon, iconColor, status, count, average, unit, explanation }) {
  return (
    <div className="flex items-center justify-between p-2 bg-white rounded-lg border">
      <div className="flex items-center gap-2">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center bg-${iconColor.split("-")[0]}-100`}>
          <span className={iconColor}>{icon}</span>
        </div>
        <span className="text-sm">{title}</span>
      </div>
      <div className="flex items-center gap-2">
        {average !== undefined && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <span className="text-xs text-gray-500">
                  평균 {average}
                  {unit || ""}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">{explanation}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {!average && explanation && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-3 w-3 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">{explanation}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        <Badge
          variant="outline"
          className={`
            ${
              status === "good"
                ? "bg-green-100 text-green-800 border-green-200"
                : status === "warning"
                  ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                  : "bg-red-100 text-red-800 border-red-200"
            }
          `}
        >
          {status === "good" ? "양호" : status === "warning" ? "주의" : "경고"}
        </Badge>
      </div>
    </div>
  )
}

/**
 * 건강 체크 항목 분석 함수
 */
function analyzeHealthCheckItem(checks, itemId) {
  if (!checks || checks.length === 0) return null

  const itemChecks = checks.filter((check) => check.items && check.items.some((item) => item.id === itemId))

  if (itemChecks.length === 0) return null

  const items = itemChecks.map((check) => check.items.find((item) => item.id === itemId)).filter(Boolean)

  // 기본 데이터
  const result = {
    count: items.length,
    status: "good", // 기본값은 양호
    explanation: "", // 상태 설명 추가
  }

  // 수치형 데이터 (수면, 체온)
  if (itemId === "sleep" || itemId === "temperature") {
    const values = items.map((item) => Number.parseFloat(item.value)).filter((v) => !isNaN(v))

    if (values.length > 0) {
      const sum = values.reduce((a, b) => a + b, 0)
      const average = sum / values.length

      result.values = values
      result.average = average.toFixed(1)
      result.unit = itemId === "sleep" ? "시간" : "°C"

      // 상태 평가
      if (itemId === "sleep") {
        if (average < 6) {
          result.status = "warning"
          result.explanation = "수면 시간이 6시간 미만으로 다소 부족합니다."
        }
        if (average < 4) {
          result.status = "alert"
          result.explanation = "수면 시간이 4시간 미만으로 매우 부족합니다."
        } else {
          result.explanation = "수면 시간이 적정 수준입니다."
        }
      } else if (itemId === "temperature") {
        if (average > 39.2 || average < 37.5) {
          result.status = "warning"
          result.explanation = "체온이 정상 범위(37.5-39.2°C)를 벗어났습니다."
        }
        if (average > 40 || average < 37) {
          result.status = "alert"
          result.explanation = "체온이 위험 수준으로 정상 범위를 크게 벗어났습니다."
        } else {
          result.explanation = "체온이 정상 범위 내에 있습니다."
        }
      }
    }
  }
  // 상태형 데이터 (식욕, 활력, 배변)
  else {
    const normalCount = items.filter((item) => item.status === "normal").length
    const abnormalCount = items.length - normalCount
    const abnormalRatio = abnormalCount / items.length

    result.normalCount = normalCount
    result.abnormalCount = abnormalCount
    result.abnormalRatio = (abnormalRatio * 100).toFixed(0) + "%"

    // 상태 평가 (비정상이 30% 이상이면 주의, 50% 이상이면 경고)
    if (abnormalRatio >= 0.3 && abnormalRatio < 0.5) {
      result.status = "warning"
      result.explanation = `비정상 상태가 ${result.abnormalRatio}로 주의가 필요합니다.`
    } else if (abnormalRatio >= 0.5) {
      result.status = "alert"
      result.explanation = `비정상 상태가 ${result.abnormalRatio}로 경고 수준입니다.`
    } else {
      result.explanation = "대체로 정상 상태를 유지하고 있습니다."
    }

    // 항목별 특수 데이터
    if (itemId === "appetite") {
      const lessCount = items.filter((item) => item.value === "less").length
      const noneCount = items.filter((item) => item.value === "none").length
      result.lessCount = lessCount
      result.noneCount = noneCount

      if (noneCount > 0) {
        result.explanation += ` 식사를 전혀 하지 않은 날이 ${noneCount}일 있었습니다.`
      } else if (lessCount > 0) {
        result.explanation += ` 식사량이 적은 날이 ${lessCount}일 있었습니다.`
      }
    } else if (itemId === "stool") {
      const softCount = items.filter((item) => item.value === "soft").length
      const noneCount = items.filter((item) => item.value === "none").length
      const abnormalCount = items.filter((item) => item.value === "abnormal").length
      result.softCount = softCount
      result.noneCount = noneCount
      result.abnormalCount = abnormalCount

      if (abnormalCount > 0) {
        result.explanation += ` 비정상 배변이 ${abnormalCount}회 있었습니다.`
      } else if (noneCount > 0) {
        result.explanation += ` 배변이 없었던 날이 ${noneCount}일 있었습니다.`
      } else if (softCount > 0) {
        result.explanation += ` 무른 변이 ${softCount}회 있었습니다.`
      }
    }
  }

  return result
}

/**
 * 종합 건강 점수 계산 함수
 */
function calculateComprehensiveHealthScore({
  appetite,
  energy,
  stool,
  sleep,
  temperature,
  walkCount,
  walkDistance,
  feedCount,
  waterCount,
  waterAmount,
  petInfo,
}) {
  let score = 100
  const deductions = [] // 감점 내역을 기록

  // 건강 체크 항목별 감점
  if (appetite) {
    if (appetite.status === "warning") {
      score -= 8
      deductions.push("식욕 주의(-8)")
    }
    if (appetite.status === "alert") {
      score -= 15
      deductions.push("식욕 경고(-15)")
    }
  }

  if (energy) {
    if (energy.status === "warning") {
      score -= 8
      deductions.push("활력 주의(-8)")
    }
    if (energy.status === "alert") {
      score -= 15
      deductions.push("활력 경고(-15)")
    }
  }

  if (stool) {
    if (stool.status === "warning") {
      score -= 10
      deductions.push("배변 주의(-10)")
    }
    if (stool.status === "alert") {
      score -= 20
      deductions.push("배변 경고(-20)")
    }
  }

  if (sleep) {
    if (sleep.status === "warning") {
      score -= 5
      deductions.push("수면 주의(-5)")
    }
    if (sleep.status === "alert") {
      score -= 10
      deductions.push("수면 경고(-10)")
    }
  }

  if (temperature) {
    if (temperature.status === "warning") {
      score -= 10
      deductions.push("체온 주의(-10)")
    }
    if (temperature.status === "alert") {
      score -= 25
      deductions.push("체온 경고(-25)")
    }
  }

  // 활동 기반 감점/가점
  // 산책 - 주 3회 미만이면 감점
  if (walkCount < 3) {
    score -= 5
    deductions.push("산책 부족(-5)")
  } else if (walkCount >= 5) {
    // 주 5회 이상이면 가점
    score += 5
    deductions.push("산책 우수(+5)")
  }

  // 사료 - 주 7회 미만이면 감점 (하루 1회 기준)
  if (feedCount < 7) {
    const feedDeduction = Math.min(10, (7 - feedCount) * 2)
    score -= feedDeduction
    deductions.push(`사료 급여 부족(-${feedDeduction})`)
  }

  // 물 - 주 7회 미만이면 감점 (하루 1회 기준)
  if (waterCount < 7) {
    const waterDeduction = Math.min(15, (7 - waterCount) * 3)
    score -= waterDeduction
    deductions.push(`물 섭취 부족(-${waterDeduction})`)
  }

  // 점수 범위 조정 (10-100)
  const finalScore = Math.max(10, Math.min(100, score))

  return {
    score: finalScore,
    deductions: deductions,
  }
}

// 종합 건강 인사이트 생성 함수를 개선합니다
function generateComprehensiveInsight({
  appetite,
  energy,
  stool,
  sleep,
  temperature,
  walkCount,
  walkDistance,
  walkDuration,
  feedCount,
  feedAmount,
  waterCount,
  waterAmount,
  currentWeight,
  weightChange,
  petInfo,
}) {
  const insights = []

  // 종합 건강 상태 평가
  let healthStatus = "양호"
  let concernCount = 0

  if (appetite && appetite.status !== "good") concernCount++
  if (energy && energy.status !== "good") concernCount++
  if (stool && stool.status !== "good") concernCount++
  if (sleep && sleep.status !== "good") concernCount++
  if (temperature && temperature.status !== "good") concernCount++
  if (walkCount < 3) concernCount++
  if (feedCount < 7) concernCount++
  if (waterCount < 7) concernCount++

  if (concernCount >= 3) {
    healthStatus = "주의 필요"
  } else if (concernCount >= 1 && concernCount <= 2) {
    healthStatus = "대체로 양호"
  }

  // 종합 인사이트 추가
  insights.push(`이번 주 반려견의 전반적인 건강 상태는 ${healthStatus}합니다.`)

  // 건강 체크 인사이트
  const healthConcerns = []
  if (appetite && appetite.status !== "good") {
    healthConcerns.push("식욕")
  }
  if (energy && energy.status !== "good") {
    healthConcerns.push("활력")
  }
  if (stool && stool.status !== "good") {
    healthConcerns.push("배변 상태")
  }
  if (sleep && sleep.status !== "good") {
    healthConcerns.push("수면")
  }
  if (temperature && temperature.status !== "good") {
    healthConcerns.push("체온")
  }

  if (healthConcerns.length > 0) {
    insights.push(`${healthConcerns.join(", ")}에 주의가 필요합니다.`)
  } else if (appetite || energy || stool || sleep || temperature) {
    insights.push("건강 체크 항목에서 특별한 이상은 발견되지 않았습니다.")
  } else {
    insights.push(
      "건강 체크 데이터가 아직 수집되지 않았습니다. 정기적인 건강 체크를 통해 더 정확한 인사이트를 받아보세요.",
    )
  }

  // 산책 인사이트
  if (walkCount === 0) {
    insights.push("이번 주에는 산책 기록이 없습니다. 규칙적인 산책은 반려견의 신체적, 정신적 건강에 중요합니다.")
  } else if (walkCount < 3) {
    insights.push(`이번 주 산책은 ${walkCount}회로 다소 부족합니다. 가능하다면 주 3-5회 정도의 산책을 권장합니다.`)
  } else if (walkCount >= 5) {
    insights.push(`이번 주 산책을 ${walkCount}회 진행했습니다. 규칙적인 산책 습관이 잘 유지되고 있습니다.`)
  } else {
    insights.push(
      `이번 주 산책을 ${walkCount}회 진행했습니다. 적정 수준의 산책 횟수입니다. 평균 ${(walkDistance / walkCount).toFixed(1)}km의 거리를 유지하며 꾸준히 산책하세요.`,
    )
  }

  // 사료 인사이트
  if (feedCount === 0) {
    insights.push("이번 주에는 사료 급여 기록이 없습니다. 규칙적인 식사는 반려견의 건강에 중요합니다.")
  } else if (feedCount < 7) {
    insights.push(`이번 주 사료 급여는 ${feedCount}회로 기록되었습니다. 매일 규칙적인 식사 기록을 권장합니다.`)
  } else {
    const avgAmount = Math.round(feedAmount / feedCount)
    let feedAmountComment = ""

    // 사료량 이상 체크 (소형견/중형견/대형견 기준 다르게 적용)
    const dogSize = petInfo?.size || "medium" // 기본값은 중형견

    if (dogSize === "small" && (avgAmount < 30 || avgAmount > 150)) {
      feedAmountComment = " 소형견 기준 사료량(30-150g)을 벗어났습니다. 적정량을 확인해보세요."
    } else if (dogSize === "medium" && (avgAmount < 100 || avgAmount > 300)) {
      feedAmountComment = " 중형견 기준 사료량(100-300g)을 벗어났습니다. 적정량을 확인해보세요."
    } else if (dogSize === "large" && (avgAmount < 200 || avgAmount > 500)) {
      feedAmountComment = " 대형견 기준 사료량(200-500g)을 벗어났습니다. 적정량을 확인해보세요."
    }

    insights.push(
      `이번 주 사료 급여가 잘 이루어졌습니다. 평균 ${avgAmount}g의 사료를 급여했습니다.${feedAmountComment}`,
    )
  }

  // 물 섭취 인사이트
  if (waterCount === 0) {
    insights.push("이번 주에는 물 섭취 기록이 없습니다. 충분한 수분 섭취는 반려견의 건강에 필수적입니다.")
  } else if (waterCount < 7) {
    insights.push(`이번 주 물 섭취는 ${waterCount}회로 기록되었습니다. 매일 충분한 수분 섭취를 확인해주세요.`)
  } else {
    insights.push(`이번 주 물 섭취가 잘 이루어졌습니다. 총 ${waterAmount}ml의 물을 섭취했습니다.`)
  }

  // 체중 인사이트
  if (currentWeight > 0) {
    // 견종 크기에 따른 체중 변화 기준 조정
    const dogSize = petInfo?.size || "medium" // 기본값은 중형견
    const weightChangeThreshold = dogSize === "large" ? 1.0 : 0.5 // 대형견은 1kg, 소/중형견은 0.5kg

    if (weightChange > weightChangeThreshold) {
      insights.push(
        `이번 주 체중이 ${weightChange.toFixed(1)}kg 증가했습니다. 급격한 체중 증가는 건강에 좋지 않을 수 있으니 식이와 운동량을 확인해보세요.`,
      )
    } else if (weightChange < -weightChangeThreshold) {
      insights.push(
        `이번 주 체중이 ${Math.abs(weightChange).toFixed(1)}kg 감소했습니다. 급격한 체중 감소는 건강 문제의 신호일 수 있으니 주의 깊게 관찰해주세요.`,
      )
    } else {
      insights.push(`이번 주 체중은 안정적으로 유지되고 있습니다.`)
    }
  }

  return insights
}
