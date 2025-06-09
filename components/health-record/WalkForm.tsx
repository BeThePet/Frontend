"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { MapPin } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { getData, saveData } from "@/lib/storage"
import { NumberPicker } from "@/components/number-picker"
import { healthApi } from "@/lib/api"

interface WalkFormProps {
  petId: string
  onComplete?: () => void
}

interface WalkData {
  distance_km: number
  duration_min: number
}

export default function WalkForm({ petId, onComplete }: WalkFormProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [completedToday, setCompletedToday] = useState(false)
  const [petInfo, setPetInfo] = useState<any>(null)
  const [formData, setFormData] = useState<WalkData>({
    distance_km: 1.5,
    duration_min: 30,
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

        // 백엔드에서 오늘 산책 기록 조회
        try {
          const todayWalks = await healthApi.getWalkRecords()
          
          // 오늘 날짜에 해당하는 모든 기록 필터링
          const todayRecords = todayWalks.filter(record => {
            const recordDate = record.created_at ? 
              new Date(record.created_at).toISOString().split('T')[0] : ''
            return recordDate === today
          })
          
          // 가장 최근에 수정된 기록 선택 (updated_at 기준)
          const todayWalk = todayRecords.length > 0 ? 
            todayRecords.reduce((latest, current) => {
              const latestUpdated = new Date(latest.updated_at || latest.created_at)
              const currentUpdated = new Date(current.updated_at || current.created_at)
              return currentUpdated > latestUpdated ? current : latest
            }) : null
          
          if (todayWalk && isMounted) {
            setFormData({ 
              distance_km: todayWalk.distance_km,
              duration_min: todayWalk.duration_min 
            })
            setExistingRecordId(todayWalk.id)
            setCompletedToday(true)
          }
        } catch (apiError) {
          console.warn("백엔드에서 산책 데이터 조회 실패, 로컬 스토리지 확인:", apiError)
          
          // 백엔드 실패시 로컬 스토리지에서 데이터 로드
          const savedWalkData = getData<WalkData>(`walk_${today}`)
          if (savedWalkData && isMounted) {
            setFormData(savedWalkData)
            setCompletedToday(true)
          }
        }
      } catch (error) {
        console.error("산책 기록 데이터 로드 실패:", error)
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

  // onChange 핸들러들을 useCallback으로 메모이제이션
  const handleDistanceChange = useCallback((value: number) => {
    setFormData(prev => ({ ...prev, distance_km: value }))
  }, [])

  const handleDurationChange = useCallback((value: number) => {
    setFormData(prev => ({ ...prev, duration_min: value }))
  }, [])

  // 폼 제출 핸들러
  const handleSubmit = async () => {
    if (formData.distance_km <= 0 || formData.duration_min <= 0) {
      toast({
        title: "산책 정보를 입력해주세요",
        description: "거리와 시간을 모두 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      // 백엔드 API로 산책 기록 전송
      const walkData = {
        distance_km: formData.distance_km,
        duration_min: formData.duration_min
      }
      
      try {
        // 수정인지 신규 등록인지 확인
        if (existingRecordId) {
          // 기존 기록이 있으면 PUT으로 수정
          await healthApi.updateWalkRecord(existingRecordId, walkData)
        } else {
          // 기존 기록이 없으면 POST로 신규 등록
          const newRecord = await healthApi.createWalkRecord(walkData)
          setExistingRecordId(newRecord.id)
        }
      } catch (apiError) {
        console.error('❌ 산책 기록 API 오류:', apiError)
        throw apiError
      }

      // 성공 시에만 로컬 스토리지에 저장 (백업용)
      saveData(`walk_${today}`, formData)

      // 건강 데이터에 활동 추가 (기존 로직 유지)
      const healthData = getData("healthData") as any || { activities: [], healthChecks: [] }
      const updatedHealthData = {
        activities: healthData.activities || [],
        healthChecks: healthData.healthChecks || [],
      }

      const newActivity = {
        type: "walk" as const,
        date: today,
        time: new Date().toTimeString().slice(0, 5),
        description: `산책 ${formData.distance_km}km, ${formData.duration_min}분`,
        distance_km: formData.distance_km,
        duration_min: formData.duration_min,
      }

      // 기존 산책 기록이 있다면 업데이트, 없다면 추가
      const existingWalkIndex = updatedHealthData.activities.findIndex(
        (activity: any) => activity.type === "walk" && activity.date === today
      )

      if (existingWalkIndex >= 0) {
        updatedHealthData.activities[existingWalkIndex] = newActivity
      } else {
        updatedHealthData.activities = [newActivity, ...updatedHealthData.activities]
      }

      saveData("healthData", updatedHealthData)
      setCompletedToday(true)
      
      toast({
        title: existingRecordId ? "산책 기록 수정 완료" : "산책 기록 완료",
        description: "산책 기록 성공!",
      })
      
      onComplete?.()
    } catch (error) {
      console.error("산책 기록 저장 실패:", error)
      toast({
        title: "저장 실패",
        description: `산책 기록을 저장하는데 실패했습니다. ${error instanceof Error ? error.message : ''}`,
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
        <p className="text-gray-600">산책 기록 데이터를 불러오는 중...</p>
      </div>
    )
  }

  return (
    <Card className="bg-white rounded-xl shadow-sm mt-4">
      <CardContent className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <MapPin className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              {petInfo?.name || "반려견"}의 산책 기록
            </h2>
            <p className="text-sm text-gray-600">오늘의 산책 거리와 시간을 기록하세요.</p>
          </div>
        </div>

        {completedToday ? (
          <div className="bg-green-50 p-4 rounded-lg mb-4 text-center">
            <p className="text-green-700 font-medium">오늘의 산책 기록을 완료했습니다! 🚶‍♂️</p>
            <p className="text-sm text-gray-600 mt-1">
              {formData.distance_km}km, {formData.duration_min}분 산책
            </p>
            <Button variant="outline" className="mt-2" onClick={resetForm}>
              기록 수정하기
            </Button>
          </div>
        ) : null}

        <div className="space-y-4 mt-4">
          {/* 산책 거리 */}
          <div className="space-y-2">
            <Label>산책 거리</Label>
            <div className="flex justify-center">
              <NumberPicker
                value={formData.distance_km}
                onChange={handleDistanceChange}
                min={0.1}
                max={10}
                step={0.1}
                unit="km"
                precision={1}
              />
            </div>
          </div>

          {/* 산책 시간 */}
          <div className="space-y-2">
            <Label>산책 시간</Label>
            <div className="flex justify-center">
              <NumberPicker
                value={formData.duration_min}
                onChange={handleDurationChange}
                min={5}
                max={180}
                step={5}
                unit="분"
                precision={0}
              />
            </div>
          </div>
        </div>

        {!completedToday && (
          <Button
            className="w-full mt-6 bg-blue-500 hover:bg-blue-600 text-white"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "저장 중..." : "산책 기록하기"}
          </Button>
        )}
      </CardContent>
    </Card>
  )
} 