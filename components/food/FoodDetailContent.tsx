"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useApi } from "@/hooks/useApi"
import { foodApi } from "@/lib/api"
import type { FoodData } from "@/lib/types"

interface FoodDetailContentProps {
  params: {
    slug: string
  }
}

export default function FoodDetailContent({ params }: FoodDetailContentProps) {
  const { data: foodData, error, isLoading } = useApi<FoodData>(
    () => foodApi.getFood(params.slug)
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FFF8F0] flex justify-center items-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  if (error || !foodData) {
    return (
      <div className="min-h-screen bg-[#FFF8F0] flex justify-center items-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-800 font-medium">{error || '사료 정보를 찾을 수 없습니다.'}</p>
          <Link href="/food" className="mt-4 text-pink-500 hover:text-pink-600 inline-block">
            사료 목록으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFF8F0] pb-20">
      <div className="bg-[#FBD6E4] p-4 flex items-center">
        <Link href="/food" className="text-gray-800">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-bold text-gray-800 ml-4">사료 상세 정보</h1>
      </div>

      <div className="p-5 space-y-6">
        {/* 사료 이미지 및 기본 정보 */}
        <Card className="bg-white rounded-xl shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <div className="relative h-64 w-full">
              <Image src={foodData.image || "/placeholder.svg"} alt={foodData.name} fill className="object-contain" />
            </div>
            <div className="p-5">
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-bold text-gray-800">{foodData.name}</h2>
                {foodData.hasAllergy && (
                  <div className="flex items-center text-amber-600">
                    <AlertTriangle className="w-5 h-5 mr-1" />
                    <span className="text-sm font-medium">알러지 주의</span>
                  </div>
                )}
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-lg font-semibold text-gray-800">{foodData.price}</span>
                <span className="text-sm text-gray-600">{foodData.weight}</span>
              </div>
              <p className="mt-3 text-sm text-gray-600">{foodData.description}</p>
            </div>
          </CardContent>
        </Card>

        {/* AI 알러지 경고 */}
        {foodData.hasAllergy && (
          <Card className="bg-amber-50 border-amber-200 rounded-xl shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-start">
                <AlertTriangle className="w-6 h-6 text-amber-600 mr-3 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-amber-800">AI 알러지 경고</h3>
                  <p className="text-sm text-amber-700 mt-1">
                    이 사료에는 닭고기가 포함되어 있어요! 몽이에게 닭고기 알러지가 있으니 주의해주세요.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 성분표 */}
        <Card className="bg-white rounded-xl shadow-sm">
          <CardContent className="p-5">
            <h3 className="font-semibold text-gray-800 mb-3">성분표</h3>
            <div className="flex flex-wrap gap-2">
              {foodData.ingredients.map((ingredient, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className={`${ingredient.isAllergen ? "bg-amber-50 border-amber-200 text-amber-700" : ""}`}
                >
                  {ingredient.name}
                  {ingredient.isAllergen && " ⚠️"}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 영양 정보 */}
        <Card className="bg-white rounded-xl shadow-sm">
          <CardContent className="p-5">
            <h3 className="font-semibold text-gray-800 mb-3">영양 정보</h3>
            <div className="grid grid-cols-2 gap-2">
              {foodData.nutrition.map((item, index) => (
                <div key={index} className="flex justify-between">
                  <span className="text-sm text-gray-600">{item.name}</span>
                  <span className="text-sm font-medium text-gray-800">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 버튼 */}
        <div className="flex gap-3">
          <Button className="flex-1 h-12 rounded-full bg-[#FBD6E4] hover:bg-[#f5c0d5] text-gray-800">
            급여하기로 선택
          </Button>
          <Button variant="outline" className="flex-1 h-12 rounded-full border-[#D6ECFA] text-gray-700">
            다른 사료 보기
          </Button>
        </div>
      </div>
    </div>
  )
} 