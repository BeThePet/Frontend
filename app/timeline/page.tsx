"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Calendar, Filter, Activity, Bone, Droplets, Scale, Heart, Check } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getData } from "@/lib/storage"

type TimelineActivity = {
  type: string
  date: string
  time: string
  description: string
}

export default function TimelinePage() {
  const [petInfo, setPetInfo] = useState<any>(null)
  const [activities, setActivities] = useState<TimelineActivity[]>([])
  const [filteredActivities, setFilteredActivities] = useState<TimelineActivity[]>([])
  const [filter, setFilter] = useState<string>("all")
  const [period, setPeriod] = useState<string>("week")

  useEffect(() => {
    // 반려견 정보 불러오기
    const savedPetInfo = getData("petInfo")
    if (savedPetInfo) {
      setPetInfo(savedPetInfo)
    }

    // 건강 데이터 불러오기
    const healthData = getData("healthData")
    if (healthData && healthData.activities) {
      setActivities(healthData.activities)
    }
  }, [])

  // 필터 및 기간 변경 시 활동 필터링
  useEffect(() => {
    if (activities.length === 0) return

    // 기간에 따른 필터링
    const now = new Date()
    let startDate = new Date()

    switch (period) {
      case "week":
        startDate.setDate(now.getDate() - 7)
        break
      case "month":
        startDate.setMonth(now.getMonth() - 1)
        break
      case "year":
        startDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        startDate = new Date(0) // 모든 활동
    }

    // 타입 및 기간에 따른 필터링
    const filtered = activities.filter((activity) => {
      const activityDate = parseDate(activity.date)
      const isInPeriod = activityDate >= startDate

      if (filter === "all") {
        return isInPeriod
      } else {
        return activity.type === filter && isInPeriod
      }
    })

    setFilteredActivities(filtered)
  }, [activities, filter, period])

  // 날짜 파싱 함수
  const parseDate = (dateStr: string) => {
    if (!dateStr) return new Date()

    // YYYY.MM.DD 형식 처리
    if (dateStr.includes(".")) {
      const [year, month, day] = dateStr.split(".")
      return new Date(Number(year), Number(month) - 1, Number(day))
    }

    return new Date(dateStr)
  }

  // 활동 타입에 따른 아이콘 및 색상 반환
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "walk":
        return { icon: <Activity className="h-5 w-5" />, color: "bg-blue-100 text-blue-500" }
      case "feed":
        return { icon: <Bone className="h-5 w-5" />, color: "bg-amber-100 text-amber-500" }
      case "water":
        return { icon: <Droplets className="h-5 w-5" />, color: "bg-purple-100 text-purple-500" }
      case "weight":
        return { icon: <Scale className="h-5 w-5" />, color: "bg-green-100 text-green-500" }
      case "health":
        return { icon: <Heart className="h-5 w-5" />, color: "bg-red-100 text-red-500" }
      case "vaccine":
        return { icon: <Check className="h-5 w-5" />, color: "bg-teal-100 text-teal-500" }
      default:
        return { icon: <Calendar className="h-5 w-5" />, color: "bg-gray-100 text-gray-500" }
    }
  }

  // 날짜 그룹화 함수
  const groupActivitiesByDate = (activities: TimelineActivity[]) => {
    const groups: Record<string, TimelineActivity[]> = {}

    activities.forEach((activity) => {
      const date = activity.date
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(activity)
    })

    // 날짜별로 정렬 (최신순)
    return Object.entries(groups)
      .sort(([dateA], [dateB]) => {
        return parseDate(dateB).getTime() - parseDate(dateA).getTime()
      })
      .map(([date, activities]) => ({
        date,
        activities: activities.sort((a, b) => {
          // 같은 날짜 내에서는 시간순으로 정렬
          const timeA = a.time.split(" ")[1] || ""
          const timeB = b.time.split(" ")[1] || ""
          return timeB.localeCompare(timeA)
        }),
      }))
  }

  const groupedActivities = groupActivitiesByDate(filteredActivities)

  // 날짜 포맷팅 함수
  const formatDate = (dateStr: string) => {
    const date = parseDate(dateStr)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)

    // 오늘, 어제 표시
    if (date.toDateString() === today.toDateString()) {
      return "오늘"
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "어제"
    } else {
      return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`
    }
  }

  return (
    <div className="min-h-screen bg-beige pb-20">
      <div className="bg-lavender-light p-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/dashboard" className="text-gray-800">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-bold text-gray-800 ml-4">건강 타임라인</h1>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[120px] h-8 text-sm">
              <SelectValue placeholder="모든 활동" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">모든 활동</SelectItem>
              <SelectItem value="walk">산책</SelectItem>
              <SelectItem value="feed">사료</SelectItem>
              <SelectItem value="water">물</SelectItem>
              <SelectItem value="weight">체중</SelectItem>
              <SelectItem value="health">건강 체크</SelectItem>
              <SelectItem value="vaccine">예방접종</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-5 space-y-6"
      >
        <Card className="bg-white rounded-xl shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-lavender-light rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-lavender-DEFAULT" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">{petInfo?.name || "반려견"}의 건강 타임라인</h2>
                <p className="text-sm text-gray-600">모든 건강 활동을 한눈에 확인하세요.</p>
              </div>
            </div>

            {/* 기간 선택 */}
            <div className="flex gap-2 mb-6">
              <Button
                variant={period === "week" ? "default" : "outline"}
                size="sm"
                onClick={() => setPeriod("week")}
                className={period === "week" ? "bg-lavender-DEFAULT hover:bg-lavender-dark" : ""}
              >
                최근 1주일
              </Button>
              <Button
                variant={period === "month" ? "default" : "outline"}
                size="sm"
                onClick={() => setPeriod("month")}
                className={period === "month" ? "bg-lavender-DEFAULT hover:bg-lavender-dark" : ""}
              >
                최근 1개월
              </Button>
              <Button
                variant={period === "year" ? "default" : "outline"}
                size="sm"
                onClick={() => setPeriod("year")}
                className={period === "year" ? "bg-lavender-DEFAULT hover:bg-lavender-dark" : ""}
              >
                최근 1년
              </Button>
              <Button
                variant={period === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setPeriod("all")}
                className={period === "all" ? "bg-lavender-DEFAULT hover:bg-lavender-dark" : ""}
              >
                전체
              </Button>
            </div>

            {/* 타임라인 */}
            {groupedActivities.length > 0 ? (
              <div className="space-y-6">
                {groupedActivities.map(({ date, activities }) => (
                  <div key={date} className="relative">
                    <div className="sticky top-0 z-10 bg-white py-2">
                      <Badge variant="outline" className="bg-lavender-50 text-lavender-dark border-lavender-200">
                        {formatDate(date)}
                      </Badge>
                    </div>
                    <div className="ml-4 mt-2 border-l-2 border-lavender-200 pl-6 space-y-4">
                      {activities.map((activity, index) => {
                        const { icon, color } = getActivityIcon(activity.type)
                        return (
                          <div key={index} className="relative">
                            <div className="absolute -left-10 mt-1 w-4 h-4 rounded-full bg-lavender-DEFAULT" />
                            <Card className="bg-white shadow-sm">
                              <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${color}`}>
                                    {icon}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                      <div className="font-medium text-gray-800">
                                        {activity.type === "walk"
                                          ? "산책"
                                          : activity.type === "feed"
                                            ? "사료 급여"
                                            : activity.type === "water"
                                              ? "물 급여"
                                              : activity.type === "weight"
                                                ? "체중 측정"
                                                : activity.type === "health"
                                                  ? "건강 체크"
                                                  : activity.type === "vaccine"
                                                    ? "예방접종"
                                                    : "기타 활동"}
                                      </div>
                                      <span className="text-xs text-gray-500">{activity.time.split(" ")[1] || ""}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">기록된 활동이 없습니다.</p>
                <Button variant="outline" className="mt-4">
                  <Link href="/report/add">활동 기록하기</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
