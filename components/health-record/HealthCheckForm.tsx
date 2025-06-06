"use client"

import { useState, useEffect } from "react"
import { Check, Activity, AlertTriangle, Moon, Thermometer, Bone } from "lucide-react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { getData, saveData } from "@/lib/storage"
import { NumberPicker } from "@/components/number-picker"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"

interface HealthCheckFormProps {
  petId: string
  date: string
  onComplete?: () => void
}

interface HealthCheckItem {
  checked: boolean
  value: string | number
  status?: "normal" | "warning" | "danger"
  note?: string
}

interface HealthCheckFormData {
  items: {
    appetite: HealthCheckItem
    energy: HealthCheckItem
    stool: HealthCheckItem
    sleep: HealthCheckItem
    temperature: HealthCheckItem
  }
  memo: string
}

// 체크 항목 설정
const checkItemsConfig = [
  {
    id: "appetite",
    label: "식욕",
    icon: <Bone className="h-5 w-5" />,
    iconColor: "text-amber-500",
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
    isNumeric: true,
    unit: "°C",
    min: 35,
    max: 42,
    step: 0.1,
    precision: 1,
  },
]

export default function HealthCheckForm({ petId, date, onComplete }: HealthCheckFormProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [completedToday, setCompletedToday] = useState(false)
  const [petInfo, setPetInfo] = useState<any>(null)
  const [formData, setFormData] = useState<HealthCheckFormData>({
    items: {
      appetite: { checked: false, value: "normal" },
      energy: { checked: false, value: "normal" },
      stool: { checked: false, value: "normal" },
      sleep: { checked: false, value: 8 },
      temperature: { checked: false, value: 38.5 },
    },
    memo: "",
  })

  // 모든 항목이 체크되었는지 확인
  const isAllChecked = Object.values(formData.items).every((item) => item.checked)

  // 초기 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        // 반려견 정보 불러오기
        const savedPetInfo = getData("petInfo")
        if (savedPetInfo) {
          setPetInfo(savedPetInfo)
        }

        // 로컬 스토리지에서 데이터 로드
        const savedData = getData<HealthCheckFormData>(`dailyCheck_${date}`)
        if (savedData) {
          setFormData(savedData)
          setCompletedToday(true)
        }
      } catch (error) {
        console.error("건강 체크 데이터 로드 실패:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [date])

  // 상태 변경 핸들러
  const handleStatusChange = (id: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      items: {
        ...prev.items,
        [id]: {
          ...prev.items[id as keyof typeof prev.items],
          value,
          checked: true,
          status: typeof value === "string" && value !== "normal" && value !== "" ? "abnormal" : "normal",
        },
      },
    }))
  }

  // 메모 변경 핸들러
  const handleNoteChange = (id: string, note: string) => {
    setFormData((prev) => ({
      ...prev,
      items: {
        ...prev.items,
        [id]: {
          ...prev.items[id as keyof typeof prev.items],
          note,
        },
      },
    }))
  }

  // 폼 제출 핸들러
  const handleSubmit = async () => {
    if (!isAllChecked) {
      toast({
        title: "모든 항목을 체크해주세요",
        description: "건강 체크의 모든 항목을 확인해주세요.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      // 로컬 스토리지에 저장
      saveData(`dailyCheck_${date}`, formData)

      // 건강 데이터에 추가
      const healthData = getData("healthData") as any || { activities: [], healthChecks: [] }
      const updatedHealthData = {
        activities: healthData.activities || [],
        healthChecks: healthData.healthChecks || [],
      }
      
      updatedHealthData.healthChecks.push({
        date,
        time: new Date().toTimeString().slice(0, 5),
        items: Object.entries(formData.items).map(([id, item]) => ({
          id,
          value: item.value,
          status: item.status || "normal",
        })),
      })

      // 비정상 항목이 있는 경우 활동에 추가
      const abnormalItems = Object.entries(formData.items).filter(
        ([_, item]) => item.status === "warning" || item.status === "danger"
      )

      if (abnormalItems.length > 0) {
        const abnormalLabels = abnormalItems.map(([id]) => checkItemsConfig.find(c => c.id === id)?.label).join(", ")
        updatedHealthData.activities = [
          {
            type: "health" as const,
            date,
            time: new Date().toTimeString().slice(0, 5),
            description: `건강 체크: ${abnormalLabels}에 이상이 있습니다.`,
          },
          ...updatedHealthData.activities,
        ]
      } else {
        updatedHealthData.activities = [
          {
            type: "health" as const,
            date,
            time: new Date().toTimeString().slice(0, 5),
            description: "건강 체크: 모든 항목이 정상입니다.",
          },
          ...updatedHealthData.activities,
        ]
      }

      saveData("healthData", updatedHealthData)
      setCompletedToday(true)
      toast({
        title: "건강 체크 완료",
        description: "오늘의 건강 체크가 저장되었습니다.",
      })
      onComplete?.()
    } catch (error) {
      console.error("건강 체크 저장 실패:", error)
      toast({
        title: "저장 실패",
        description: "건강 체크를 저장하는데 실패했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // 폼 초기화
  const resetForm = () => {
    setFormData({
      items: {
        appetite: { checked: false, value: "normal" },
        energy: { checked: false, value: "normal" },
        stool: { checked: false, value: "normal" },
        sleep: { checked: false, value: 8 },
        temperature: { checked: false, value: 38.5 },
      },
      memo: "",
    })
    setCompletedToday(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-gray-600">건강 체크 데이터를 불러오는 중...</p>
      </div>
    )
  }

  return (
    <Card className="bg-white rounded-xl shadow-sm mt-4">
      <CardContent className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
            <Check className="w-6 h-6 text-pink-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              {petInfo?.name || "반려견"}의 건강 체크
            </h2>
            <p className="text-sm text-gray-600">건강 상태를 체크하여 이상 징후를 조기에 발견하세요.</p>
          </div>
        </div>

        {completedToday ? (
          <div className="bg-green-50 p-4 rounded-lg mb-4 text-center">
            <p className="text-green-700 font-medium">오늘의 건강 체크를 완료했습니다! 🎉</p>
            <Button variant="outline" className="mt-2" onClick={resetForm}>
              다시 체크하기
            </Button>
          </div>
        ) : null}

        <div className="space-y-4 mt-4">
          {checkItemsConfig.map((config) => {
            const item = formData.items[config.id as keyof typeof formData.items]
            return (
              <div
                key={config.id}
                className={`border rounded-lg p-4 ${item.checked ? "border-green-200 bg-green-50/30" : ""}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <motion.div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        item.checked ? "bg-green-100" : "bg-gray-100"
                      }`}
                      animate={{
                        scale: item.checked ? [1, 1.1, 1] : 1,
                        backgroundColor: item.checked ? "#dcfce7" : "#f3f4f6",
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <span className={item.checked ? config.iconColor : "text-gray-400"}>
                        {config.icon}
                      </span>
                    </motion.div>
                    <span className="font-medium">{config.label}</span>
                  </div>
                  <Badge
                    variant="outline"
                    className={`${
                      item.checked
                        ? "bg-green-100 text-green-800 border-green-200"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {item.checked ? "체크 완료" : "체크 필요"}
                  </Badge>
                </div>

                <div className="pt-2">
                  {config.isNumeric ? (
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-600">
                        {config.label} 수치를 입력해주세요
                      </Label>
                      <div className="flex justify-center">
                        <NumberPicker
                          value={Number(item.value)}
                          onChange={(value) => handleStatusChange(config.id, value)}
                          min={config.min || 0}
                          max={config.max || 100}
                          step={config.step || 1}
                          unit={config.unit || ""}
                          precision={config.precision || 1}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-600">상태를 선택해주세요</Label>
                      <RadioGroup
                        value={item.value as string}
                        onValueChange={(value) => handleStatusChange(config.id, value)}
                        className="flex flex-wrap gap-2"
                        disabled={completedToday}
                      >
                        {config.options?.map((option) => (
                          <div key={option.value} className="flex items-center space-x-2">
                            <RadioGroupItem
                              value={option.value}
                              id={`${config.id}-${option.value}`}
                              className={option.value === "normal" ? "text-green-600" : "text-amber-600"}
                            />
                            <Label
                              htmlFor={`${config.id}-${option.value}`}
                              className={`text-sm ${
                                option.value === "normal"
                                  ? "text-green-600"
                                  : option.value === "less" || option.value === "soft"
                                  ? "text-amber-600"
                                  : "text-red-600"
                              }`}
                            >
                              {option.label}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  )}

                  <Textarea
                    placeholder={`${config.label}에 대한 특이사항이 있다면 메모해주세요.`}
                    className="mt-3"
                    value={item.note || ""}
                    onChange={(e) => handleNoteChange(config.id, e.target.value)}
                    disabled={completedToday}
                  />
                </div>
              </div>
            )
          })}

          {/* 전체 메모 */}
          <div className="space-y-2">
            <Label>전체 메모</Label>
            <Textarea
              placeholder="오늘의 건강 상태에 대한 전체적인 메모를 남겨주세요."
              value={formData.memo}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  memo: e.target.value,
                }))
              }
              className="min-h-[100px]"
              disabled={completedToday}
            />
          </div>
        </div>

        {!completedToday && (
          <Button
            className="w-full mt-6 bg-pink-500 hover:bg-pink-600 text-white"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "저장 중..." : "건강 체크 완료"}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
