"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Droplets } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { getData, saveData } from "@/lib/storage"
import { NumberPicker } from "@/components/number-picker"
import { healthApi } from "@/lib/api"

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
  const [existingRecordId, setExistingRecordId] = useState<number | null>(null)

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

        // 백엔드에서 오늘 물 기록 조회
        try {
          const todayWaters = await healthApi.getWaterRecords()
          
          // 오늘 날짜에 해당하는 모든 기록 필터링
          const todayRecords = todayWaters.filter(record => {
            const recordDate = record.created_at ? 
              new Date(record.created_at).toISOString().split('T')[0] : ''
            return recordDate === today
          })
          
          // 가장 최근에 수정된 기록 선택 (updated_at 기준)
          const todayWater = todayRecords.length > 0 ? 
            todayRecords.reduce((latest, current) => {
              const latestUpdated = new Date(latest.updated_at || latest.created_at)
              const currentUpdated = new Date(current.updated_at || current.created_at)
              return currentUpdated > latestUpdated ? current : latest
            }) : null
          
          if (todayWater && isMounted) {
            setFormData({ amount_ml: todayWater.amount_ml })
            setExistingRecordId(todayWater.id)
            setCompletedToday(true)
          }
        } catch (apiError) {
          console.warn("백엔드에서 물 데이터 조회 실패, 로컬 스토리지 확인:", apiError)
          
          // 백엔드 실패시 로컬 스토리지에서 데이터 로드
          const savedWaterData = getData<WaterData>(`water_${today}`)
          if (savedWaterData && isMounted) {
            setFormData(savedWaterData)
            setCompletedToday(true)
          }
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
      // 백엔드 API로 물 섭취 기록 전송
      const waterData = {
        amount_ml: formData.amount_ml
      }
      
      try {
        // 수정인지 신규 등록인지 확인
        if (existingRecordId) {
          // 기존 기록이 있으면 PUT으로 수정
          await healthApi.updateWaterRecord(existingRecordId, waterData)
        } else {
          // 기존 기록이 없으면 POST로 신규 등록
          const newRecord = await healthApi.createWaterRecord(waterData)
          setExistingRecordId(newRecord.id)
        }
      } catch (apiError) {
        console.error('❌ 물 기록 API 오류:', apiError)
        throw apiError
      }

      // 성공 시에만 로컬 스토리지에 저장 (백업용)
      saveData(`water_${today}`, formData)

      // 건강 데이터에 활동 추가 (기존 로직 유지)
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
        title: existingRecordId ? "물 섭취 기록 수정 완료" : "물 섭취 기록 완료",
        description: "물 섭취 기록 성공!",
      })
      
      onComplete?.()
    } catch (error) {
      console.error("물 섭취 기록 저장 실패:", error)
      toast({
        title: "저장 실패",
        description: `물 섭취 기록을 저장하는데 실패했습니다. ${error instanceof Error ? error.message : ''}`,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // 폼 초기화 (수정 모드로 전환) - 기존 값을 유지
  const resetForm = () => {
    // 현재 저장된 값을 그대로 유지하고 편집 모드로만 전환
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