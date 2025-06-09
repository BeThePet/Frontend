"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Check, Bell, Save } from "lucide-react"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { motion } from "framer-motion"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { vaccineApi, VaccineType, VaccinationRequest, VaccinationResponse } from "@/lib/api"

export default function VaccineContent() {
  const router = useRouter()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [hospital, setHospital] = useState("")
  const [memo, setMemo] = useState("")
  
  // API 데이터 상태
  const [vaccineTypes, setVaccineTypes] = useState<VaccineType[]>([])
  const [vaccinations, setVaccinations] = useState<VaccinationResponse[]>([])
  const [selectedVaccines, setSelectedVaccines] = useState<Record<string, any>>({})

  useEffect(() => {
    setMounted(true)
    loadData()
  }, [])

  // 데이터 로드 함수
  const loadData = async () => {
    try {
      setIsLoading(true)

      // 백신 타입과 접종 기록 병렬로 로드
      const [vaccineTypesData, vaccinationsData] = await Promise.all([
        vaccineApi.getVaccineTypes(),
        vaccineApi.getVaccinations()
      ])

      setVaccineTypes(vaccineTypesData)
      setVaccinations(vaccinationsData)

      // 기존 접종 기록으로 선택 상태 초기화
      const initialSelected: Record<string, any> = {}
      
      vaccinationsData.forEach((vaccination) => {
        initialSelected[vaccination.vaccine_id] = {
          selected: true,
          date: new Date(vaccination.date),
          hospital: vaccination.hospital || "",
          memo: vaccination.memo || "",
          vaccinationId: vaccination.id
        }
      })

      setSelectedVaccines(initialSelected)
      
      // 마지막으로 입력된 병원명과 메모 설정
      if (vaccinationsData.length > 0) {
        const lastVaccination = vaccinationsData[vaccinationsData.length - 1]
        setHospital(lastVaccination.hospital || "")
        setMemo(lastVaccination.memo || "")
      }

    } catch (error) {
      console.error("데이터 로드 실패:", error)
      toast({
        title: "데이터 로드 실패",
        description: "백신 정보를 불러오는데 실패했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!mounted) {
    return null
  }

  // 백신 선택 토글 핸들러
  const toggleVaccine = (id: string) => {
    setSelectedVaccines((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        selected: prev[id]?.selected ? false : true,
      },
    }))
  }

  // 백신 날짜 변경 핸들러
  const handleDateChange = async (id: string, dateStr: string) => {
    if (!dateStr) return

    const date = new Date(dateStr)

    setSelectedVaccines((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] || {}),
        selected: true,
        date: date,
      },
    }))

    // 자동 저장
    await saveVaccineData(id, dateStr)
  }

  // 백신 데이터 자동 저장
  const saveVaccineData = async (vaccineId: string, date: string) => {
    try {
      const vaccine = vaccineTypes.find((v) => v.id === vaccineId)
      if (!vaccine) return

      const vaccinationData: VaccinationRequest = {
        vaccine_id: vaccineId,
        date: date,
        hospital: hospital || undefined,
        memo: memo || undefined,
      }

      const existingVaccination = vaccinations.find(v => v.vaccine_id === vaccineId)
      
      if (existingVaccination) {
        // 기존 접종 기록 업데이트
        await vaccineApi.updateVaccination(existingVaccination.id, vaccinationData)
      } else {
        // 새 접종 기록 생성
        await vaccineApi.createVaccination(vaccinationData)
      }

      // 데이터 새로고침
      await loadData()

      // 토스트 메시지 표시
      const formattedDate = format(date, "yyyy.MM.dd", { locale: ko })
      toast({
        title: "백신 날짜가 저장되었습니다",
        description: `${vaccine.name}: ${formattedDate}`,
      })

    } catch (error) {
      console.error("백신 데이터 저장 실패:", error)
      toast({
        title: "저장 실패",
        description: "백신 정보 저장에 실패했습니다.",
        variant: "destructive",
      })
    }
  }

  // 병원 정보 변경 핸들러
  const handleHospitalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHospital(e.target.value)
  }

  // 메모 변경 핸들러
  const handleMemoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMemo(e.target.value)
  }

  // 모든 변경사항 저장
  const handleSaveAll = async () => {
    setIsSubmitting(true)

    try {
      // 선택된 백신들에 대해 병원과 메모 정보 업데이트
      const updatePromises = Object.entries(selectedVaccines)
        .filter(([_, data]) => data.selected && data.date)
        .map(async ([vaccineId, data]) => {
          const vaccinationData: VaccinationRequest = {
            vaccine_id: vaccineId,
            date: format(data.date, "yyyy-MM-dd"),
            hospital: hospital || undefined,
            memo: memo || undefined,
          }

          const existingVaccination = vaccinations.find(v => v.vaccine_id === vaccineId)
          
          if (existingVaccination) {
            return vaccineApi.updateVaccination(existingVaccination.id, vaccinationData)
          } else {
            return vaccineApi.createVaccination(vaccinationData)
          }
        })

      await Promise.all(updatePromises)

      // 성공 메시지 표시
      toast({
        title: "모든 정보가 저장되었습니다",
        description: "백신 접종 기록이 성공적으로 저장되었습니다.",
      })

      // 잠시 후 리포트 페이지로 이동
      setTimeout(() => {
        router.push("/report")
      }, 1000)

    } catch (error) {
      console.error("저장 실패:", error)
      toast({
        title: "저장 실패",
        description: "백신 정보 저장에 실패했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FFF8F0] flex justify-center items-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFF8F0] pb-20 overflow-y-auto">
      <div className="bg-[#FBD6E4] p-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/report" className="text-gray-800">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-bold text-gray-800 ml-4">백신 접종 기록 💉</h1>
        </div>
        <Button onClick={handleSaveAll} size="sm" className="rounded-full bg-white text-pink-500 shadow-sm">
          <Save className="w-4 h-4 mr-1" />
          저장하기
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-5 space-y-6"
      >
        {/* 백신 선택 섹션 */}
        <Card className="bg-white rounded-xl shadow-sm">
          <CardContent className="p-5">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">백신 접종 기록 💉</h2>
            <p className="text-sm text-gray-600 mb-4">백신을 선택하고 접종일을 입력해주세요.</p>

            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <h3 className="font-medium text-pink-600">필수 백신 🔴</h3>
              </div>
              <ScrollArea className="h-[250px] pr-4">
                <div className="space-y-3">
                  {vaccineTypes
                    .filter((v) => v.category === "필수")
                    .map((vaccine) => (
                      <VaccineItem
                        key={vaccine.id}
                        vaccine={vaccine}
                        isSelected={!!selectedVaccines[vaccine.id]?.selected}
                        date={selectedVaccines[vaccine.id]?.date}
                        onToggle={() => toggleVaccine(vaccine.id)}
                        onDateChange={(dateStr) => handleDateChange(vaccine.id, dateStr)}
                      />
                    ))}
                </div>
              </ScrollArea>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <h3 className="font-medium text-blue-600">선택 백신 🔵</h3>
              </div>
              <ScrollArea className="h-[250px] pr-4">
                <div className="space-y-3">
                  {vaccineTypes
                    .filter((v) => v.category === "선택")
                    .map((vaccine) => (
                      <VaccineItem
                        key={vaccine.id}
                        vaccine={vaccine}
                        isSelected={!!selectedVaccines[vaccine.id]?.selected}
                        date={selectedVaccines[vaccine.id]?.date}
                        onToggle={() => toggleVaccine(vaccine.id)}
                        onDateChange={(dateStr) => handleDateChange(vaccine.id, dateStr)}
                      />
                    ))}
                </div>
              </ScrollArea>
            </div>
          </CardContent>
        </Card>

        {/* 접종 병원 */}
        <Card className="bg-white rounded-xl shadow-sm">
          <CardContent className="p-5">
            <Label htmlFor="hospital" className="text-lg font-semibold text-gray-800 mb-4 block">
              접종 병원
            </Label>
            <Input
              id="hospital"
              placeholder="병원 이름을 입력해주세요"
              className="rounded-lg border-gray-300 h-12"
              value={hospital}
              onChange={handleHospitalChange}
            />
          </CardContent>
        </Card>

        {/* 메모 */}
        <Card className="bg-white rounded-xl shadow-sm">
          <CardContent className="p-5">
            <Label htmlFor="memo" className="text-lg font-semibold text-gray-800 mb-4 block">
              메모
            </Label>
            <Input
              id="memo"
              placeholder="특이사항이 있으면 입력해주세요"
              className="rounded-lg border-gray-300 h-12"
              value={memo}
              onChange={handleMemoChange}
            />
          </CardContent>
        </Card>

        {/* 저장 버튼 */}
        <Button
          onClick={handleSaveAll}
          disabled={isSubmitting}
          className="w-full h-14 rounded-full bg-gradient-to-r from-[#FBD6E4] to-[#f5c0d5] hover:opacity-90 text-gray-800 text-lg font-semibold shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-gray-800 border-t-transparent rounded-full animate-spin"></div>
              <span>저장 중...</span>
            </div>
          ) : (
            <>
              <Check className="w-5 h-5" />
              <span>모든 정보 저장하기</span>
            </>
          )}
        </Button>
      </motion.div>
    </div>
  )
}

// 백신 항목 컴포넌트
function VaccineItem({
  vaccine,
  isSelected,
  date,
  onToggle,
  onDateChange,
}: {
  vaccine: VaccineType
  isSelected: boolean
  date?: Date | null
  onToggle: () => void
  onDateChange: (dateStr: string) => void
}) {
  return (
    <div
      className={`rounded-xl overflow-hidden transition-all border ${
        isSelected
          ? vaccine.category === "필수"
            ? "bg-pink-50 border-pink-200"
            : "bg-blue-50 border-blue-200"
          : "bg-gray-50 border-gray-200"
      }`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`vaccine-${vaccine.id}`}
                  checked={isSelected}
                  onChange={onToggle}
                  className="w-5 h-5 rounded-md border-gray-300 text-pink-500 focus:ring-pink-500"
                />
                <Label htmlFor={`vaccine-${vaccine.id}`} className="text-base font-medium text-gray-800 cursor-pointer">
                  {vaccine.name}
                </Label>
              </div>
              <Badge variant="outline" className={vaccine.category === "필수" ? "bg-pink-50" : "bg-blue-50"}>
                {vaccine.category}
              </Badge>
            </div>
            <p className="text-xs text-gray-600 mt-1 ml-7">{vaccine.description}</p>

            <div className="mt-3 ml-7">
              <Label className="text-sm text-gray-700 mb-1 block">접종일</Label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  className="w-full h-10 px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  value={date ? format(date, "yyyy-MM-dd") : ""}
                  onChange={(e) => onDateChange(e.target.value)}
                />
                {date && (
                  <div className="flex items-center text-xs text-green-600">
                    <Bell className="w-3 h-3 mr-1" />
                    <span>저장됨</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 