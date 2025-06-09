"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Scale } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { getData, saveData } from "@/lib/storage"
import { NumberPicker } from "@/components/number-picker"
import { healthApi } from "@/lib/api"

interface WeightFormProps {
  petId: string
  onComplete?: () => void
}

interface WeightData {
  weight_kg: number
}

interface WeightHistory {
  date: string
  weight_kg: number
  time: string
}

export default function WeightForm({ petId, onComplete }: WeightFormProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [completedToday, setCompletedToday] = useState(false)
  const [petInfo, setPetInfo] = useState<any>(null)
  const [formData, setFormData] = useState<WeightData>({
    weight_kg: 5.0,
  })
  const [weightHistory, setWeightHistory] = useState<WeightHistory[]>([])
  const [existingRecordId, setExistingRecordId] = useState<number | null>(null)

  // today 값을 메모이제이션
  const today = useMemo(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
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
          setFormData({ weight_kg: (savedPetInfo as any).weight || 5.0 })
        }

        // 백엔드에서 오늘 체중 기록 조회
        try {
          const todayWeights = await healthApi.getWeightRecords()
          
          // 오늘 날짜에 해당하는 모든 기록 필터링
          const todayRecords = todayWeights.filter(record => {
            const recordDate = record.created_at ? 
              new Date(record.created_at).toISOString().split('T')[0] : ''
            return recordDate === today
          })
          
          // 가장 최근에 수정된 기록 선택 (updated_at 기준)
          const todayWeight = todayRecords.length > 0 ? 
            todayRecords.reduce((latest, current) => {
              const latestUpdated = new Date(latest.updated_at || latest.created_at)
              const currentUpdated = new Date(current.updated_at || current.created_at)
              return currentUpdated > latestUpdated ? current : latest
            }) : null
          
          if (todayWeight && isMounted) {
            setFormData({ weight_kg: todayWeight.weight_kg })
            setExistingRecordId(todayWeight.id)
            setCompletedToday(true)
          }
        } catch (apiError) {
          console.warn("체중 데이터 조회 실패, 로컬 스토리지 확인:", apiError)
          
          // 백엔드 실패시 로컬 스토리지에서 데이터 로드
          const savedData = getData<WeightData>(`weight_${today}`)
          if (savedData && isMounted) {
            setFormData(savedData)
            setCompletedToday(true)
          }
        }

        // 체중 히스토리 로드
        const savedHistory = getData<WeightHistory[]>("weightHistory") || []
        if (isMounted) {
          setWeightHistory(savedHistory)
        }
      } catch (error) {
        console.error("체중 기록 데이터 로드 실패:", error)
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
  const handleWeightChange = (value: number) => {
    setFormData({ weight_kg: value })
  }

  // 폼 제출 핸들러
  const handleSubmit = async () => {
    if (formData.weight_kg <= 0) {
      toast({
        title: "체중을 입력해주세요",
        description: "올바른 체중을 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      // 백엔드 API로 체중 기록 전송
      const weightData = {
        weight_kg: formData.weight_kg
      }
      
      try {
        // 수정인지 신규 등록인지 확인
        if (existingRecordId) {
          // 기존 기록이 있으면 PUT으로 수정
          await healthApi.updateWeightRecord(existingRecordId, weightData)
        } else {
          // 기존 기록이 없으면 POST로 신규 등록
          const newRecord = await healthApi.createWeightRecord(weightData)
          setExistingRecordId(newRecord.id)
        }
      } catch (apiError) {
        console.error('❌ 체중 기록 API 오류:', apiError)
        throw apiError // 에러를 다시 던져서 상위 catch에서 처리
      }

      // 성공 시에만 로컬 스토리지에 저장 (백업용)
      saveData(`weight_${today}`, formData)

      // 체중 히스토리 업데이트
      const now = new Date()
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
      
      const newWeightRecord: WeightHistory = {
        date: today,
        weight_kg: formData.weight_kg,
        time: currentTime,
      }

      // 기존 같은 날짜의 기록이 있으면 업데이트, 없으면 추가
      const updatedHistory = weightHistory.filter(record => record.date !== today)
      updatedHistory.unshift(newWeightRecord)
      
      // 최근 30개 기록만 유지
      const trimmedHistory = updatedHistory.slice(0, 30)
      setWeightHistory(trimmedHistory)
      saveData("weightHistory", trimmedHistory)

      // 건강 데이터에 활동 추가
      const healthData = getData("healthData") as any || { activities: [], healthChecks: [] }
      const updatedHealthData = {
        activities: healthData.activities || [],
        healthChecks: healthData.healthChecks || [],
      }

      const newActivity = {
        type: "weight" as const,
        date: today,
        time: currentTime,
        description: `체중 측정: ${formData.weight_kg}kg`,
        weight_kg: formData.weight_kg,
      }

      // 기존 체중 기록이 있다면 업데이트, 없다면 추가
      const existingWeightIndex = updatedHealthData.activities.findIndex(
        (activity: any) => activity.type === "weight" && activity.date === today
      )

      if (existingWeightIndex >= 0) {
        updatedHealthData.activities[existingWeightIndex] = newActivity
      } else {
        updatedHealthData.activities = [newActivity, ...updatedHealthData.activities]
      }

      saveData("healthData", updatedHealthData)

      // 반려견 정보의 현재 체중 업데이트
      if (petInfo) {
        const updatedPetInfo = { ...petInfo, weight: formData.weight_kg }
        setPetInfo(updatedPetInfo)
        saveData("petInfo", updatedPetInfo)
      }

      setCompletedToday(true)
      
      toast({
        title: existingRecordId ? "체중 기록 수정 완료" : "체중 기록 완료",
        description: "체중 기록 성공!",
      })
      
      onComplete?.()
    } catch (error) {
      console.error("체중 기록 저장 실패:", error)
      toast({
        title: "저장 실패",
        description: "체중 기록을 저장하는데 실패했습니다.",
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

  // 체중 변화 계산
  const getWeightChange = () => {
    if (weightHistory.length < 2) return null
    
    const previousRecord = weightHistory.find(record => record.date !== today)
    if (!previousRecord) return null

    const change = formData.weight_kg - previousRecord.weight_kg
    return {
      amount: Math.abs(change),
      direction: change > 0 ? "증가" : change < 0 ? "감소" : "변화없음",
      isPositive: change >= 0
    }
  }

  const weightChange = getWeightChange()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-gray-600">체중 기록 데이터를 불러오는 중...</p>
      </div>
    )
  }

  return (
    <Card className="bg-white rounded-xl shadow-sm mt-4">
      <CardContent className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <Scale className="w-6 h-6 text-green-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              {petInfo?.name || "반려견"}의 체중 기록
            </h2>
            <p className="text-sm text-gray-600">오늘의 체중을 기록하세요.</p>
          </div>
        </div>

        {completedToday ? (
          <div className="bg-green-50 p-4 rounded-lg mb-4 text-center">
            <p className="text-green-700 font-medium">오늘의 체중 기록을 완료했습니다! ⚖️</p>
            <p className="text-sm text-gray-600 mt-1">
              현재 체중: {formData.weight_kg}kg
              {weightChange && weightChange.direction !== "변화없음" && (
                <span className={`ml-2 ${weightChange.isPositive ? "text-red-600" : "text-blue-600"}`}>
                  (이전 대비 {weightChange.amount}kg {weightChange.direction})
                </span>
              )}
            </p>
            <Button variant="outline" className="mt-2" onClick={resetForm}>
              기록 수정하기
            </Button>
          </div>
        ) : (
          <div className="bg-yellow-50 p-3 rounded-lg mb-4 text-center">
            <p className="text-yellow-700 text-sm">아직 오늘 체중을 기록하지 않았습니다.</p>
          </div>
        )}

        <div className="space-y-4 mt-4">
          {/* 체중 입력 */}
          <div className="space-y-2">
            <Label>현재 체중</Label>
            <div className="flex justify-center">
              <NumberPicker
                value={formData.weight_kg}
                onChange={handleWeightChange}
                min={0.5}
                max={50}
                step={0.1}
                unit="kg"
                precision={1}
              />
            </div>
          </div>

          {/* 체중 변화 정보 */}
          {weightChange && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-700 font-medium">📊 체중 변화</p>
              <p className="text-sm text-gray-600 mt-1">
                이전 기록 대비{" "}
                <span className={weightChange.isPositive ? "text-red-600" : "text-blue-600"}>
                  {weightChange.amount}kg {weightChange.direction}
                </span>
              </p>
            </div>
          )}

          {/* 최근 체중 기록 */}
          {weightHistory.length > 0 && (
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-sm text-green-700 font-medium">📈 최근 기록</p>
              <div className="mt-2 space-y-1">
                {weightHistory.slice(0, 3).map((record, index) => (
                  <div key={record.date} className="flex justify-between text-sm text-green-600">
                    <span>{record.date}</span>
                    <span>{record.weight_kg}kg</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {!completedToday && (
          <Button
            className="w-full mt-6 bg-green-500 hover:bg-green-600 text-white"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "저장 중..." : "체중 기록하기"}
          </Button>
        )}
      </CardContent>
    </Card>
  )
} 