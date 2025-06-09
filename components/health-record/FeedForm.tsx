"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Bone } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { getData, saveData } from "@/lib/storage"
import { NumberPicker } from "@/components/number-picker"
import { healthApi } from "@/lib/api"

interface FeedFormProps {
  petId: string
  onComplete?: () => void
}

interface FeedData {
  time: string
  brand: string
  amount_g: number
}

export default function FeedForm({ petId, onComplete }: FeedFormProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [completedToday, setCompletedToday] = useState(false)
  const [petInfo, setPetInfo] = useState<any>(null)
  const [formData, setFormData] = useState<FeedData>({
    time: "",
    brand: "",
    amount_g: 100,
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

        // 백엔드에서 오늘 사료 기록 조회
        try {
          const todayFeeds = await healthApi.getFoodRecords()
          
          // 오늘 날짜에 해당하는 모든 기록 필터링
          const todayRecords = todayFeeds.filter(record => {
            const recordDate = record.created_at ? 
              new Date(record.created_at).toISOString().split('T')[0] : ''
            return recordDate === today
          })
          
          // 가장 최근에 수정된 기록 선택 (updated_at 기준)
          const todayFeed = todayRecords.length > 0 ? 
            todayRecords.reduce((latest, current) => {
              const latestUpdated = new Date(latest.updated_at || latest.created_at)
              const currentUpdated = new Date(current.updated_at || current.created_at)
              return currentUpdated > latestUpdated ? current : latest
            }) : null
          
          if (todayFeed && isMounted) {
            setFormData({ 
              time: todayFeed.time,
              brand: todayFeed.brand || "",
              amount_g: todayFeed.amount_g 
            })
            setExistingRecordId(todayFeed.id)
            setCompletedToday(true)
          } else if (isMounted) {
            // 기존 기록이 없으면 현재 시간을 기본값으로 설정
            const now = new Date()
            const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
            setFormData(prev => ({ ...prev, time: currentTime }))
          }
        } catch (apiError) {
          console.warn("백엔드에서 사료 데이터 조회 실패, 로컬 스토리지 확인:", apiError)
          
          // 백엔드 실패시 로컬 스토리지에서 데이터 로드
          const savedFeedData = getData<FeedData>(`feed_${today}`)
          if (savedFeedData && isMounted) {
            setFormData(savedFeedData)
            setCompletedToday(true)
          } else if (isMounted) {
            // 현재 시간을 기본값으로 설정
            const now = new Date()
            const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
            setFormData(prev => ({ ...prev, time: currentTime }))
          }
        }
      } catch (error) {
        console.error("사료 기록 데이터 로드 실패:", error)
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
  }, [today]) // today는 이제 메모이제이션되어 안정적

  // onChange 핸들러들을 useCallback으로 메모이제이션
  const handleAmountChange = useCallback((value: number) => {
    setFormData(prev => ({ ...prev, amount_g: value }))
  }, [])

  // 폼 제출 핸들러
  const handleSubmit = async () => {
    if (!formData.time || !formData.brand || formData.amount_g <= 0) {
      toast({
        title: "모든 정보를 입력해주세요",
        description: "시간, 브랜드, 급여량을 모두 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      // 백엔드 API로 사료 기록 전송
      const feedData = {
        time: formData.time,
        brand: formData.brand,
        amount_g: formData.amount_g
      }
      
              try {
        // 수정인지 신규 등록인지 확인
        if (existingRecordId) {
          // 기존 기록이 있으면 PUT으로 수정
          await healthApi.updateFoodRecord(existingRecordId, feedData)
        } else {
          // 기존 기록이 없으면 POST로 신규 등록
          const newRecord = await healthApi.createFoodRecord(feedData)
          setExistingRecordId(newRecord.id)
        }
      } catch (apiError) {
        console.error('❌ 사료 기록 API 오류:', apiError)
        throw apiError
      }

      // 성공 시에만 로컬 스토리지에 저장 (백업용)
      saveData(`feed_${today}`, formData)

      // 건강 데이터에 활동 추가 (기존 로직 유지)
      const healthData = getData("healthData") as any || { activities: [], healthChecks: [] }
      const updatedHealthData = {
        activities: healthData.activities || [],
        healthChecks: healthData.healthChecks || [],
      }

      const newActivity = {
        type: "feed" as const,
        date: today,
        time: formData.time,
        description: `${formData.brand} ${formData.amount_g}g`,
        brand: formData.brand,
        amount_g: formData.amount_g,
      }

      // 기존 사료 기록이 있다면 업데이트, 없다면 추가
      const existingFeedIndex = updatedHealthData.activities.findIndex(
        (activity: any) => activity.type === "feed" && activity.date === today
      )

      if (existingFeedIndex >= 0) {
        updatedHealthData.activities[existingFeedIndex] = newActivity
      } else {
        updatedHealthData.activities = [newActivity, ...updatedHealthData.activities]
      }

      saveData("healthData", updatedHealthData)
      setCompletedToday(true)
      
      toast({
        title: existingRecordId ? "사료 기록 수정 완료" : "사료 기록 완료",
        description: "사료 급여 기록 성공!",
      })
      
      onComplete?.()
    } catch (error) {
      console.error("사료 기록 저장 실패:", error)
      toast({
        title: "저장 실패",
        description: `사료 기록을 저장하는데 실패했습니다. ${error instanceof Error ? error.message : ''}`,
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
        <p className="text-gray-600">사료 기록 데이터를 불러오는 중...</p>
      </div>
    )
  }

  return (
    <Card className="bg-white rounded-xl shadow-sm mt-4">
      <CardContent className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
            <Bone className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              {petInfo?.name || "반려견"}의 사료 급여 기록
            </h2>
            <p className="text-sm text-gray-600">오늘 급여한 사료의 정보를 기록하세요.</p>
          </div>
        </div>

        {completedToday ? (
          <div className="bg-green-50 p-4 rounded-lg mb-4 text-center">
            <p className="text-green-700 font-medium">오늘의 사료 급여 기록을 완료했습니다! 🍖</p>
            <p className="text-sm text-gray-600 mt-1">
              {formData.time}에 {formData.brand} {formData.amount_g}g 급여
            </p>
            <Button variant="outline" className="mt-2" onClick={resetForm}>
              기록 수정하기
            </Button>
          </div>
        ) : null}

        <div className="space-y-4 mt-4">
          {/* 급여 시간 */}
          <div className="space-y-2">
            <Label htmlFor="feedTime">급여 시간</Label>
            <Input
              id="feedTime"
              type="time"
              className="rounded-lg border-gray-300"
              value={formData.time}
              onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
              disabled={completedToday}
            />
          </div>

          {/* 사료 브랜드 */}
          <div className="space-y-2">
            <Label htmlFor="feedBrand">사료 브랜드</Label>
            <Input
              id="feedBrand"
              placeholder="사료 브랜드를 입력해주세요"
              className="rounded-lg border-gray-300"
              value={formData.brand}
              onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
              disabled={completedToday}
            />
          </div>

          {/* 급여량 */}
          <div className="space-y-2">
            <Label>급여량</Label>
            <div className="flex justify-center">
              <NumberPicker
                value={formData.amount_g}
                onChange={handleAmountChange}
                min={10}
                max={500}
                step={10}
                unit="g"
                precision={0}
              />
            </div>
          </div>
        </div>

        {!completedToday && (
          <Button
            className="w-full mt-6 bg-amber-500 hover:bg-amber-600 text-white"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "저장 중..." : "사료 기록하기"}
          </Button>
        )}
      </CardContent>
    </Card>
  )
} 