"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Check,
  AlertTriangle,
  Activity,
  Thermometer,
  Droplets,
  Bone,
  Moon,
  Scale,
  MapPin,
  LineChart,
} from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { getData, saveData } from "@/lib/storage"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSearchParams } from "next/navigation"
import { NumberPicker } from "@/components/number-picker"

// 체크 항목 타입 정의
type CheckItem = {
  id: string
  label: string
  icon: React.ReactNode
  iconColor: string
  checked: boolean
  status: string
  value: string | number
  note: string
  options?: { value: string; label: string }[]
  isNumeric?: boolean
  unit?: string
  min?: number
  max?: number
  step?: number
  precision?: number
}

export default function HealthRecordPage() {
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const initialTab = searchParams.get("tab") || "health"
  const todayOnly = searchParams.get("today") === "true"

  const [petInfo, setPetInfo] = useState<any>(null)
  const [date, setDate] = useState<string>("")
  const [activeTab, setActiveTab] = useState(initialTab)
  const [historyTab, setHistoryTab] = useState("current")

  // 건강 체크 항목 상태
  const [checkItems, setCheckItems] = useState<CheckItem[]>([
    {
      id: "appetite",
      label: "식욕",
      icon: <Bone className="h-5 w-5" />,
      iconColor: "text-amber-500",
      checked: false,
      status: "normal",
      value: "",
      note: "",
      options: [
        { value: "normal", label: "잘 먹음" },
        { value: "less", label: "적게 먹음" },
        { value: "none", label: "거부" },
      ],
    },
    {
      id: "energy",
      label: "활력",
      icon: <Activity className="h-5 w-5" />,
      iconColor: "text-blue-500",
      checked: false,
      status: "normal",
      value: "",
      note: "",
      options: [
        { value: "normal", label: "평소 같음" },
        { value: "less", label: "무기력" },
        { value: "more", label: "과활동" },
      ],
    },
    {
      id: "stool",
      label: "배변 상태",
      icon: <AlertTriangle className="h-5 w-5" />,
      iconColor: "text-orange-500",
      checked: false,
      status: "normal",
      value: "",
      note: "",
      options: [
        { value: "normal", label: "정상" },
        { value: "soft", label: "무른 변" },
        { value: "none", label: "안 함" },
        { value: "abnormal", label: "이상 있음" },
      ],
    },
    {
      id: "sleep",
      label: "수면",
      icon: <Moon className="h-5 w-5" />,
      iconColor: "text-indigo-500",
      checked: false,
      status: "normal",
      value: 8,
      note: "",
      isNumeric: true,
      unit: "시간",
      min: 0,
      max: 24,
      step: 0.5,
      precision: 1,
    },
    {
      id: "temperature",
      label: "체온",
      icon: <Thermometer className="h-5 w-5" />,
      iconColor: "text-red-500",
      checked: false,
      status: "normal",
      value: 38.5,
      note: "",
      isNumeric: true,
      unit: "°C",
      min: 35,
      max: 42,
      step: 0.1,
      precision: 1,
    },
  ])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [completedToday, setCompletedToday] = useState(false)
  const [healthData, setHealthData] = useState<any>(null)
  const [healthHistory, setHealthHistory] = useState<any[]>([])

  // 산책 관련 상태
  const [walkDistance, setWalkDistance] = useState(1.5)
  const [walkTime, setWalkTime] = useState(30)

  // 사료 관련 상태
  const [feedTime, setFeedTime] = useState("")
  const [feedBrand, setFeedBrand] = useState("")
  const [feedAmount, setFeedAmount] = useState(100)

  // 물 관련 상태
  const [waterCount, setWaterCount] = useState(1)
  const [waterAmount, setWaterAmount] = useState(200)

  // 체중 관련 상태
  const [weight, setWeight] = useState(5.2)

  /**
   * 건강 체크 제출 함수
   *
   * 백엔드 연결 시 다음과 같은 API 호출로 대체:
   * - POST /api/pets/:petId/healthChecks
   */
  const handleHealthSubmit = () => {
    setIsSubmitting(true)

    // 모든 항목이 체크되었는지 확인
    const allChecked = checkItems.every((item) => {
      if (item.isNumeric) {
        return item.checked
      } else {
        return item.checked && item.value !== ""
      }
    })

    if (!allChecked) {
      toast({
        title: "모든 항목을 체크해주세요",
        description: "건강 체크를 완료하려면 모든 항목을 확인해야 합니다.",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    // React 요소를 제외한 데이터만 저장하기 위해 필요한 속성만 추출
    const serializableCheckItems = checkItems.map((item) => ({
      id: item.id,
      label: item.label,
      iconColor: item.iconColor,
      checked: item.checked,
      status: item.status,
      value: item.value,
      note: item.note,
      options: item.options,
      isNumeric: item.isNumeric,
      unit: item.unit,
      min: item.min,
      max: item.max,
      step: item.step,
      precision: item.precision,
    }))

    // 데이터 저장 - 백엔드 연결 시 API 호출로 대체
    saveData(`dailyCheck_${date}`, serializableCheckItems)

    // 건강 기록에 추가
    const healthData = getData("healthData") || {
      activities: [],
      healthChecks: [],
    }

    // 비정상 항목 찾기
    const abnormalItems = checkItems.filter((item) => item.status !== "normal")

    // 건강 체크 데이터 저장
    healthData.healthChecks = healthData.healthChecks || []
    healthData.healthChecks.push({
      date,
      time: `${new Date().getHours().toString().padStart(2, "0")}:${new Date().getMinutes().toString().padStart(2, "0")}`,
      items: checkItems.map((item) => ({
        id: item.id,
        value: item.value,
        status: item.status,
        note: item.note,
      })),
    })

    if (abnormalItems.length > 0) {
      const abnormalLabels = abnormalItems.map((item) => item.label).join(", ")

      healthData.activities = [
        {
          type: "health",
          date: date,
          time: `${new Date().getHours().toString().padStart(2, "0")}:${new Date().getMinutes().toString().padStart(2, "0")}`,
          description: `건강 체크: ${abnormalLabels}에 이상이 있습니다.`,
        },
        ...healthData.activities,
      ]
    } else {
      healthData.activities = [
        {
          type: "health",
          date: date,
          time: `${new Date().getHours().toString().padStart(2, "0")}:${new Date().getMinutes().toString().padStart(2, "0")}`,
          description: "건강 체크: 모든 항목이 정상입니다.",
        },
        ...healthData.activities,
      ]
    }

    saveData("healthData", healthData)
    setHealthData(healthData)

    // 성공 메시지 표시
    toast({
      title: "건강 체크 완료",
      description: "오늘의 건강 체크가 저장되었습니다.",
    })

    setCompletedToday(true)
    setIsSubmitting(false)

    // 건강 체크 기록 업데이트
    const updatedHistory = [{ date, checks: serializableCheckItems }, ...healthHistory]
    setHealthHistory(updatedHistory.slice(0, 7))
  }

  // 초기 데이터 로드
  useEffect(() => {
    // 반려견 정보 불러오기 - 백엔드 연결 시 API 호출로 대체
    // GET /api/pets/:petId
    const savedPetInfo = getData("petInfo")
    if (savedPetInfo) {
      setPetInfo(savedPetInfo)
    }

    // 현재 날짜 설정
    const today = new Date()
    const formattedDate = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, "0")}.${String(today.getDate()).padStart(2, "0")}`
    setDate(formattedDate)

    // 오늘 체크리스트 불러오기 - 백엔드 연결 시 API 호출로 대체
    // GET /api/pets/:petId/healthChecks?date=YYYY-MM-DD
    const savedChecks = getData(`dailyCheck_${formattedDate}`)
    if (savedChecks) {
      // 저장된 데이터에 아이콘 추가
      const checksWithIcons = savedChecks.map((item) => {
        // 기본 아이콘 매핑
        let icon
        switch (item.id) {
          case "appetite":
            icon = <Bone className="h-5 w-5" />
            break
          case "energy":
            icon = <Activity className="h-5 w-5" />
            break
          case "hydration":
            icon = <Droplets className="h-5 w-5" />
            break
          case "stool":
            icon = <AlertTriangle className="h-5 w-5" />
            break
          case "sleep":
            icon = <Moon className="h-5 w-5" />
            break
          case "temperature":
            icon = <Thermometer className="h-5 w-5" />
            break
          default:
            icon = <AlertTriangle className="h-5 w-5" />
        }

        return {
          ...item,
          icon,
        }
      })

      setCheckItems(checksWithIcons)
      setCompletedToday(true)
    }

    // 건강 데이터 불러오기 - 백엔드 연결 시 API 호출로 대체
    // GET /api/pets/:petId/health
    const savedHealthData = getData("healthData")
    if (savedHealthData) {
      setHealthData(savedHealthData)

      // 기존 데이터가 있으면 상태 업데이트
      if (savedHealthData.walkDistance) setWalkDistance(savedHealthData.walkDistance)
      if (savedHealthData.walkTime) setWalkTime(savedHealthData.walkTime)
      if (savedHealthData.weight) setWeight(savedHealthData.weight)
    }

    // 건강 체크 기록 불러오기 (최근 7일) - 백엔드 연결 시 API 호출로 대체
    // GET /api/pets/:petId/healthChecks?limit=7
    const history = []
    for (let i = 0; i < 7; i++) {
      const pastDate = new Date()
      pastDate.setDate(today.getDate() - i)
      const pastFormattedDate = `${pastDate.getFullYear()}.${String(pastDate.getMonth() + 1).padStart(2, "0")}.${String(pastDate.getDate()).padStart(2, "0")}`
      const pastChecks = getData(`dailyCheck_${pastFormattedDate}`)
      if (pastChecks) {
        history.push({
          date: pastFormattedDate,
          checks: pastChecks,
        })
      }
    }
    setHealthHistory(history)
  }, [])

  // 상태 변경 핸들러
  const handleStatusChange = (id: string, value: string | number) => {
    setCheckItems(
      checkItems.map((item) => {
        if (item.id === id) {
          const updatedItem = {
            ...item,
            value,
            checked: true,
            status: typeof value === "string" && value !== "normal" && value !== "" ? "abnormal" : "normal",
          }
          return updatedItem
        }
        return item
      }),
    )
  }

  // 메모 변경 핸들러
  const handleNoteChange = (id: string, note: string) => {
    setCheckItems(checkItems.map((item) => (item.id === id ? { ...item, note } : item)))
  }

  // 건강 체크 폼 초기화
  const resetHealthForm = () => {
    setCheckItems(
      checkItems.map((item) => ({
        ...item,
        checked: false,
        status: "normal",
        value: item.isNumeric ? (item.id === "temperature" ? 38.5 : item.id === "sleep" ? 8 : 200) : "",
        note: "",
      })),
    )
    setCompletedToday(false)
  }

  /**
   * 산책 기록 제출 함수
   *
   * 백엔드 연결 시 다음과 같은 API 호출로 대체:
   * - POST /api/pets/:petId/activities/walk
   */
  const handleWalkSubmit = () => {
    if (walkDistance <= 0 || walkTime <= 0) {
      toast({
        title: "산책 정보를 입력해주세요",
        variant: "destructive",
      })
      return
    }

    const now = new Date()
    const timeString = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`

    const newActivity = {
      type: "walk",
      date,
      time: timeString,
      description: `${walkDistance}km 산책 (${walkTime}분)`,
      distance: walkDistance,
      duration: walkTime,
    }

    const updatedHealthData = {
      ...healthData,
      walkDistance,
      walkTime,
      activities: [newActivity, ...(healthData?.activities || []).slice(0, 49)],
    }

    saveData("healthData", updatedHealthData)
    setHealthData(updatedHealthData)

    toast({
      title: "산책 기록이 저장되었습니다",
    })
  }

  /**
   * 사료 급여 기록 제출 함수
   *
   * 백엔드 연결 시 다음과 같은 API 호출로 대체:
   * - POST /api/pets/:petId/activities/feed
   */
  const handleFeedSubmit = () => {
    if (!feedBrand || !feedTime || feedAmount <= 0) {
      toast({
        title: "사료 정보를 모두 입력해주세요",
        variant: "destructive",
      })
      return
    }

    const newActivity = {
      type: "feed",
      date,
      time: feedTime,
      description: `${feedBrand} ${feedAmount}g`,
      brand: feedBrand,
      amount: feedAmount,
    }

    const updatedHealthData = {
      ...healthData,
      feedAmount,
      activities: [newActivity, ...(healthData?.activities || []).slice(0, 49)],
    }

    saveData("healthData", updatedHealthData)
    setHealthData(updatedHealthData)
    setFeedTime("")
    setFeedBrand("")

    toast({
      title: "사료 급여 기록이 저장되었습니다",
    })
  }

  /**
   * 물 섭취 기록 제출 함수
   *
   * 백엔드 연결 시 다음과 같은 API 호출로 대체:
   * - POST /api/pets/:petId/activities/water
   */
  const handleWaterSubmit = () => {
    if (waterCount <= 0) {
      toast({
        title: "물 섭취 횟수를 입력해주세요",
        variant: "destructive",
      })
      return
    }

    if (waterAmount <= 0) {
      toast({
        title: "물 섭취량을 입력해주세요",
        variant: "destructive",
      })
      return
    }

    const now = new Date()
    const timeString = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`

    const description = `물 섭취 ${waterCount}회 (${waterAmount}ml)`

    const newActivity = {
      type: "water",
      date,
      time: timeString,
      description,
      count: waterCount,
      amount: waterAmount,
    }

    const updatedHealthData = {
      ...healthData,
      waterCount: (healthData?.waterCount || 0) + waterCount,
      waterAmount: (healthData?.waterAmount || 0) + waterAmount,
      activities: [newActivity, ...(healthData?.activities || []).slice(0, 49)],
    }

    saveData("healthData", updatedHealthData)
    setHealthData(updatedHealthData)

    toast({
      title: "물 섭취 기록이 저장되었습니다",
    })
  }

  /**
   * 체중 기록 제출 함수
   *
   * 백엔드 연결 시 다음과 같은 API 호출로 대체:
   * - POST /api/pets/:petId/weight
   */
  const handleWeightSubmit = () => {
    if (weight <= 0) {
      toast({
        title: "체중을 입력해주세요",
        variant: "destructive",
      })
      return
    }

    const now = new Date()
    const timeString = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`

    const newActivity = {
      type: "weight",
      date,
      time: timeString,
      description: `체중 측정: ${weight}kg`,
      weight,
    }

    // 체중 기록 배열 업데이트
    const weights = healthData?.weights || []
    weights.push({
      date,
      weight,
      time: timeString,
    })

    // 초기 체중이 없는 경우 현재 체중을 초기 체중으로 설정
    const initialWeight = healthData?.initialWeight || weight

    const updatedHealthData = {
      ...healthData,
      weight,
      initialWeight,
      weights,
      activities: [newActivity, ...(healthData?.activities || []).slice(0, 49)],
    }

    saveData("healthData", updatedHealthData)
    setHealthData(updatedHealthData)

    toast({
      title: "체중 기록이 저장되었습니다",
    })
  }

  // 건강 체크 데이터를 그래프용 데이터로 변환
  const getChartData = (itemId: string) => {
    const item = checkItems.find((i) => i.id === itemId)
    if (!item || !item.isNumeric) return []

    return healthHistory
      .filter((h) => h.checks.some((c) => c.id === itemId && c.checked))
      .map((h) => ({
        date: h.date.split(".").slice(1).join("/"),
        value: h.checks.find((c) => c.id === itemId).value,
      }))
      .reverse()
  }

  // 오늘 기록된 활동만 필터링
  const getTodayActivities = () => {
    if (!healthData?.activities) return []
    return healthData.activities.filter((activity) => activity.date === date)
  }

  // 활동 표시 (오늘만 또는 전체)
  const activitiesToShow = todayOnly ? getTodayActivities() : healthData?.activities || []

  return (
    <div className="min-h-screen bg-pink-50 pb-20">
      <div className="bg-pink-200 p-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/dashboard" className="text-gray-800">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-bold text-gray-800 ml-4">{todayOnly ? "오늘의 기록" : "건강기록"}</h1>
        </div>
        <Badge variant="outline" className="bg-white">
          {date}
        </Badge>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-5 space-y-6"
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-5 bg-pink-50 p-1 rounded-lg">
            <TabsTrigger
              value="health"
              className="rounded-md data-[state=active]:bg-pink-200 text-gray-700 data-[state=active]:text-gray-800"
            >
              건강체크
            </TabsTrigger>
            <TabsTrigger
              value="walk"
              className="rounded-md data-[state=active]:bg-blue-200 text-gray-700 data-[state=active]:text-gray-800"
            >
              산책
            </TabsTrigger>
            <TabsTrigger
              value="feed"
              className="rounded-md data-[state=active]:bg-amber-200 text-gray-700 data-[state=active]:text-gray-800"
            >
              사료
            </TabsTrigger>
            <TabsTrigger
              value="water"
              className="rounded-md data-[state=active]:bg-purple-200 text-gray-700 data-[state=active]:text-gray-800"
            >
              물
            </TabsTrigger>
            <TabsTrigger
              value="weight"
              className="rounded-md data-[state=active]:bg-green-200 text-gray-700 data-[state=active]:text-gray-800"
            >
              체중
            </TabsTrigger>
          </TabsList>

          {/* 건강 체크 탭 */}
          <TabsContent value="health" className="mt-4">
            {!todayOnly && (
              <Tabs defaultValue="current" value={historyTab} onValueChange={setHistoryTab}>
                <TabsList className="w-full bg-pink-50 p-1 rounded-lg">
                  <TabsTrigger value="current" className="flex-1 rounded-md data-[state=active]:bg-white">
                    오늘의 체크
                  </TabsTrigger>
                  <TabsTrigger value="history" className="flex-1 rounded-md data-[state=active]:bg-white">
                    건강 추이
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="current">
                  <HealthCheckForm
                    petInfo={petInfo}
                    checkItems={checkItems}
                    completedToday={completedToday}
                    isSubmitting={isSubmitting}
                    handleStatusChange={handleStatusChange}
                    handleNoteChange={handleNoteChange}
                    handleHealthSubmit={handleHealthSubmit}
                    resetHealthForm={resetHealthForm}
                  />
                </TabsContent>
                <TabsContent value="history">
                  <HealthHistory checkItems={checkItems} healthHistory={healthHistory} getChartData={getChartData} />
                </TabsContent>
              </Tabs>
            )}

            {todayOnly && (
              <HealthCheckForm
                petInfo={petInfo}
                checkItems={checkItems}
                completedToday={completedToday}
                isSubmitting={isSubmitting}
                handleStatusChange={handleStatusChange}
                handleNoteChange={handleNoteChange}
                handleHealthSubmit={handleHealthSubmit}
                resetHealthForm={resetHealthForm}
              />
            )}
          </TabsContent>

          {/* 산책 탭 */}
          <TabsContent value="walk" className="mt-4">
            <Card className="bg-white rounded-xl shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">산책 기록</h2>
                    <p className="text-sm text-gray-600">오늘의 산책 거리와 시간을 기록하세요.</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>산책 거리</Label>
                    <div className="flex justify-center">
                      <NumberPicker
                        value={walkDistance}
                        onChange={setWalkDistance}
                        min={0}
                        max={10}
                        step={0.5}
                        unit="km"
                        precision={1}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>산책 시간</Label>
                    <div className="flex justify-center">
                      <NumberPicker
                        value={walkTime}
                        onChange={setWalkTime}
                        min={5}
                        max={180}
                        step={5}
                        unit="분"
                        precision={0}
                      />
                    </div>
                  </div>
                </div>

                <Button className="w-full mt-6 bg-blue-500 hover:bg-blue-600 text-white" onClick={handleWalkSubmit}>
                  산책 기록하기
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 사료 탭 */}
          <TabsContent value="feed" className="mt-4">
            <Card className="bg-white rounded-xl shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                    <Bone className="w-6 h-6 text-amber-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">사료 급여 기록</h2>
                    <p className="text-sm text-gray-600">오늘 급여한 사료의 정보를 기록하세요.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="feedTime">시간</Label>
                    <Input
                      id="feedTime"
                      type="time"
                      className="rounded-lg border-gray-300"
                      value={feedTime}
                      onChange={(e) => setFeedTime(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="feedBrand">브랜드명</Label>
                    <Input
                      id="feedBrand"
                      placeholder="사료 브랜드를 입력해주세요"
                      className="rounded-lg border-gray-300"
                      value={feedBrand}
                      onChange={(e) => setFeedBrand(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="feedAmount">양</Label>
                    <div className="flex justify-center">
                      <NumberPicker
                        value={feedAmount}
                        onChange={setFeedAmount}
                        min={0}
                        max={500}
                        step={50}
                        unit="g"
                        precision={0}
                      />
                    </div>
                  </div>
                </div>

                <Button className="w-full mt-6 bg-amber-500 hover:bg-amber-600 text-white" onClick={handleFeedSubmit}>
                  사료 기록하기
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 물 탭 */}
          <TabsContent value="water" className="mt-4">
            <Card className="bg-white rounded-xl shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Droplets className="w-6 h-6 text-purple-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">물 섭취 기록</h2>
                    <p className="text-sm text-gray-600">오늘 마신 물의 정보를 기록하세요.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>물 섭취 횟수</Label>
                    <div className="flex justify-center">
                      <NumberPicker
                        value={waterCount}
                        onChange={setWaterCount}
                        min={1}
                        max={20}
                        step={1}
                        unit="회"
                        precision={0}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>물 섭취량</Label>
                    <div className="flex justify-center">
                      <NumberPicker
                        value={waterAmount}
                        onChange={setWaterAmount}
                        min={50}
                        max={1000}
                        step={50}
                        unit="ml"
                        precision={0}
                      />
                    </div>
                  </div>
                </div>

                <Button
                  className="w-full mt-6 bg-purple-500 hover:bg-purple-600 text-white"
                  onClick={handleWaterSubmit}
                >
                  물 섭취 기록하기
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 체중 탭 */}
          <TabsContent value="weight" className="mt-4">
            <Card className="bg-white rounded-xl shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Scale className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">체중 기록</h2>
                    <p className="text-sm text-gray-600">오늘의 체중을 기록하세요.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>체중</Label>
                    <div className="flex justify-center">
                      <NumberPicker
                        value={weight}
                        onChange={setWeight}
                        min={0.5}
                        max={50}
                        step={0.1}
                        unit="kg"
                        precision={1}
                      />
                    </div>
                  </div>

                  {healthData?.weight && (
                    <div className="flex items-center justify-between text-sm text-gray-500 mt-2">
                      <span>이전 체중: {healthData.weight} kg</span>
                      <span>초기 체중: {healthData.initialWeight || "기록 없음"} kg</span>
                    </div>
                  )}
                </div>

                <Button className="w-full mt-6 bg-green-500 hover:bg-green-600 text-white" onClick={handleWeightSubmit}>
                  체중 기록하기
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 최근 기록 섹션 */}
        {activitiesToShow.length > 0 && (
          <Card className="bg-white rounded-xl shadow-sm">
            <CardContent className="p-5">
              <h3 className="font-semibold text-gray-800 mb-3">{todayOnly ? "오늘의 기록" : "최근 기록"}</h3>
              <div className="space-y-3">
                {activitiesToShow.slice(0, 5).map((activity: any, index: number) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="bg-pink-50 p-2 rounded-full">
                      {activity.type === "feed" ? (
                        <Bone className="w-5 h-5 text-amber-500" />
                      ) : activity.type === "walk" ? (
                        <MapPin className="w-5 h-5 text-blue-500" />
                      ) : activity.type === "water" ? (
                        <Droplets className="w-5 h-5 text-purple-500" />
                      ) : activity.type === "health" ? (
                        <Activity className="w-5 h-5 text-pink-500" />
                      ) : activity.type === "weight" ? (
                        <Scale className="w-5 h-5 text-green-500" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-gray-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-800">
                          {activity.type === "feed"
                            ? "사료 급여"
                            : activity.type === "walk"
                              ? "산책"
                              : activity.type === "water"
                                ? "물 섭취"
                                : activity.type === "health"
                                  ? "건강 체크"
                                  : activity.type === "weight"
                                    ? "체중 측정"
                                    : "메모"}
                        </span>
                        <span className="text-xs text-gray-500">{activity.time}</span>
                      </div>
                      <p className="text-xs text-gray-600">{activity.description}</p>
                    </div>
                  </div>
                ))}
                {!todayOnly && activitiesToShow.length > 5 && (
                  <Link href="/report" className="text-pink-500 text-sm font-medium block text-center mt-2">
                    더 보기
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  )
}

/**
 * 건강 체크 폼 컴포넌트
 *
 * 백엔드 연결 시 props 타입을 명확히 정의하고,
 * API 응답 데이터 구조에 맞게 수정해야 합니다.
 */
function HealthCheckForm({
  petInfo,
  checkItems,
  completedToday,
  isSubmitting,
  handleStatusChange,
  handleNoteChange,
  handleHealthSubmit,
  resetHealthForm,
}) {
  return (
    <Card className="bg-white rounded-xl shadow-sm mt-4">
      <CardContent className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
            <Check className="w-6 h-6 text-pink-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">{petInfo?.name || "반려견"}의 건강 체크</h2>
            <p className="text-sm text-gray-600">건강 상태를 체크하여 이상 징후를 조기에 발견하세요.</p>
          </div>
        </div>

        {completedToday ? (
          <div className="bg-green-50 p-4 rounded-lg mb-4 text-center">
            <p className="text-green-700 font-medium">오늘의 건강 체크를 완료했습니다! 🎉</p>
            <Button variant="outline" className="mt-2" onClick={resetHealthForm}>
              다시 체크하기
            </Button>
          </div>
        ) : null}

        <div className="space-y-4 mt-4">
          {checkItems.map((item) => (
            <div
              key={item.id}
              className={`border rounded-lg p-4 ${item.checked ? "border-green-200 bg-green-50/30" : ""}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <motion.div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${item.checked ? "bg-green-100" : "bg-gray-100"}`}
                    animate={{
                      scale: item.checked ? [1, 1.1, 1] : 1,
                      backgroundColor: item.checked ? "#dcfce7" : "#f3f4f6",
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <span className={item.checked ? item.iconColor : "text-gray-400"}>{item.icon}</span>
                  </motion.div>
                  <span className="font-medium">{item.label}</span>
                </div>
                <Badge
                  variant="outline"
                  className={`${item.checked ? "bg-green-100 text-green-800 border-green-200" : "bg-gray-100 text-gray-500"}`}
                >
                  {item.checked ? "체크 완료" : "체크 필요"}
                </Badge>
              </div>

              <div className="pt-2">
                {item.isNumeric ? (
                  <div className="space-y-2">
                    <Label htmlFor={`value-${item.id}`} className="text-sm text-gray-600">
                      {item.label} 수치를 입력해주세요
                    </Label>
                    <div className="flex justify-center">
                      <NumberPicker
                        value={Number(item.value)}
                        onChange={(value) => handleStatusChange(item.id, value)}
                        min={item.min || 0}
                        max={item.max || 100}
                        step={item.step || 1}
                        unit={item.unit || ""}
                        precision={item.precision || 1}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-600">상태를 선택해주세요</Label>
                    <RadioGroup
                      value={item.value as string}
                      onValueChange={(value) => handleStatusChange(item.id, value)}
                      className="flex flex-wrap gap-2"
                      disabled={completedToday}
                    >
                      {item.options?.map((option) => (
                        <div key={option.value} className="flex items-center space-x-2">
                          <RadioGroupItem
                            value={option.value}
                            id={`${item.id}-${option.value}`}
                            className={option.value === "normal" ? "text-green-600" : "text-amber-600"}
                          />
                          <Label
                            htmlFor={`${item.id}-${option.value}`}
                            className={`text-sm ${option.value === "normal" ? "text-green-600" : option.value === "less" || option.value === "soft" ? "text-amber-600" : "text-red-600"}`}
                          >
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                )}

                <Textarea
                  placeholder={`${item.label}에 대한 특이사항이 있다면 메모해주세요.`}
                  className="mt-3"
                  value={item.note}
                  onChange={(e) => handleNoteChange(item.id, e.target.value)}
                  disabled={completedToday}
                />
              </div>
            </div>
          ))}
        </div>

        {!completedToday && (
          <Button
            className="w-full mt-6 bg-pink-500 hover:bg-pink-600 text-white"
            onClick={handleHealthSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "저장 중..." : "건강 체크 완료"}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * 건강 추이 컴포넌트
 *
 * 백엔드 연결 시 props 타입을 명확히 정의하고,
 * API 응답 데이터 구조에 맞게 수정해야 합니다.
 */
function HealthHistory({ checkItems, healthHistory, getChartData }) {
  return (
    <Card className="bg-white rounded-xl shadow-sm mt-4">
      <CardContent className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <LineChart className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">건강 추이</h2>
            <p className="text-sm text-gray-600">지난 7일간의 건강 상태 변화를 확인하세요.</p>
          </div>
        </div>

        {healthHistory.length > 0 ? (
          <div className="space-y-6">
            {checkItems
              .filter((item) => item.isNumeric)
              .map((item) => {
                const chartData = getChartData(item.id)
                return (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center bg-${item.iconColor.split("-")[0]}-100`}
                      >
                        <span className={item.iconColor}>{item.icon}</span>
                      </div>
                      <span className="font-medium">{item.label} 추이</span>
                    </div>

                    {chartData.length > 1 ? (
                      <div className="h-40 mt-2">
                        <HealthChart
                          data={chartData}
                          label={`${item.label} (${item.unit})`}
                          color={item.iconColor.split("-")[0]}
                        />
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        데이터가 충분하지 않습니다. 매일 건강 체크를 완료하면 그래프가 표시됩니다.
                      </div>
                    )}
                  </div>
                )
              })}

            {/* 비수치 데이터 요약 */}
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-3">최근 건강 상태 요약</h3>
              <div className="space-y-3">
                {checkItems
                  .filter((item) => !item.isNumeric)
                  .map((item) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center bg-${item.iconColor.split("-")[0]}-100`}
                      >
                        <span className={item.iconColor}>{item.icon}</span>
                      </div>
                      <span className="text-sm">{item.label}:</span>
                      <span className="text-sm font-medium">
                        {healthHistory.length > 0 &&
                        healthHistory[0].checks.find((c) => c.id === item.id)?.value === "normal"
                          ? "정상"
                          : "주의 필요"}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">아직 기록된 건강 체크 데이터가 없습니다.</p>
            <p className="text-gray-500 text-sm mt-1">매일 건강 체크를 완료하면 건강 추이를 확인할 수 있습니다.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * 건강 차트 컴포넌트
 *
 * 백엔드 연결 시 차트 라이브러리(Recharts, Chart.js 등)로 대체하는 것을 고려하세요.
 * 이 컴포넌트는 간단한 SVG 기반 차트를 제공합니다.
 */
function HealthChart({ data, label, color = "blue" }) {
  if (!data || data.length < 2) return null

  const maxValue = Math.max(...data.map((d) => d.value)) * 1.1
  const minValue = Math.min(...data.map((d) => d.value)) * 0.9

  const chartHeight = 150
  const chartWidth = 300
  const padding = 30

  const xScale = (chartWidth - padding * 2) / (data.length - 1)
  const yScale = (chartHeight - padding * 2) / (maxValue - minValue)

  const points = data
    .map((d, i) => {
      const x = padding + i * xScale
      const y = chartHeight - padding - (d.value - minValue) * yScale
      return `${x},${y}`
    })
    .join(" ")

  return (
    <div className="w-full h-full flex items-center justify-center">
      <svg width="100%" height="100%" viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="xMidYMid meet">
        {/* Y축 */}
        <line x1={padding} y1={padding} x2={padding} y2={chartHeight - padding} stroke="#e5e7eb" strokeWidth="1" />

        {/* X축 */}
        <line
          x1={padding}
          y1={chartHeight - padding}
          x2={chartWidth - padding}
          y2={chartHeight - padding}
          stroke="#e5e7eb"
          strokeWidth="1"
        />

        {/* 데이터 라인 */}
        <polyline fill="none" stroke={`var(--${color}-500)`} strokeWidth="2" points={points} />

        {/* 데이터 포인트 */}
        {data.map((d, i) => {
          const x = padding + i * xScale
          const y = chartHeight - padding - (d.value - minValue) * yScale
          return (
            <g key={i}>
              <circle cx={x} cy={y} r="4" fill="white" stroke={`var(--${color}-500)`} strokeWidth="2" />
              <text x={x} y={y - 10} textAnchor="middle" fontSize="10" fill="gray">
                {d.value}
              </text>
            </g>
          )
        })}

        {/* X축 레이블 */}
        {data.map((d, i) => {
          const x = padding + i * xScale
          return (
            <text key={i} x={x} y={chartHeight - 10} textAnchor="middle" fontSize="8" fill="gray">
              {d.date}
            </text>
          )
        })}

        {/* Y축 레이블 */}
        <text
          x="10"
          y={chartHeight / 2}
          textAnchor="middle"
          fontSize="10"
          fill="gray"
          transform={`rotate(-90, 10, ${chartHeight / 2})`}
        >
          {label}
        </text>
      </svg>
    </div>
  )
}
