"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Activity } from "lucide-react"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSearchParams } from "next/navigation"
import { getData } from "@/lib/storage"
import { dogApi } from "@/lib/api"
import HealthCheckForm from "@/components/health-record/HealthCheckForm"
import WalkForm from "@/components/health-record/WalkForm"
import FeedForm from "@/components/health-record/FeedForm"
import WaterForm from "@/components/health-record/WaterForm"
import WeightForm from "@/components/health-record/WeightForm"

export default function HealthRecordPage() {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get("tab") || "health"
  // daily 파라미터를 health로 매핑
  const initialTab = tabParam === "daily" ? "health" : tabParam
  const todayOnly = searchParams.get("today") === "true"

  const [petInfo, setPetInfo] = useState<any>(null)
  const [date, setDate] = useState<string>("")
  const [activeTab, setActiveTab] = useState(initialTab)
  const [isLoading, setIsLoading] = useState(true)
  const [hasPetInfo, setHasPetInfo] = useState(false)

  // 초기 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        // 백엔드에서 반려견 정보 불러오기
        const backendPetInfo = await dogApi.getDogInfo()
        if (backendPetInfo) {
          setPetInfo(backendPetInfo)
          setHasPetInfo(true)
          console.log('건강기록 페이지: 백엔드에서 반려견 정보 가져옴')
        } else {
          // 백엔드에서 반려견 정보가 없으면 로컬 스토리지 확인
          const savedPetInfo = getData("petInfo")
          if (savedPetInfo) {
            setPetInfo(savedPetInfo)
            setHasPetInfo(true)
            console.log('건강기록 페이지: 로컬 스토리지에서 반려견 정보 가져옴')
          } else {
            setHasPetInfo(false)
          }
        }
      } catch (error) {
        console.error('건강기록 페이지: 반려견 정보 조회 실패:', error)
        // API 실패 시 로컬 스토리지 백업 사용
        const savedPetInfo = getData("petInfo")
        if (savedPetInfo) {
          setPetInfo(savedPetInfo)
          setHasPetInfo(true)
          console.log('건강기록 페이지: API 실패로 로컬 스토리지 사용')
        } else {
          setHasPetInfo(false)
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadData()

    // 현재 날짜 설정
    const today = new Date()
    const formattedDate = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, "0")}.${String(today.getDate()).padStart(2, "0")}`
    setDate(formattedDate)
  }, [])

  // 로딩 중
  if (isLoading) {
    return (
      <div className="min-h-screen bg-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">반려견 정보를 확인하고 있습니다...</p>
        </div>
      </div>
    )
  }

  // 반려견 정보가 없을 때
  if (!hasPetInfo) {
    return (
      <div className="min-h-screen bg-pink-50">
        <div className="bg-pink-200 p-4 flex items-center">
          <Link href="/dashboard" className="text-gray-800">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-bold text-gray-800 ml-4">{todayOnly ? "오늘의 기록" : "건강기록"}</h1>
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-pink-100 max-w-md">
            <Activity className="w-16 h-16 text-pink-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">등록된 반려견이 없습니다</h2>
            <p className="text-gray-600 mb-6">
              건강 기록을 작성하려면<br />
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
            <HealthCheckForm
              petId={petInfo.id}
              date={date}
              onComplete={() => {
                // 필요한 경우 추가 작업 수행
              }}
            />
          </TabsContent>

          {/* 산책 탭 */}
          <TabsContent value="walk" className="mt-4">
            <WalkForm
              petId={petInfo.id}
              onComplete={() => {
                // 필요한 경우 추가 작업 수행
              }}
            />
          </TabsContent>

          {/* 다른 탭들은 나중에 구현 */}
          <TabsContent value="feed" className="mt-4">
            <FeedForm
              petId={petInfo.id}
              onComplete={() => {
                // 필요한 경우 추가 작업 수행
              }}
            />
          </TabsContent>

          <TabsContent value="water" className="mt-4">
            <WaterForm
              petId={petInfo.id}
              onComplete={() => {
                // 필요한 경우 추가 작업 수행
              }}
            />
          </TabsContent>

          <TabsContent value="weight" className="mt-4">
            <WeightForm
              petId={petInfo.id}
              petInfo={petInfo}
              onComplete={() => {
                // 필요한 경우 추가 작업 수행
              }}
            />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}
