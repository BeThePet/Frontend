"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
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
  PawPrint,
  Settings,
  LogOut,
  User,
  Edit,
} from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getData, saveData } from "@/lib/storage"
import { LinkButton } from "@/components/ui/link-button"
import { userApi, medicationApi, dogApi, healthApi, MedicationResponse } from "@/lib/api"

export default function DashboardContent() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [petInfo, setPetInfo] = useState<any>(null)
  const [petProfileImageUrl, setPetProfileImageUrl] = useState<string>("")
  const [imageLoadError, setImageLoadError] = useState(false)
  const [healthData, setHealthData] = useState<any>(null)
  const [medications, setMedications] = useState<MedicationResponse[]>([])
  const [todayChecked, setTodayChecked] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showUserInfoModal, setShowUserInfoModal] = useState(false)
  const [userInfo, setUserInfo] = useState<any>(null)

  useEffect(() => {
    setMounted(true)
    
    const loadData = async () => {
      try {
        // 로그인 상태 확인 및 사용자 정보 로드
        let userLoggedIn = false
        try {
          const userData = await userApi.getCurrentUser()
          setUserInfo(userData)
          setIsLoggedIn(true)
          userLoggedIn = true
        } catch (error) {
          console.error("사용자 정보 로드 실패:", error)
          setIsLoggedIn(false)
        }

        // 반려견 정보 불러오기 (백엔드 API 우선, localStorage 백업)
        if (userLoggedIn) {
          try {
            // 반려견 정보와 이미지를 병렬로 가져오기
            const [dogInfo, imageInfo] = await Promise.all([
              dogApi.getDogInfo(),
              dogApi.getDogImageUrl().catch(() => ({ profile_image_url: null }))
            ])
            
            if (dogInfo) {
              // 백엔드 응답을 프론트엔드 형태로 변환
              const petData = {
                id: dogInfo.id,
                name: dogInfo.name,
                birthday: dogInfo.birth_date,
                breedId: null, // breed_name을 통해 breed_id 찾기 필요
                gender: dogInfo.gender,
                weight: dogInfo.weight,
                ageGroup: dogInfo.age_group,
                medicine: dogInfo.medication,
                breed: dogInfo.breed_name, // 대시보드에서는 breed 이름 표시
                allergy_names: dogInfo.allergy_names,
                disease_names: dogInfo.disease_names
              }
              setPetInfo(petData)
              
              // 프로필 이미지 URL 설정 (API 응답 우선, 없으면 dogInfo에서)
              setPetProfileImageUrl(imageInfo.profile_image_url || dogInfo.profile_image_url || "")
              setImageLoadError(false) // 이미지 에러 상태 리셋
              
              // 백엔드 데이터를 localStorage에도 백업 저장
              localStorage.setItem('registeredPetInfo', JSON.stringify(petData))
            } else {
              // 백엔드에 반려견 정보가 없으면 localStorage 확인
              const savedPetInfo = localStorage.getItem('registeredPetInfo')
              if (savedPetInfo) {
                setPetInfo(JSON.parse(savedPetInfo))
              }
            }
          } catch (error) {
            console.error("백엔드에서 반려견 정보 로드 실패:", error)
            // 백엔드 실패 시 localStorage에서 데이터 로드
            const savedPetInfo = localStorage.getItem('registeredPetInfo')
            if (savedPetInfo) {
              setPetInfo(JSON.parse(savedPetInfo))
            }
          }
        } else {
          // 비로그인 상태에서는 localStorage만 확인
          const savedPetInfo = localStorage.getItem('registeredPetInfo')
          if (savedPetInfo) {
            setPetInfo(JSON.parse(savedPetInfo))
          }
        }

        // 약 정보 불러오기 (API 호출) - 로그인 상태에서만
        if (userLoggedIn) {
          try {
            const medicationData = await medicationApi.getMedications()
            setMedications(medicationData)
          } catch (error) {
            console.error("약물 데이터 로드 실패:", error)
            setMedications([])
          }
        }

        // 건강 데이터 불러오기 (백엔드 API 사용) - 로그인 상태에서만
        if (userLoggedIn) {
          try {
            // 오늘 건강체크 데이터 확인
            const todayHealthChecks = await healthApi.getTodayHealthChecks()
            setTodayChecked(todayHealthChecks.length > 0)
            console.log('오늘 건강체크 기록:', todayHealthChecks.length, '개')

            // 모든 건강 기록들을 가져와서 활동 데이터 구성
            const allHealthChecks = await healthApi.getHealthChecks()
            const walkRecords = await healthApi.getWalkRecords()
            const foodRecords = await healthApi.getFoodRecords()
            const waterRecords = await healthApi.getWaterRecords()
            const weightRecords = await healthApi.getWeightRecords()

            // 활동 데이터 통합 (최근 7일)
            const sevenDaysAgo = new Date()
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
            
            const activities: any[] = []

            // 건강체크 기록 추가
            allHealthChecks.forEach((record: any) => {
              const recordDate = new Date(record.created_at)
              if (recordDate >= sevenDaysAgo) {
                // 대시보드 형식 (YYYY.MM.DD)으로 변환
                const formattedDate = `${recordDate.getFullYear()}.${String(recordDate.getMonth() + 1).padStart(2, "0")}.${String(recordDate.getDate()).padStart(2, "0")}`
                activities.push({
                  type: "health",
                  date: formattedDate,
                  time: recordDate.toTimeString().substring(0, 5),
                  description: `${record.category}: ${record.status || '기록됨'}`,
                  category: record.category,
                  status: record.status
                })
              }
            })

            // 산책 기록 추가
            walkRecords.forEach((record: any) => {
              const recordDate = new Date(record.created_at)
              if (recordDate >= sevenDaysAgo) {
                const formattedDate = `${recordDate.getFullYear()}.${String(recordDate.getMonth() + 1).padStart(2, "0")}.${String(recordDate.getDate()).padStart(2, "0")}`
                activities.push({
                  type: "walk",
                  date: formattedDate,
                  time: recordDate.toTimeString().substring(0, 5),
                  description: `산책: ${record.distance_km}km, ${record.duration_min}분`,
                  distance_km: record.distance_km,
                  duration_min: record.duration_min
                })
              }
            })

            // 사료 기록 추가
            foodRecords.forEach((record: any) => {
              const recordDate = new Date(record.created_at)
              if (recordDate >= sevenDaysAgo) {
                const formattedDate = `${recordDate.getFullYear()}.${String(recordDate.getMonth() + 1).padStart(2, "0")}.${String(recordDate.getDate()).padStart(2, "0")}`
                activities.push({
                  type: "feed",
                  date: formattedDate,
                  time: record.time,
                  description: `사료: ${record.amount_g}g${record.brand ? ` (${record.brand})` : ''}`,
                  amount_g: record.amount_g,
                  brand: record.brand
                })
              }
            })

            // 물 기록 추가
            waterRecords.forEach((record: any) => {
              const recordDate = new Date(record.created_at)
              if (recordDate >= sevenDaysAgo) {
                const formattedDate = `${recordDate.getFullYear()}.${String(recordDate.getMonth() + 1).padStart(2, "0")}.${String(recordDate.getDate()).padStart(2, "0")}`
                activities.push({
                  type: "water",
                  date: formattedDate,
                  time: recordDate.toTimeString().substring(0, 5),
                  description: `물 섭취: ${record.amount_ml}ml`,
                  amount_ml: record.amount_ml
                })
              }
            })

            // 체중 기록 추가
            weightRecords.forEach((record: any) => {
              const recordDate = new Date(record.created_at)
              if (recordDate >= sevenDaysAgo) {
                const formattedDate = `${recordDate.getFullYear()}.${String(recordDate.getMonth() + 1).padStart(2, "0")}.${String(recordDate.getDate()).padStart(2, "0")}`
                activities.push({
                  type: "weight",
                  date: formattedDate,
                  time: recordDate.toTimeString().substring(0, 5),
                  description: `체중 측정: ${record.weight_kg}kg`,
                  weight_kg: record.weight_kg
                })
              }
            })

            // 날짜순으로 정렬 (최신순)
            activities.sort((a, b) => {
              const dateA = new Date(`${a.date} ${a.time}`)
              const dateB = new Date(`${b.date} ${b.time}`)
              return dateB.getTime() - dateA.getTime()
            })

            setHealthData({ activities, healthChecks: allHealthChecks })
            console.log('백엔드에서 가져온 활동 기록:', activities.length, '개')

          } catch (error) {
            console.error("건강 데이터 조회 실패:", error)
            // API 실패 시 로컬 스토리지 백업 사용
            const savedHealthData = getData("healthData")
            if (savedHealthData) {
              setHealthData(savedHealthData)
            }
            
            const today = new Date()
            const formattedDate = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, "0")}.${String(today.getDate()).padStart(2, "0")}`
            const todayCheck = getData(`dailyCheck_${formattedDate}`)
            setTodayChecked(!!todayCheck)
          }
        }

      } catch (error) {
        console.error("데이터 로딩 중 오류:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  // 리디렉션 로직 제거 - 대시보드에서 직접 등록 유도 UI 표시

  // 나이 계산 함수
  const calculateAge = (birthday: string) => {
    if (!birthday) return "나이 정보 없음"

    const birthDate = new Date(birthday)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()

    if (
      today.getMonth() < birthDate.getMonth() ||
      (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())
    ) {
      age--
    }

    return `${age}살`
  }

  const handleLogout = async () => {
    if (!confirm('로그아웃 하시겠습니까?')) {
      return
    }

    try {
      await userApi.logout()
      setIsLoggedIn(false)
      setUserInfo(null)
      setPetInfo(null)
      router.push("/")
    } catch (error) {
      console.error('로그아웃 실패:', error)
      alert('로그아웃 중 오류가 발생했습니다.')
    }
  }

  // 로딩 중이면 로딩 화면 표시
  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen bg-beige flex justify-center items-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  // 비로그인 상태일 때는 로그인 유도 메시지 포함

  // 로그인 상태에서 반려견 미등록 시는 대시보드 내에서 처리

  // 오늘 복용할 약 필터링 (현재 날짜가 복용 기간 내이고 오늘이 복용 요일인 약물)
  const todayMedications = medications.filter((med) => {
    const today = new Date().toISOString().split('T')[0]
    const startDate = med.start_date
    const endDate = med.end_date
    
    // 시작날짜 체크
    if (today < startDate) return false
    
    // 종료날짜가 있으면 체크, 없으면 계속 복용
    if (endDate && today > endDate) return false

    // 오늘이 복용 요일인지 확인
    const weekdays = ['일', '월', '화', '수', '목', '금', '토']
    const todayWeekday = weekdays[new Date().getDay()]
    const weekdaysList = med.weekdays.split(', ').map(day => day.trim())
    
    return weekdaysList.includes(todayWeekday)
  })

  // 오늘 날짜 구하기
  const today = new Date()
  const formattedDate = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, "0")}.${String(today.getDate()).padStart(2, "0")}`

  // 오늘 기록된 활동만 필터링
  const todayActivities = healthData?.activities
    ? healthData.activities.filter((activity: any) => activity.date === formattedDate)
    : []

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

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    if (!dateString) return "정보 없음"
    
    try {
      const date = new Date(dateString)
      return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`
    } catch (error) {
      return "정보 없음"
    }
  }

  return (
    <div className="min-h-screen bg-pink-50 dashboard-landscape overflow-y-auto">
      {/* 상단: 로고, 반려견 프로필, 설정 및 로그아웃 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-pink-200 rounded-b-3xl p-6 shadow-md profile-section"
      >
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">멍멍케어</h1>
            <p className="text-sm text-gray-600">
              {!isLoggedIn ? "서비스를 체험해보세요" : "반려견 건강 파트너"}
            </p>
          </div>
          
          {/* 설정 및 로그아웃 버튼 */}
          {isLoggedIn && (
            <div className="flex gap-2">
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="bg-white/80 hover:bg-white"
                >
                  <Settings className="w-5 h-5 text-gray-600" />
                </Button>
                
                {/* 사용자 메뉴 드롭다운 */}
                {showUserMenu && (
                  <div className="absolute right-0 top-12 bg-white rounded-lg shadow-lg border border-gray-200 p-2 min-w-48 z-10">
                    {userInfo && (
                      <div className="px-3 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-800">{userInfo.nickname}</p>
                        <p className="text-xs text-gray-500">{userInfo.email}</p>
                      </div>
                    )}
                    <Link href="/info/detail">
                      <div className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded">
                        <Edit className="w-4 h-4" />
                        반려견 정보 관리
                      </div>
                    </Link>
                    <button
                      onClick={() => {
                        setShowUserMenu(false)
                        setShowUserInfoModal(true)
                      }}
                      className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded"
                    >
                      <User className="w-4 h-4" />
                      내 정보
                    </button>
                  </div>
                )}
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="bg-white/80 hover:bg-white"
              >
                <LogOut className="w-5 h-5 text-gray-600" />
              </Button>
            </div>
          )}
        </div>

        {/* 반려견 프로필 카드 */}
        {petInfo ? (
          <Link href="/info/detail" className="block">
            <div className="flex items-center gap-4 mt-4 bg-white p-4 rounded-xl shadow-sm border-2 border-pink-100 hover:border-pink-200 hover:shadow-md transition-all duration-200">
              <div className="relative">
                <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center overflow-hidden ring-2 ring-pink-200">
                  {petProfileImageUrl && !imageLoadError ? (
                    <Image
                      src={petProfileImageUrl}
                      alt={petInfo.name || "반려견"}
                      width={80}
                      height={80}
                      className="rounded-full object-cover w-full h-full"
                      onError={() => setImageLoadError(true)}
                    />
                  ) : (
                    <Dog className="w-10 h-10 text-pink-400" />
                  )}
                </div>
                {/* 온라인 표시 (선택적) */}
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                  <PawPrint className="w-3 h-3 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold text-gray-800">{petInfo.name}</h2>
                  <Badge variant="secondary" className="text-xs bg-pink-50 text-pink-700 border-pink-200">
                    {petInfo.ageGroup}
                  </Badge>
                </div>
                <div className="flex gap-3 text-sm text-gray-600 mb-1">
                  <span>{calculateAge(petInfo.birthday)}</span>
                  <span>•</span>
                  <span>{petInfo.gender === "남아" ? "♂ 남아" : petInfo.gender === "여아" ? "♀ 여아" : petInfo.gender}</span>
                  {petInfo.weight && (
                    <>
                      <span>•</span>
                      <span>{petInfo.weight}kg</span>
                    </>
                  )}
                </div>
                {petInfo.breed && (
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <Dog className="w-3 h-3" />
                    {petInfo.breed}
                  </div>
                )}
              </div>
            </div>
          </Link>
        ) : (
          <Link href="/info" className="block">
            <div className="flex items-center gap-4 mt-4 bg-white p-3 rounded-xl shadow-sm border-2 border-pink-100 hover:border-pink-200 transition-colors">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center">
                <Dog className="w-8 h-8 text-pink-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">반려견 정보 등록하기</h2>
                <div className="flex gap-3 text-sm text-gray-600">
                  <span className="text-pink-500">정보를 입력해주세요 →</span>
                </div>
              </div>
            </div>
          </Link>
        )}
      </motion.div>

      {/* 서비스 카드 */}
      <div className="px-5 py-4">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">서비스</h3>
        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-4 gap-3">
          <motion.div variants={item}>
            <ServiceCard href="/health-record" icon={<Check className="w-6 h-6 text-green-500" />} title="건강기록" />
          </motion.div>
          <motion.div variants={item}>
            <ServiceCard href="/medication" icon={<Pill className="w-6 h-6 text-pink-500" />} title="약 관리" />
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

      {/* 건강 체크 및 약 복용 알림 - 로그인 상태에서만 표시 */}
      {isLoggedIn && (
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
              <Link href="/medication">
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
                            {todayMedications[0].name} • {todayMedications[0].time.substring(0, 5)}
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
      )}

      {/* 하단: 오늘의 기록 카드 또는 로그인 유도 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.3 }}
        className="px-5 mt-6 pb-20"
      >
        {!isLoggedIn ? (
          // 비로그인 상태일 때 로그인 유도 카드
          <Card className="bg-white rounded-xl shadow-sm border-pink-100">
            <CardContent className="p-5">
              <div className="text-center">
                <h3 className="font-bold text-gray-800 mb-2">더 많은 기능을 이용하세요</h3>
                <p className="text-sm text-gray-600 mb-4">
                  로그인하고 반려견 정보를 등록하면<br />
                  맞춤형 건강 관리 서비스를 이용할 수 있어요
                </p>
                <Link href="/login">
                  <Button className="w-full bg-pink-500 hover:bg-pink-600">
                    로그인하고 시작하기
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          // 로그인 상태일 때 오늘의 기록 카드
          <>
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
          </>
        )}
      </motion.div>

      {/* 사용자 정보 모달 */}
      {showUserInfoModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl shadow-xl max-w-sm w-full mx-4"
          >
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">내 정보</h2>
              <button
                onClick={() => setShowUserInfoModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 모달 내용 */}
            <div className="p-6 space-y-6">
              {userInfo && (
                <>
                  {/* 프로필 아이콘 */}
                  <div className="flex justify-center">
                    <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center">
                      <User className="w-10 h-10 text-pink-500" />
                    </div>
                  </div>

                  {/* 사용자 정보 */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">닉네임</label>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-gray-800 font-medium">{userInfo.nickname}</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">이메일</label>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-gray-800">{userInfo.email}</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">가입일</label>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-gray-800">{formatDate(userInfo.created_at)}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* 로그아웃 버튼 */}
            <div className="p-6 pt-0">
              <button
                onClick={() => {
                  setShowUserInfoModal(false)
                  handleLogout()
                }}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                로그아웃
              </button>
            </div>
          </motion.div>
        </div>
      )}
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