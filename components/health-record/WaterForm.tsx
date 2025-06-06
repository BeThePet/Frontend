"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Droplets } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { getData, saveData } from "@/lib/storage"
import { NumberPicker } from "@/components/number-picker"

interface WaterFormProps {
  petId: string
  onComplete?: () => void
}

interface WaterData {
  amount_ml: number
}

export default function WaterForm({ petId, onComplete }: WaterFormProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [completedToday, setCompletedToday] = useState(false)
  const [petInfo, setPetInfo] = useState<any>(null)
  const [formData, setFormData] = useState<WaterData>({
    amount_ml: 200,
  })

  // today 값을 메모이제이션
  const today = useMemo(() => {
    return new Date().toISOString().split('T')[0]
  }, [])

  // 초기 데이터 로드
  useEffect(() => {
    let isMounted = true

    const loadData = async () => {
      try {
        // 반려견 정보 불러오기
        const savedPetInfo = getData("petInfo")
        if (savedPetInfo && isMounted) {
          setPetInfo(savedPetInfo)
        }

        // 오늘 물 섭취 기록 확인
        const savedWaterData = getData<WaterData>(`water_${today}`)
        if (savedWaterData && isMounted) {
          setFormData(savedWaterData)
          setCompletedToday(true)
        }
      } catch (error) {
        console.error("물 섭취 기록 데이터 로드 실패:", error)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [today])

  // onChange 핸들러를 useCallback으로 메모이제이션
  const handleAmountChange = useCallback((value: number) => {
    setFormData(prev => ({ ...prev, amount_ml: value }))
  }, [])

  // 폼 제출 핸들러
  const handleSubmit = async () => {
    if (formData.amount_ml <= 0) {
      toast({
        title: "물 섭취량을 입력해주세요",
        description: "올바른 물 섭취량을 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      // 로컬 스토리지에 저장
      saveData(`water_${today}`, formData)

      // 건강 데이터에 활동 추가
      const healthData = getData("healthData") as any || { activities: [], healthChecks: [] }
      const updatedHealthData = {
        activities: healthData.activities || [],
        healthChecks: healthData.healthChecks || [],
      }

      const now = new Date()
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`

      const newActivity = {
        type: "water" as const,
        date: today,
        time: currentTime,
        description: `물 섭취 ${formData.amount_ml}ml`,
        amount_ml: formData.amount_ml,
      }

      // 기존 물 섭취 기록이 있다면 업데이트, 없다면 추가
      const existingWaterIndex = updatedHealthData.activities.findIndex(
        (activity: any) => activity.type === "water" && activity.date === today
      )

      if (existingWaterIndex >= 0) {
        updatedHealthData.activities[existingWaterIndex] = newActivity
      } else {
        updatedHealthData.activities = [newActivity, ...updatedHealthData.activities]
      }

      saveData("healthData", updatedHealthData)
      setCompletedToday(true)
      
      toast({
        title: completedToday ? "물 섭취 기록 수정 완료" : "물 섭취 기록 완료",
        description: "오늘의 물 섭취량이 기록되었습니다.",
      })
      
      onComplete?.()
    } catch (error) {
      console.error("물 섭취 기록 저장 실패:", error)
      toast({
        title: "저장 실패",
        description: "물 섭취 기록을 저장하는데 실패했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // 폼 초기화
  const resetForm = () => {
    setFormData({
      amount_ml: 200,
    })
    setCompletedToday(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-gray-600">물 섭취 기록 데이터를 불러오는 중...</p>
      </div>
    )
  }

  return (
    <Card className="bg-white rounded-xl shadow-sm mt-4">
      <CardContent className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Droplets className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              {petInfo?.name || "반려견"}의 물 섭취 기록
            </h2>
            <p className="text-sm text-gray-600">오늘 마신 물의 양을 기록하세요.</p>
          </div>
        </div>

        {completedToday ? (
          <div className="bg-green-50 p-4 rounded-lg mb-4 text-center">
            <p className="text-green-700 font-medium">오늘의 물 섭취 기록을 완료했습니다! 💧</p>
            <p className="text-sm text-gray-600 mt-1">
              {formData.amount_ml}ml 섭취
            </p>
            <Button variant="outline" className="mt-2" onClick={resetForm}>
              기록 수정하기
            </Button>
          </div>
        ) : null}

        <div className="space-y-4 mt-4">
          {/* 물 섭취량 */}
          <div className="space-y-2">
            <Label>물 섭취량</Label>
            <div className="flex justify-center">
              <NumberPicker
                value={formData.amount_ml}
                onChange={handleAmountChange}
                min={50}
                max={1000}
                step={50}
                unit="ml"
                precision={0}
              />
            </div>
          </div>

          {/* 권장 섭취량 안내 */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-700 font-medium">💡 권장 물 섭취량</p>
            <p className="text-sm text-blue-600 mt-1">
              일반적으로 체중 1kg당 50-60ml가 권장됩니다.
              {petInfo?.weight && (
                <span className="block mt-1">
                  {petInfo.name}의 권장량: {Math.round(petInfo.weight * 50)}-{Math.round(petInfo.weight * 60)}ml
                </span>
              )}
            </p>
          </div>
        </div>

        {!completedToday && (
          <Button
            className="w-full mt-6 bg-blue-500 hover:bg-blue-600 text-white"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "저장 중..." : "물 섭취 기록하기"}
          </Button>
        )}
      </CardContent>
    </Card>
  )
} 