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
import { WeightChart } from "@/app/report/weight-chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useToast } from "@/hooks/use-toast"
import { 
  reportApi, 
  healthApi,
  medicationApi,
  dogApi,
  type ComprehensiveReportResponse, 
  type HealthInsightResponse, 
  type ActivityStatsResponse, 
  type HealthCheckDetailResponse,
  type WeeklyReportResponse,
  type WeightRecordResponse,
  type MedicationResponse
} from "@/lib/api"

export default function ReportContent() {
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>("week")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasPetInfo, setHasPetInfo] = useState<boolean | null>(null) // null: 확인 중, true: 있음, false: 없음
  const { toast } = useToast()

  // API 데이터 상태
  const [comprehensiveReport, setComprehensiveReport] = useState<ComprehensiveReportResponse | null>(null)
  const [activityStats, setActivityStats] = useState<ActivityStatsResponse | null>(null)
  const [healthDetails, setHealthDetails] = useState<HealthCheckDetailResponse[]>([])
  const [weeklyReport, setWeeklyReport] = useState<WeeklyReportResponse | null>(null)
  const [weightRecords, setWeightRecords] = useState<WeightRecordResponse[]>([])
  
  // 약물 정보 (API 데이터)
  const [medications, setMedications] = useState<MedicationResponse[]>([])

  useEffect(() => {
    setMounted(true)
    checkPetInfoAndLoadData()
    // 약물 데이터 로드 임시 비활성화 (리포트 테스트용)
    // loadMedicationData().catch(err => {
    //   console.warn("약물 데이터 로드를 건너뜁니다:", err)
    // })
  }, [])

  useEffect(() => {
    if (mounted && hasPetInfo) {
      loadReportData()
    }
  }, [timeRange, mounted, hasPetInfo])

  const checkPetInfoAndLoadData = async () => {
    try {
      // 먼저 반려견 정보가 있는지 확인
      const dogInfo = await dogApi.getDogInfo()
      if (dogInfo) {
        setHasPetInfo(true)
        loadReportData()
      } else {
        setHasPetInfo(false)
      }
    } catch (error) {
      console.error("반려견 정보 확인 실패:", error)
      // 백엔드 실패 시 로컬스토리지 확인
      const savedPetInfo = localStorage.getItem('registeredPetInfo')
      if (savedPetInfo) {
        setHasPetInfo(true)
        loadReportData()
      } else {
        setHasPetInfo(false)
      }
    }
  }

  const loadMedicationData = async () => {
    try {
      console.log("약물 데이터 로드 시도 중...")
      // 약 정보 불러오기 (API 호출)
      const medicationData = await medicationApi.getMedications()
      console.log("약물 데이터 로드 성공:", medicationData)
      setMedications(medicationData)
    } catch (err) {
      console.warn("약물 데이터 로드 실패 (리포트는 계속 표시):", err)
      // 실패시 빈 배열로 설정 (UI는 유지)
      setMedications([])
    }
  }

  const loadReportData = async () => {
    if (!mounted) return
    
    setLoading(true)
    setError(null)
    
    try {
      // 종합 리포트 데이터 로드
      const reportData = await reportApi.getComprehensiveReport(timeRange)
      setComprehensiveReport(reportData)

      // 주간 리포트 데이터 로드 (추가 정보)
      const weeklyData = await healthApi.getWeeklyReport()
      setWeeklyReport(weeklyData)

      // 체중 기록 로드 (새로운 API 사용)
      const weightData = await healthApi.getWeightRecords()
      setWeightRecords(weightData)

      // 통계 탭용 상세 데이터 로드
      if (activeTab === "statistics") {
        const [statsData, healthDetailsData] = await Promise.all([
          reportApi.getActivityStats(timeRange),
          reportApi.getHealthDetails(timeRange)
        ])
        setActivityStats(statsData)
        setHealthDetails(healthDetailsData)
      }
    } catch (err) {
      console.error("리포트 데이터 로드 실패:", err)
      setError("리포트 데이터를 불러오는데 실패했습니다.")
      toast({
        title: "데이터 로드 실패",
        description: "리포트 데이터를 불러오는데 실패했습니다. 다시 시도해주세요.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // 탭 변경시 데이터 로드
  const handleTabChange = async (newTab: string) => {
    setActiveTab(newTab)
    
    if (newTab === "statistics" && !activityStats) {
      setLoading(true)
      try {
        const [statsData, healthDetailsData] = await Promise.all([
          reportApi.getActivityStats(timeRange),
          reportApi.getHealthDetails(timeRange)
        ])
        setActivityStats(statsData)
        setHealthDetails(healthDetailsData)
      } catch (err) {
        console.error("통계 데이터 로드 실패:", err)
        toast({
          title: "데이터 로드 실패",
          description: "통계 데이터를 불러오는데 실패했습니다.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
  }

  // 컴포넌트가 마운트되지 않았으면 로딩 표시
  if (!mounted) {
    return (
      <div className="min-h-screen bg-pink-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  // 반려견 정보 확인 중
  if (hasPetInfo === null) {
    return (
      <div className="min-h-screen bg-pink-50 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">반려견 정보를 확인하고 있습니다...</p>
        </div>
      </div>
    )
  }

  // 반려견 정보가 없을 때
  if (hasPetInfo === false) {
    return (
      <div className="min-h-screen bg-pink-50">
        <div className="bg-pink-200 p-4 flex items-center">
          <Link href="/dashboard" className="text-gray-800">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-bold text-gray-800 ml-4">건강 리포트</h1>
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-pink-100 max-w-md">
            <BarChart className="w-16 h-16 text-pink-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">등록된 반려견이 없습니다</h2>
            <p className="text-gray-600 mb-6">
              건강 리포트를 확인하려면<br />
              먼저 반려견 정보를 등록해주세요.
            </p>
            <Link href="/info">
              <Button className="w-full bg-pink-500 hover:bg-pink-600 text-white rounded-xl">
                반려견 등록하기
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // 오늘 복용할 약 필터링 (현재 날짜가 복용 기간 내인 약물)
  const activeMedications = medications.filter((med) => {
    const today = new Date().toISOString().split('T')[0]
    const startDate = med.start_date
    const endDate = med.end_date
    
    // 시작날짜 체크
    if (today < startDate) return false
    
    // 종료날짜가 있으면 체크, 없으면 계속 복용
    if (endDate && today > endDate) return false
    
    return true
  })

  // 체중 변화 트렌드 계산 (새로운 API 데이터 사용)
  const getWeightTrend = () => {
    if (!weightRecords || weightRecords.length < 2) return { trend: "stable", change: 0 }
    
    const sortedWeights = [...weightRecords].sort((a, b) => 
      new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime()
    )
    
    const firstWeight = sortedWeights[0].weight_kg
    const lastWeight = sortedWeights[sortedWeights.length - 1].weight_kg
    const change = lastWeight - firstWeight
    const trend = change > 0.2 ? "up" : change < -0.2 ? "down" : "stable"
    
    return { trend, change }
  }

  return (
    <div className="min-h-screen bg-pink-50 pb-20">
      <div className="bg-pink-200 p-4 flex items-center">
        <Link href="/dashboard" className="text-gray-800">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-bold text-gray-800 ml-4">건강 리포트</h1>
      </div>

      {error && (
        <div className="p-4 mx-5 mt-5 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={loadReportData}
          >
            다시 시도
          </Button>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-5 space-y-6"
      >
        <Tabs defaultValue="overview" value={activeTab} onValueChange={handleTabChange}>
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
            {loading && !comprehensiveReport ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
                <span className="ml-2 text-gray-600">리포트를 불러오는 중...</span>
              </div>
            ) : comprehensiveReport ? (
              <>
                {/* 주간 활동 요약 (주간 리포트 API 데이터 활용) */}
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
                            <p>{timeRange === "week" ? "최근 7일간" : timeRange === "month" ? "최근 30일간" : "전체 기간"}의 활동 기록입니다</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </CardTitle>
                    {weeklyReport && (
                      <p className="text-sm text-gray-500">
                        {weeklyReport.week_start} ~ {weeklyReport.week_end}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-sm text-gray-500">총 활동 기록</div>
                      <div className="text-xl font-bold text-gray-800">
                        {weeklyReport 
                          ? weeklyReport.walk_count + weeklyReport.food_count + weeklyReport.water_count + weeklyReport.health_check_count
                          : comprehensiveReport.activity_stats.walk_count + comprehensiveReport.activity_stats.feed_count + comprehensiveReport.activity_stats.water_count + comprehensiveReport.activity_stats.health_check_count
                        }회
                      </div>
                    </div>
                    <div className="bg-gray-100 h-2 rounded-full w-full mb-4">
                      <div
                        className="bg-gradient-to-r from-pink-400 to-pink-500 h-2 rounded-full"
                        style={{ 
                          width: `${weeklyReport && weeklyReport.walk_count > 0 ? 100 : 
                                     comprehensiveReport.activity_stats.walk_count > 0 ? 100 : 0}%` 
                        }}
                      ></div>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      <div className="bg-blue-50 p-2 rounded-lg text-center">
                        <div className="text-xs text-gray-600">산책</div>
                        <div className="text-lg font-bold text-blue-600">
                          {weeklyReport ? weeklyReport.walk_count : comprehensiveReport.activity_stats.walk_count}회
                        </div>
                        {weeklyReport && (
                          <div className="text-xs text-gray-500">{weeklyReport.avg_walk_distance.toFixed(1)}km</div>
                        )}
                      </div>
                      <div className="bg-amber-50 p-2 rounded-lg text-center">
                        <div className="text-xs text-gray-600">사료</div>
                        <div className="text-lg font-bold text-amber-600">
                          {weeklyReport ? weeklyReport.food_count : comprehensiveReport.activity_stats.feed_count}회
                        </div>
                        {weeklyReport && (
                          <div className="text-xs text-gray-500">{weeklyReport.total_food_g}g</div>
                        )}
                      </div>
                      <div className="bg-purple-50 p-2 rounded-lg text-center">
                        <div className="text-xs text-gray-600">물</div>
                        <div className="text-lg font-bold text-purple-600">
                          {weeklyReport ? weeklyReport.water_count : comprehensiveReport.activity_stats.water_count}회
                        </div>
                        {weeklyReport && (
                          <div className="text-xs text-gray-500">{weeklyReport.total_water_ml}ml</div>
                        )}
                      </div>
                      <div className="bg-green-50 p-2 rounded-lg text-center">
                        <div className="text-xs text-gray-600">건강체크</div>
                        <div className="text-lg font-bold text-green-600">
                          {weeklyReport ? weeklyReport.health_check_count : comprehensiveReport.activity_stats.health_check_count}회
                        </div>
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
                            <p>종합 건강 인사이트입니다</p>
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
                          <HealthInsights 
                            healthInsight={comprehensiveReport.health_insight}
                            activityStats={comprehensiveReport.activity_stats}
                            healthDetails={comprehensiveReport.health_check_details}
                            weeklyReport={weeklyReport}
                          />
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

                {/* 약 복용 알림 - 임시 비활성화 */}
                {false && activeMedications.length > 0 && (
                  <Card className="bg-white rounded-xl shadow-sm">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg font-semibold text-gray-800">약 복용 알림</CardTitle>
                        <Link href="/report/medication">
                          <Button variant="outline" size="sm">
                            모두 보기
                          </Button>
                        </Link>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        {activeMedications.slice(0, 2).map((med, index) => (
                          <div key={med.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Pill className="h-5 w-5 text-pink-500" />
                              <div>
                                <div className="font-medium">{med.name}</div>
                                <div className="text-sm text-gray-600">{med.dosage}</div>
                              </div>
                            </div>
                            <span className="text-sm font-medium">
                              {med.time.substring(0, 5)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* 체중 차트 (새로운 API 데이터 사용) */}
                {weightRecords && weightRecords.length > 0 && (
                  <Card className="bg-white rounded-xl shadow-sm">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg font-semibold text-gray-800">체중 변화</CardTitle>
                        <div className="flex items-center gap-2">
                          {getWeightTrend().trend === "up" ? (
                            <TrendingUp className="w-4 h-4 text-red-500" />
                          ) : getWeightTrend().trend === "down" ? (
                            <TrendingDown className="w-4 h-4 text-blue-500" />
                          ) : (
                            <Minus className="w-4 h-4 text-gray-500" />
                          )}
                          <span
                            className={`text-sm font-medium ${
                              getWeightTrend().trend === "up"
                                ? "text-red-500"
                                : getWeightTrend().trend === "down"
                                  ? "text-blue-500"
                                  : "text-gray-500"
                            }`}
                          >
                            {getWeightTrend().change > 0 ? "+" : ""}
                            {getWeightTrend().change.toFixed(1)}kg
                          </span>
                        </div>
                      </div>
                      {weeklyReport && (
                        <p className="text-sm text-gray-500">
                          현재 체중: {weeklyReport.current_weight}kg
                        </p>
                      )}
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="h-64">
                        <WeightChart weights={weightRecords} />
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>리포트 데이터를 불러올 수 없습니다.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="statistics" className="mt-4 space-y-6">
            {/* 시간 범위 선택 */}
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">상세 통계</h2>
              <Select value={timeRange} onValueChange={(value: 'week' | 'month' | 'all') => setTimeRange(value)}>
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

            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
                <span className="ml-2 text-gray-600">통계를 불러오는 중...</span>
              </div>
            ) : activityStats ? (
              <>
                {/* 산책 통계 (주간 리포트 데이터 활용) */}
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
                        <div className="text-lg font-bold text-gray-800">
                          {weeklyReport ? weeklyReport.walk_count : activityStats.walk_count}회
                        </div>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg text-center">
                        <div className="text-xs text-gray-600">평균 거리</div>
                        <div className="text-lg font-bold text-gray-800">
                          {weeklyReport ? weeklyReport.avg_walk_distance.toFixed(1) : (activityStats.avg_walk_distance ? activityStats.avg_walk_distance.toFixed(1) : 0)}km
                        </div>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg text-center">
                        <div className="text-xs text-gray-600">평균 시간</div>
                        <div className="text-lg font-bold text-gray-800">
                          {weeklyReport ? Math.round(weeklyReport.avg_walk_duration) : 0}분
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 text-sm text-gray-500 text-center">
                      {timeRange === "week" ? "최근 7일" : timeRange === "month" ? "최근 30일" : "전체 기간"} 동안의 산책 통계입니다.
                    </div>
                  </CardContent>
                </Card>

                {/* 사료 통계 */}
                <Card className="bg-white rounded-xl shadow-sm">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                        <Bone className="w-5 h-5 text-amber-500" />
                      </div>
                      <h3 className="text-base font-semibold text-gray-800">사료 통계</h3>
                    </div>

                    <div className="bg-amber-50 p-3 rounded-lg mb-3">
                      <div className="text-xs text-gray-600">사료 급여 횟수</div>
                      <div className="text-lg font-bold text-gray-800">{activityStats.feed_count}회</div>
                      <div className="text-xs text-gray-500 mt-1">
                        평균 {activityStats.avg_food_amount ? activityStats.avg_food_amount.toFixed(0) : 0}g/회
                        {weeklyReport && <span> (총 {weeklyReport.total_food_g}g)</span>}
                      </div>
                    </div>

                    <div className="mt-4 text-sm text-gray-500 text-center">
                      {timeRange === "week" ? "최근 7일" : timeRange === "month" ? "최근 30일" : "전체 기간"} 동안의 급여 통계입니다.
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

                    <div className="bg-purple-50 p-3 rounded-lg mb-3">
                      <div className="text-xs text-gray-600">평균 물 섭취량</div>
                      <div className="text-lg font-bold text-gray-800">
                        {weeklyReport ? Math.round(weeklyReport.total_water_ml / 7) : (activityStats.avg_water_intake ? activityStats.avg_water_intake.toFixed(0) : 0)}ml
                      </div>
                      {weeklyReport && (
                        <div className="text-xs text-gray-500 mt-1">총 {weeklyReport.total_water_ml}ml</div>
                      )}
                    </div>

                    <div className="mt-4 text-sm text-gray-500 text-center">
                      {timeRange === "week" ? "최근 7일" : timeRange === "month" ? "최근 30일" : "전체 기간"} 동안의 물 섭취 통계입니다.
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

                    <div className="bg-green-50 p-3 rounded-lg mb-3">
                      <div className="text-xs text-gray-600">최근 체중</div>
                      <div className="text-lg font-bold text-gray-800">
                        {weeklyReport ? weeklyReport.current_weight : activityStats.latest_weight}kg
                      </div>
                      {getWeightTrend().change !== 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          변화: {getWeightTrend().change > 0 ? '+' : ''}{getWeightTrend().change.toFixed(1)}kg
                        </div>
                      )}
                    </div>

                    {weightRecords && weightRecords.length > 0 && (
                      <div className="h-48 mt-4">
                        <WeightChart weights={weightRecords} />
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
                        <div className="text-lg font-bold text-gray-800">
                          {weeklyReport ? weeklyReport.health_check_count : activityStats.health_check_count}회
                        </div>
                      </div>
                      <div className="bg-pink-50 p-3 rounded-lg text-center">
                        <div className="text-xs text-gray-600">이상 발견 횟수</div>
                        <div className="text-lg font-bold text-gray-800">{activityStats.health_check_abnormal_count}회</div>
                        <div className="text-xs text-gray-500 mt-1">
                          (
                          {activityStats.health_check_count > 0
                            ? Math.round((activityStats.health_check_abnormal_count / activityStats.health_check_count) * 100)
                            : 0}
                          %)
                        </div>
                      </div>
                    </div>

                    {/* 건강 항목별 상세 */}
                    {healthDetails.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">항목별 상세</h4>
                        {healthDetails.map((detail, index) => (
                          <HealthCheckSummaryItem key={index} detail={detail} />
                        ))}
                      </div>
                    )}

                    <div className="mt-4 text-sm text-center">
                      <Link href="/health-record?tab=health">
                        <Button variant="outline" size="sm">
                          건강 체크 바로가기
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>통계 데이터를 불러올 수 없습니다.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}

// 건강 인사이트 컴포넌트
function HealthInsights({ 
  healthInsight, 
  activityStats, 
  healthDetails,
  weeklyReport
}: { 
  healthInsight: HealthInsightResponse
  activityStats: ActivityStatsResponse
  healthDetails: HealthCheckDetailResponse[]
  weeklyReport: WeeklyReportResponse | null
}) {
  return (
    <div className="space-y-4">
      {/* 건강 점수 */}
      <div className="flex justify-between items-center mb-2">
        <div className="text-sm text-gray-600">종합 건강 점수</div>
        <div className="text-xl font-bold text-gray-800">{healthInsight.score}/100</div>
      </div>
      <div className="bg-gray-100 h-2 rounded-full w-full mb-4">
        <div
          className={`h-2 rounded-full ${
            healthInsight.score >= 80 ? "bg-green-500" : healthInsight.score >= 60 ? "bg-yellow-500" : "bg-red-500"
          }`}
          style={{ width: `${healthInsight.score}%` }}
        ></div>
      </div>

      {/* 건강 상태 */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-600">전반적 상태</span>
        <Badge
          variant="outline"
          className={`${
            healthInsight.status === "매우 좋음" || healthInsight.status === "좋음"
              ? "bg-green-100 text-green-800 border-green-200"
              : healthInsight.status === "보통"
                ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                : "bg-red-100 text-red-800 border-red-200"
          }`}
        >
          {healthInsight.status}
        </Badge>
      </div>

      {/* 건강 인사이트 */}
      <Card className="bg-gray-50 border-none">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
              <Activity className="w-5 h-5 text-pink-500" />
            </div>
            <h3 className="text-base font-semibold text-gray-800">건강 인사이트</h3>
          </div>
          <div className="text-sm text-gray-700 space-y-2">
            {healthInsight.insights.map((insight, index) => (
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
          <div className="text-lg font-bold text-gray-800">
            {weeklyReport ? weeklyReport.walk_count : activityStats.walk_count}회
          </div>
          <div className="text-xs text-gray-500">
                                  평균 {weeklyReport ? weeklyReport.avg_walk_distance.toFixed(1) : (activityStats.avg_walk_distance ? activityStats.avg_walk_distance.toFixed(1) : 0)}km
          </div>
        </div>

        <div className="bg-amber-50 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Bone className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-medium text-gray-700">사료</span>
          </div>
          <div className="text-lg font-bold text-gray-800">{activityStats.feed_count}회</div>
          <div className="text-xs text-gray-500">
                                  {weeklyReport ? `총 ${weeklyReport.total_food_g}g` : `평균 ${activityStats.avg_food_amount ? activityStats.avg_food_amount.toFixed(0) : 0}g`}
          </div>
        </div>

        <div className="bg-purple-50 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Droplets className="w-4 h-4 text-purple-500" />
            <span className="text-sm font-medium text-gray-700">물</span>
          </div>
          <div className="text-lg font-bold text-gray-800">
            {weeklyReport ? weeklyReport.water_count : activityStats.water_count}회
          </div>
          <div className="text-xs text-gray-500">
                                  {weeklyReport ? `총 ${weeklyReport.total_water_ml}ml` : `평균 ${activityStats.avg_water_intake ? activityStats.avg_water_intake.toFixed(0) : 0}ml`}
          </div>
        </div>

        <div className="bg-green-50 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Scale className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-gray-700">체중</span>
          </div>
          <div className="text-lg font-bold text-gray-800">
            {weeklyReport ? weeklyReport.current_weight : activityStats.latest_weight}kg
          </div>
          <div className="text-xs text-gray-500">최근 기록</div>
        </div>
      </div>

      {/* 건강 체크 항목별 상세 */}
      {healthDetails.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700">건강 체크 상세</h3>
          </div>
          <div className="space-y-2">
            {healthDetails.map((detail, index) => (
              <HealthCheckSummaryItem key={index} detail={detail} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// 건강 체크 요약 항목 컴포넌트
function HealthCheckSummaryItem({ detail }: { detail: HealthCheckDetailResponse }) {
  const getIcon = (category: string) => {
    switch (category) {
      case "수면": return <Moon className="h-4 w-4" />
      case "체온": return <Thermometer className="h-4 w-4" />
      case "식욕": return <Bone className="h-4 w-4" />
      case "활력": return <Activity className="h-4 w-4" />
      case "배변상태": return <AlertTriangle className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  const getIconColor = (category: string) => {
    switch (category) {
      case "수면": return "text-indigo-500"
      case "체온": return "text-red-500"
      case "식욕": return "text-amber-500"
      case "활력": return "text-blue-500"
      case "배변상태": return "text-orange-500"
      default: return "text-gray-500"
    }
  }

  return (
    <div className="flex items-center justify-between p-2 bg-white rounded-lg border">
      <div className="flex items-center gap-2">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center bg-gray-100`}>
          <span className={getIconColor(detail.category)}>{getIcon(detail.category)}</span>
        </div>
        <span className="text-sm">{detail.category}</span>
      </div>
      <div className="flex items-center gap-2">
        {detail.avg_numeric_value !== null && (
          <span className="text-xs text-gray-500">
            평균 {detail.avg_numeric_value}{detail.unit || ""}
          </span>
        )}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Badge
                variant="outline"
                className={`${
                  detail.status === "정상"
                    ? "bg-green-100 text-green-800 border-green-200"
                    : detail.status === "주의"
                      ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                      : "bg-red-100 text-red-800 border-red-200"
                }`}
              >
                {detail.status}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">
                {detail.data_count}회 기록, {detail.abnormal_count}회 이상
                <br />
                추세: {detail.trend}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
} 