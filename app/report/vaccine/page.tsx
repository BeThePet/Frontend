"use client"

import type React from "react"

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
import { saveData, getData } from "@/lib/storage"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

// 백신 데이터 정의
const vaccineTypes = [
  {
    id: "dhppl",
    name: "DHPPL (종합백신)",
    period: 365,
    category: "필수",
    description: "디스템퍼, 간염, 파보바이러스, 파라인플루엔자, 렙토스피라증",
  },
  {
    id: "rabies",
    name: "광견병 (Rabies)",
    period: 365,
    category: "필수",
    description: "치명적인 바이러스성 질환 예방 (법적 의무)",
  },
  {
    id: "heartworm",
    name: "심장사상충 예방약",
    period: 30,
    category: "필수",
    description: "모기를 통해 전염되는 기생충 예방",
  },
  {
    id: "kennel",
    name: "켄넬코프 (KC, Bordetella)",
    period: 365,
    category: "선택",
    description: "전염성 기관지염 예방",
  },
  {
    id: "corona",
    name: "코로나 장염 백신",
    period: 365,
    category: "선택",
    description: "개 코로나 바이러스 예방",
  },
  {
    id: "influenza",
    name: "인플루엔자 백신",
    period: 365,
    category: "선택",
    description: "개 인플루엔자 예방",
  },
]

export default function VaccineRecordPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hospital, setHospital] = useState("")
  const [memo, setMemo] = useState("")
  const [vaccineData, setVaccineData] = useState<any[]>([])
  const [selectedVaccines, setSelectedVaccines] = useState<Record<string, any>>({})

  // 기존 데이터 불러오기
  useEffect(() => {
    const savedVaccineData = getData("vaccineData") || []
    setVaccineData(savedVaccineData)

    // 기존 데이터로 선택 상태 초기화
    const initialSelected: Record<string, any> = {}

    savedVaccineData.forEach((vaccine: any) => {
      const foundVaccine = vaccineTypes.find((v) => v.name.includes(vaccine.name))
      if (foundVaccine) {
        initialSelected[foundVaccine.id] = {
          selected: true,
          date: vaccine.date ? new Date(vaccine.date.split(".").reverse().join("-")) : null,
          hospital: vaccine.hospital || "",
          memo: vaccine.memo || "",
        }
      }
    })

    setSelectedVaccines(initialSelected)
  }, [])

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
  const handleDateChange = (id: string, dateStr: string) => {
    // 날짜 문자열을 Date 객체로 변환
    const dateParts = dateStr.split("-")
    const year = Number.parseInt(dateParts[0])
    const month = Number.parseInt(dateParts[1]) - 1 // 월은 0부터 시작
    const day = Number.parseInt(dateParts[2])

    const date = new Date(year, month, day)

    setSelectedVaccines((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] || {}),
        selected: true,
        date: date,
      },
    }))

    // 자동 저장
    saveVaccineData(id, date)
  }

  // 백신 데이터 자동 저장
  const saveVaccineData = (id: string, date: Date) => {
    const vaccine = vaccineTypes.find((v) => v.id === id)
    if (!vaccine) return

    // 기존 데이터에서 해당 백신 찾기
    const existingIndex = vaccineData.findIndex((v) => v.id === id || v.name.includes(vaccine.name))

    const formattedDate = format(date, "yyyy.MM.dd", { locale: ko })

    // 새 백신 데이터 생성
    const newVaccineRecord = {
      id: id,
      name: vaccine.name,
      date: formattedDate,
      status: "완료",
      hospital: hospital || "미입력",
      memo: memo || "",
    }

    // 기존 데이터 업데이트 또는 새 데이터 추가
    const updatedVaccineData = [...vaccineData]
    if (existingIndex >= 0) {
      updatedVaccineData[existingIndex] = newVaccineRecord
    } else {
      updatedVaccineData.push(newVaccineRecord)
    }

    // 데이터 저장
    saveData("vaccineData", updatedVaccineData)
    setVaccineData(updatedVaccineData)

    // 토스트 메시지 표시
    toast({
      title: "백신 날짜가 저장되었습니다",
      description: `${vaccine.name}: ${formattedDate}`,
    })
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
  const handleSaveAll = () => {
    setIsSubmitting(true)

    // 병원 및 메모 정보 업데이트
    const updatedVaccineData = vaccineData.map((vaccine) => {
      return {
        ...vaccine,
        hospital: hospital || vaccine.hospital || "미입력",
        memo: memo || vaccine.memo || "",
      }
    })

    // 데이터 저장
    saveData("vaccineData", updatedVaccineData)

    // 성공 메시지 표시
    toast({
      title: "모든 정보가 저장되었습니다",
    })

    // 잠시 후 리포트 페이지로 이동
    setTimeout(() => {
      setIsSubmitting(false)
      router.push("/report")
    }, 1000)
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
  vaccine: (typeof vaccineTypes)[0]
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
