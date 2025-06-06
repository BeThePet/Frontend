"use client"

import { useState } from "react"
import { MapPin } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { NumberPicker } from "@/components/number-picker"
import { useToast } from "@/hooks/use-toast"
import { walkApi } from "@/lib/api"
import type { WalkFormData } from "@/lib/types"

interface WalkFormProps {
  petId: string
  onComplete?: () => void
}

export default function WalkForm({ petId, onComplete }: WalkFormProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<WalkFormData>({
    distance: 1.5,
    duration: 30,
  })

  // 폼 제출 핸들러
  const handleSubmit = async () => {
    if (formData.distance <= 0 || formData.duration <= 0) {
      toast({
        title: "산책 정보를 입력해주세요",
        description: "거리와 시간을 모두 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      await walkApi.createWalk(petId, formData)
      toast({
        title: "산책 기록 완료",
        description: "오늘의 산책이 기록되었습니다.",
      })
      onComplete?.()
    } catch (error) {
      console.error("산책 기록 저장 실패:", error)
      toast({
        title: "저장 실패",
        description: "산책 기록을 저장하는데 실패했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="bg-white rounded-xl shadow-sm mt-4">
      <CardContent className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <MapPin className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">산책 기록</h2>
            <p className="text-sm text-gray-600">오늘의 산책 거리와 시간을 기록하세요.</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label>산책 거리</Label>
            <div className="flex justify-center">
              <NumberPicker
                value={formData.distance}
                onChange={(value) => setFormData((prev) => ({ ...prev, distance: value }))}
                min={0}
                max={10}
                step={0.5}
                unit="km"
                precision={1}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>산책 시간</Label>
            <div className="flex justify-center">
              <NumberPicker
                value={formData.duration}
                onChange={(value) => setFormData((prev) => ({ ...prev, duration: value }))}
                min={5}
                max={180}
                step={5}
                unit="분"
                precision={0}
              />
            </div>
          </div>
        </div>

        <Button
          className="w-full mt-6 bg-blue-500 hover:bg-blue-600 text-white"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? "저장 중..." : "산책 기록하기"}
        </Button>
      </CardContent>
    </Card>
  )
} 