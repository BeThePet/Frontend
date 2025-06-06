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

        // 오늘 사료 기록 확인
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
      // 로컬 스토리지에 저장
      saveData(`feed_${today}`, formData)

      // 건강 데이터에 활동 추가
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
        title: completedToday ? "사료 기록 수정 완료" : "사료 기록 완료",
        description: "오늘의 사료 급여가 기록되었습니다.",
      })
      
      onComplete?.()
    } catch (error) {
      console.error("사료 기록 저장 실패:", error)
      toast({
        title: "저장 실패",
        description: "사료 기록을 저장하는데 실패했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // 폼 초기화
  const resetForm = () => {
    const now = new Date()
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    setFormData({
      time: currentTime,
      brand: "",
      amount_g: 100,
    })
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