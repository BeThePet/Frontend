"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  Calendar,
  FileText,
  Scale,
  Pill,
  Bell,
  Heart,
  Bone,
  PawPrint,
  Stethoscope,
  Syringe,
  Thermometer,
  Clipboard,
  Settings,
  LogOut,
} from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getData, saveData } from "@/lib/storage"
import { LinkButton } from "@/components/ui/link-button"

export default function DashboardContent() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [petInfo, setPetInfo] = useState<any>(null)
  const [medications, setMedications] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    const loadData = async () => {
      try {
        // 로그인 상태 확인 (예시: localStorage에서 토큰 확인)
        const token = localStorage.getItem("token")
        setIsLoggedIn(!!token)

        // 반려견 정보 불러오기
        const savedPetInfo = getData("petInfo")
        if (savedPetInfo) {
          setPetInfo(savedPetInfo)
        }

        // 약 정보 불러오기
        const savedMedications = getData("medications")
        if (savedMedications) {
          setMedications(savedMedications)
        }
      } catch (error) {
        console.error("데이터 로딩 중 오류:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  // 반려견 정보가 없고 로딩이 완료된 경우에만 리디렉션
  useEffect(() => {
    if (!isLoading && !petInfo && mounted) {
      router.push("/info")
    }
  }, [isLoading, petInfo, mounted, router])

  // 로딩 중이면 로딩 화면 표시
  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen bg-beige flex justify-center items-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  // 비로그인 상태일 때 데모 UI 표시
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-beige pb-20">
        <div className="bg-blue-light p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <PawPrint className="w-6 h-6 text-blue-DEFAULT" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-800">멍멍케어 체험하기</h1>
                <p className="text-sm text-gray-600">서비스를 먼저 둘러보세요!</p>
              </div>
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="p-5 space-y-6"
        >
          {/* 데모 프로필 카드 */}
          <Card className="bg-white rounded-xl shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20">
                  <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center">
                    <PawPrint className="w-8 h-8 text-gray-400" />
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">댕댕이</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      포메라니안
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Bone className="w-4 h-4" />
                      <span>3살</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Scale className="w-4 h-4" />
                      <span>4.2kg</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 로그인 유도 카드 */}
          <Card className="bg-white rounded-xl shadow-sm border-pink-100">
            <CardContent className="p-5">
              <div className="text-center">
                <h3 className="font-bold text-gray-800 mb-2">나만의 반려견 프로필 만들기</h3>
                <p className="text-sm text-gray-600 mb-4">
                  로그인하고 반려견 정보를 등록하면<br />
                  더 많은 기능을 이용할 수 있어요
                </p>
                <Link href="/login">
                  <Button className="w-full bg-pink-500 hover:bg-pink-600">
                    로그인하고 시작하기
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* 기존 건강 관리 메뉴와 기타 섹션들 (읽기 전용) */}
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
          {petInfo && petInfo.isActive && (
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
                  {medications.slice(0, 2).map((med: any) => (
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

          {/* 건강 기록 */}
          <Card className="bg-white rounded-xl shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-semibold text-gray-800">건강 기록</CardTitle>
                <LinkButton href="/health-record" variant="outline" size="sm">
                  모두 보기
                </LinkButton>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-3">
                <Link href="/health-record?tab=health">
                  <Button
                    variant="outline"
                    className="w-full h-16 justify-start gap-3 border-gray-200"
                  >
                    <Stethoscope className="w-5 h-5 text-pink-500" />
                    <div className="text-left">
                      <div className="font-medium">건강 체크</div>
                      <div className="text-xs text-gray-500">매일 체크하기</div>
                    </div>
                  </Button>
                </Link>
                <Link href="/health-record?tab=weight">
                  <Button
                    variant="outline"
                    className="w-full h-16 justify-start gap-3 border-gray-200"
                  >
                    <Scale className="w-5 h-5 text-purple-500" />
                    <div className="text-left">
                      <div className="font-medium">체중 기록</div>
                      <div className="text-xs text-gray-500">변화 추이 보기</div>
                    </div>
                  </Button>
                </Link>
                <Link href="/report/vaccine">
                  <Button
                    variant="outline"
                    className="w-full h-16 justify-start gap-3 border-gray-200"
                  >
                    <Syringe className="w-5 h-5 text-green-500" />
                    <div className="text-left">
                      <div className="font-medium">예방접종</div>
                      <div className="text-xs text-gray-500">접종 내역 확인</div>
                    </div>
                  </Button>
                </Link>
                <Link href="/report/medical">
                  <Button
                    variant="outline"
                    className="w-full h-16 justify-start gap-3 border-gray-200"
                  >
                    <Clipboard className="w-5 h-5 text-blue-500" />
                    <div className="text-left">
                      <div className="font-medium">진료 기록</div>
                      <div className="text-xs text-gray-500">병원 방문 기록</div>
                    </div>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  // 로그인 상태에서 반려견 미등록 시
  if (!petInfo) {
    return (
      <div className="min-h-screen bg-beige flex flex-col items-center justify-center p-6">
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <PawPrint className="w-12 h-12 text-pink-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">반려견 정보 등록하기</h2>
          <p className="text-gray-600 mb-6">
            반려견 정보를 등록하고<br />
            맞춤형 건강 관리를 시작해보세요
          </p>
          <Link href="/info">
            <Button className="w-full max-w-xs bg-pink-500 hover:bg-pink-600">
              반려견 등록하기
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  // 활성화된 약 목록
  const activeMedications = medications.filter((med: any) => med.isActive)

  return (
    <div className="min-h-screen bg-beige pb-20">
      {/* 헤더 */}
      <div className="bg-blue-light p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <PawPrint className="w-6 h-6 text-blue-DEFAULT" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">{petInfo?.name || "반려견"}의 건강수첩</h1>
              <p className="text-sm text-gray-600">오늘도 건강한 하루 보내세요!</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/settings">
              <Button size="icon" variant="ghost" className="text-gray-600">
                <Settings className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/auth/logout">
              <Button size="icon" variant="ghost" className="text-gray-600">
                <LogOut className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-5 space-y-6"
      >
        {/* 반려견 프로필 */}
        <Card className="bg-white rounded-xl shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20">
                {petInfo?.image ? (
                  <Image
                    src={petInfo.image}
                    alt="반려견 프로필"
                    fill
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center">
                    <PawPrint className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">{petInfo?.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {petInfo?.breed}
                  </Badge>
                  {petInfo?.mbti && (
                    <Badge variant="outline" className="bg-pink-50 text-pink-700 border-pink-200">
                      {petInfo.mbti}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Bone className="w-4 h-4" />
                    <span>{petInfo?.age}살</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Scale className="w-4 h-4" />
                    <span>{petInfo?.weight}kg</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Heart className="w-4 h-4" />
                    <span>{petInfo?.gender}</span>
                  </div>
                </div>
              </div>
            </div>
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
                {activeMedications.slice(0, 2).map((med: any) => (
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

        {/* 건강 기록 */}
        <Card className="bg-white rounded-xl shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-semibold text-gray-800">건강 기록</CardTitle>
              <LinkButton href="/health-record" variant="outline" size="sm">
                모두 보기
              </LinkButton>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 gap-3">
              <Link href="/health-record?tab=health">
                <Button
                  variant="outline"
                  className="w-full h-16 justify-start gap-3 border-gray-200"
                >
                  <Stethoscope className="w-5 h-5 text-pink-500" />
                  <div className="text-left">
                    <div className="font-medium">건강 체크</div>
                    <div className="text-xs text-gray-500">매일 체크하기</div>
                  </div>
                </Button>
              </Link>
              <Link href="/health-record?tab=weight">
                <Button
                  variant="outline"
                  className="w-full h-16 justify-start gap-3 border-gray-200"
                >
                  <Scale className="w-5 h-5 text-purple-500" />
                  <div className="text-left">
                    <div className="font-medium">체중 기록</div>
                    <div className="text-xs text-gray-500">변화 추이 보기</div>
                  </div>
                </Button>
              </Link>
              <Link href="/report/vaccine">
                <Button
                  variant="outline"
                  className="w-full h-16 justify-start gap-3 border-gray-200"
                >
                  <Syringe className="w-5 h-5 text-green-500" />
                  <div className="text-left">
                    <div className="font-medium">예방접종</div>
                    <div className="text-xs text-gray-500">접종 내역 확인</div>
                  </div>
                </Button>
              </Link>
              <Link href="/report/medical">
                <Button
                  variant="outline"
                  className="w-full h-16 justify-start gap-3 border-gray-200"
                >
                  <Clipboard className="w-5 h-5 text-blue-500" />
                  <div className="text-left">
                    <div className="font-medium">진료 기록</div>
                    <div className="text-xs text-gray-500">병원 방문 기록</div>
                  </div>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
} 