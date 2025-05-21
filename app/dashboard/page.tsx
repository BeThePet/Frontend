"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Dog,
  Bone,
  Brain,
  BarChart3,
  Heart,
  MapPin,
  Droplets,
  Scale,
  Calendar,
  Pill,
  AlertTriangle,
  Clock,
  Check,
} from "lucide-react"
import { motion } from "framer-motion"
import { getData } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { LinkButton } from "@/components/link-button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false)
  const [petInfo, setPetInfo] = useState<any>(null)
  const [healthData, setHealthData] = useState<any>(null)
  const [medications, setMedications] = useState<any[]>([])
  const [todayChecked, setTodayChecked] = useState(false)

  useEffect(() => {
    setMounted(true)

    // 백엔드 연결 시 API 호출로 대체
    // GET /api/pets/:petId - 반려견 정보 가져오기
    const savedPetInfo = getData("petInfo")
    if (savedPetInfo) {
      setPetInfo(savedPetInfo)
    }

    // 백엔드 연결 시 API 호출로 대체
    // GET /api/pets/:petId/health - 건강 데이터 가져오기
    const savedHealthData = getData("healthData")
    if (savedHealthData) {
      setHealthData(savedHealthData)
    }

    // 백엔드 연결 시 API 호출로 대체
    // GET /api/pets/:petId/medications - 약 정보 가져오기
    const savedMedications = getData("medications")
    if (savedMedications) {
      setMedications(savedMedications)
    }

    // 백엔드 연결 시 API 호출로 대체
    // GET /api/pets/:petId/dailyChecks?date=YYYY-MM-DD - 오늘의 체크 여부 확인
    const today = new Date()
    const formattedDate = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, "0")}.${String(today.getDate()).padStart(2, "0")}`
    const todayCheck = getData(`dailyCheck_${formattedDate}`)
    setTodayChecked(!!todayCheck)
  }, [])

  if (!mounted) return null

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  }

  // 나이 계산 함수
  const calculateAge = (birthday: string) => {
    if (!birthday) return "나이 정보 없음"

    const birthDate = new Date(birthday)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()

    // 생일이 아직 지나지 않았으면 나이에서 1을 뺌
    if (
      today.getMonth() < birthDate.getMonth() ||
      (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())
    ) {
      age--
    }

    return `${age}살`
  }

  // 오늘 복용할 약 필터링
  const todayMedications = medications.filter((med) => med.isActive)

  // 오늘 날짜 구하기
  const today = new Date()
  const formattedDate = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, "0")}.${String(today.getDate()).padStart(2, "0")}`

  // 오늘 기록된 활동만 필터링
  const todayActivities = healthData?.activities
    ? healthData.activities.filter((activity) => activity.date === formattedDate)
    : []

  return (
    <div className="min-h-screen bg-pink-50 dashboard-landscape overflow-y-auto">
      {/* 상단: 로고 및 반려견 프로필 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-pink-200 rounded-b-3xl p-6 shadow-md profile-section"
      >
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-800">멍멍케어</h1>
          <p className="text-sm text-gray-600">반려견 건강 파트너</p>
        </div>
        <Link href="/info" className="block">
          <div className="flex items-center gap-4 mt-4 bg-white p-3 rounded-xl shadow-sm border-2 border-pink-100">
            <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center">
              {petInfo?.photoUrl ? (
                <Image
                  src={petInfo.photoUrl || "/placeholder.svg"}
                  alt={petInfo.name || "반려견"}
                  width={64}
                  height={64}
                  className="rounded-full object-cover w-full h-full"
                />
              ) : (
                <Dog className="w-8 h-8 text-pink-400" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">{petInfo?.name || "반려견 정보 입력"}</h2>
              <div className="flex gap-3 text-sm text-gray-600">
                {petInfo ? (
                  <>
                    <span>{calculateAge(petInfo.birthday)}</span>
                    <span>•</span>
                    <span>{petInfo.gender === "male" ? "남아" : petInfo.gender === "female" ? "여아" : ""}</span>
                    {healthData?.weight && (
                      <>
                        <span>•</span>
                        <span>{healthData.weight}kg</span>
                      </>
                    )}
                  </>
                ) : (
                  <span className="text-pink-500">정보를 입력해주세요 →</span>
                )}
              </div>
            </div>
          </div>
        </Link>
      </motion.div>

      {/* 서비스 카드 */}
      <div className="px-5 py-4">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">서비스</h3>
        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-4 gap-3">
          <motion.div variants={item}>
            <ServiceCard href="/health-record" icon={<Check className="w-6 h-6 text-green-500" />} title="건강기록" />
          </motion.div>
          <motion.div variants={item}>
            <ServiceCard href="/report/medication" icon={<Pill className="w-6 h-6 text-pink-500" />} title="약 관리" />
          </motion.div>
          <motion.div variants={item}>
            <ServiceCard href="/report" icon={<BarChart3 className="w-6 h-6 text-green-500" />} title="리포트" />
          </motion.div>
          <motion.div variants={item}>
            <ServiceCard href="/info" icon={<Dog className="w-6 h-6 text-pink-500" />} title="정보관리" />
          </motion.div>
          <motion.div variants={item}>
            <ServiceCard
              href="/emergency"
              icon={<AlertTriangle className="w-6 h-6 text-red-500" />}
              title="응급가이드"
            />
          </motion.div>
          <motion.div variants={item}>
            <ServiceCard href="/ai-assistant" icon={<Brain className="w-6 h-6 text-purple-500" />} title="AI 챗봇" />
          </motion.div>
          <motion.div variants={item}>
            <ServiceCard href="/food" icon={<Bone className="w-6 h-6 text-blue-500" />} title="사료추천" />
          </motion.div>
          <motion.div variants={item}>
            <ServiceCard href="/mbti" icon={<Heart className="w-6 h-6 text-pink-500" />} title="MBTI" />
          </motion.div>
        </motion.div>
      </div>

      {/* 건강 체크 및 약 복용 알림 */}
      <div className="px-5 py-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="space-y-3"
        >
          {/* 일일 건강 체크 카드 */}
          <Link href="/health-record?today=true">
            <Card
              className={`bg-white rounded-xl shadow-sm border-2 ${todayChecked ? "border-green-100" : "border-amber-100"}`}
            >
              <CardContent className="p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${todayChecked ? "bg-green-100" : "bg-amber-100"}`}
                  >
                    {todayChecked ? (
                      <Calendar className="w-5 h-5 text-green-600" />
                    ) : (
                      <Calendar className="w-5 h-5 text-amber-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">오늘의 기록</h3>
                    <p className="text-xs text-gray-600">
                      {todayChecked ? "오늘의 건강 체크를 완료했습니다." : "오늘의 건강 체크가 필요합니다."}
                    </p>
                  </div>
                </div>
                <Badge
                  variant={todayChecked ? "outline" : "secondary"}
                  className={todayChecked ? "bg-green-50 text-green-700 border-green-200" : "text-gray-700"}
                >
                  {todayChecked ? "완료" : "필요"}
                </Badge>
              </CardContent>
            </Card>
          </Link>

          {/* 약 복용 알림 카드 */}
          {todayMedications.length > 0 && (
            <Link href="/report/medication">
              <Card className="bg-white rounded-xl shadow-sm border-2 border-pink-100">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-pink-100">
                        <Pill className="w-5 h-5 text-pink-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800">약 복용 알림</h3>
                        <p className="text-xs text-gray-600">
                          {todayMedications.length > 0
                            ? `오늘 복용할 약이 ${todayMedications.length}개 있어요`
                            : "등록된 약이 없어요"}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-pink-50 text-pink-700 border-pink-200">
                      {todayMedications.length}개
                    </Badge>
                  </div>

                  {todayMedications.length > 0 && (
                    <div className="mt-2 p-2 bg-pink-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-pink-500" />
                        <span className="text-sm font-medium text-pink-700">
                          {todayMedications[0].name} • {todayMedications[0].time}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          )}
        </motion.div>
      </div>

      {/* 하단: 오늘의 기록 카드 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.3 }}
        className="px-5 mt-6 pb-20"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">오늘의 기록</h3>
          <LinkButton href="/report" variant="outline" size="sm">
            자세히 보기
          </LinkButton>
        </div>
        <div className="bg-white rounded-xl shadow-sm border-2 border-pink-100 p-4">
          {/* 빠른 기록 버튼 */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            <Link href="/health-record?tab=walk">
              <Button className="w-full h-16 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-700 flex flex-col items-center justify-center">
                <MapPin className="w-5 h-5 mb-1" />
                <span className="text-xs">산책</span>
              </Button>
            </Link>
            <Link href="/health-record?tab=feed">
              <Button className="w-full h-16 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-700 flex flex-col items-center justify-center">
                <Bone className="w-5 h-5 mb-1" />
                <span className="text-xs">사료</span>
              </Button>
            </Link>
            <Link href="/health-record?tab=water">
              <Button className="w-full h-16 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-700 flex flex-col items-center justify-center">
                <Droplets className="w-5 h-5 mb-1" />
                <span className="text-xs">물</span>
              </Button>
            </Link>
            <Link href="/health-record?tab=weight">
              <Button className="w-full h-16 rounded-xl bg-green-100 hover:bg-green-200 text-green-700 flex flex-col items-center justify-center">
                <Scale className="w-5 h-5 mb-1" />
                <span className="text-xs">체중</span>
              </Button>
            </Link>
          </div>

          {todayActivities.length > 0 ? (
            <div className="space-y-4">
              {todayActivities.slice(0, 3).map((activity: any, index: number) => (
                <ActivityItem
                  key={index}
                  icon={
                    activity.type === "feed" ? (
                      <Bone className="w-5 h-5 text-amber-500" />
                    ) : activity.type === "walk" ? (
                      <MapPin className="w-5 h-5 text-blue-500" />
                    ) : activity.type === "water" ? (
                      <Droplets className="w-5 h-5 text-purple-500" />
                    ) : activity.type === "health" ? (
                      <Heart className="w-5 h-5 text-red-500" />
                    ) : (
                      <Scale className="w-5 h-5 text-green-500" />
                    )
                  }
                  title={
                    activity.type === "feed"
                      ? "사료 급여"
                      : activity.type === "walk"
                        ? "산책"
                        : activity.type === "water"
                          ? "물 섭취"
                          : activity.type === "health"
                            ? "건강 체크"
                            : "체중 측정"
                  }
                  time={activity.time}
                  description={activity.description}
                />
              ))}
              {todayActivities.length > 3 && (
                <Link
                  href="/health-record?today=true"
                  className="text-pink-500 text-sm font-medium block text-center mt-2"
                >
                  더 보기
                </Link>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500">기록된 활동이 없습니다.</p>
              <Link href="/health-record?today=true" className="text-pink-500 text-sm font-medium mt-2 inline-block">
                건강 기록하기
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

// 서비스 카드 컴포넌트
function ServiceCard({ href, icon, title }: { href: string; icon: React.ReactNode; title: string }) {
  return (
    <Link href={href}>
      <div className="bg-white hover:bg-gray-50 transition-colors rounded-xl shadow-sm border-2 border-pink-100 active:scale-95 transition-transform">
        <div className="p-3 flex flex-col items-center justify-center text-center">
          <div className="bg-pink-50 p-2 rounded-full mb-1">{icon}</div>
          <span className="text-xs font-medium text-gray-700">{title}</span>
        </div>
      </div>
    </Link>
  )
}

// 활동 항목 컴포넌트
function ActivityItem({
  icon,
  title,
  time,
  description,
}: {
  icon: React.ReactNode
  title: string
  time: string
  description: string
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="bg-pink-50 p-2 rounded-full">{icon}</div>
      <div className="flex-1">
        <div className="flex justify-between">
          <span className="text-sm font-medium text-gray-800">{title}</span>
          <span className="text-xs text-gray-500">{time}</span>
        </div>
        <p className="text-xs text-gray-600">{description}</p>
      </div>
    </div>
  )
}
