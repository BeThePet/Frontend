"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, AlertTriangle, ExternalLink, Star, Calendar, Info } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { foodApi } from "@/lib/api/index"
import type { FoodProductDetailResponse, FoodProduct } from "@/lib/api"

interface FoodDetailContentProps {
  params?: {
    slug?: string
  }
}

export default function FoodDetailContent({ params }: FoodDetailContentProps) {
  const routeParams = useParams()
  const [foodData, setFoodData] = useState<FoodProduct | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadProductDetail()
  }, [params?.slug, routeParams?.slug])

  const loadProductDetail = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // params에서 slug를 가져오되, 없으면 routeParams에서 가져오기
      const slug = params?.slug || routeParams?.slug
      
      if (!slug) {
        throw new Error('제품 ID가 제공되지 않았습니다.')
      }
      
      const productId = parseInt(slug as string, 10)
      
      if (isNaN(productId) || productId <= 0) {
        throw new Error(`올바르지 않은 제품 ID입니다. 받은 값: ${slug}`)
      }

      const response: FoodProductDetailResponse = await foodApi.getProductDetail(productId)
      setFoodData(response.product)
    } catch (err: any) {
      console.error('사료 상세 정보 로드 실패:', err)
      setError(err.message || '사료 정보를 불러올 수 없습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const formatPrice = (price: number | null) => {
    if (!price) return 'N/A'
    return `$${price.toFixed(2)}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR')
  }

  const handlePurchase = () => {
    if (foodData?.url) {
      window.open(foodData.url, '_blank')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-beige flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">사료 정보를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (error || !foodData) {
    return (
      <div className="min-h-screen bg-beige flex justify-center items-center">
        <div className="text-center p-6">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-800 mb-2">사료 정보를 찾을 수 없습니다</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/food">
            <Button variant="outline" className="border-lavender-dark text-lavender-dark hover:bg-lavender-light hover:text-lavender-dark">
              사료 목록으로 돌아가기
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-beige pb-20">
      <div className="bg-lavender-light p-4 flex items-center">
        <Link href="/food" className="text-gray-800">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-bold text-gray-800 ml-4">사료 상세 정보</h1>
      </div>

      <div className="p-4 space-y-6">
        {/* 기본 정보 카드 */}
        <Card className="bg-white rounded-xl shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                <Image
                  src="/placeholder.svg"
                  alt={foodData.product_name || "사료 이미지"}
                  width={80}
                  height={80}
                  className="object-contain rounded-lg"
                />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  {foodData.product_name}
                </h2>
                <p className="text-lg text-gray-600 mb-2">{foodData.brand}</p>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-pink-600">
                    {formatPrice(foodData.price)}
                  </span>
                  {foodData.meta.is_matched && (
                    <Badge className="bg-green-50 text-green-600 border-green-200">
                      <Star className="w-3 h-3 mr-1" />
                      추천 가능
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* 칼로리 정보 */}
            {foodData.calorie_content && (
              <div className="bg-blue-50 p-3 rounded-lg mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <Info className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-800">칼로리 정보</span>
                </div>
                <p className="text-blue-700">{foodData.calorie_content}</p>
              </div>
            )}

            {/* 구매 버튼 */}
            {foodData.url && (
              <Button
                onClick={handlePurchase}
                className="w-full bg-pink-500 hover:bg-pink-600 text-white py-3"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                온라인에서 구매하기
              </Button>
            )}
          </CardContent>
        </Card>

        {/* 영양 정보 카드 */}
        <Card className="bg-white rounded-xl shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">영양 성분</h3>
            <div className="grid grid-cols-2 gap-4">
              {foodData.nutrition.protein_pct !== null && (
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-sm text-green-600 font-medium">단백질</p>
                  <p className="text-lg font-bold text-green-800">{foodData.nutrition.protein_pct}%</p>
                </div>
              )}
              {foodData.nutrition.fat_pct !== null && (
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <p className="text-sm text-yellow-600 font-medium">지방</p>
                  <p className="text-lg font-bold text-yellow-800">{foodData.nutrition.fat_pct}%</p>
                </div>
              )}
              {foodData.nutrition.fiber_pct !== null && (
                <div className="bg-orange-50 p-3 rounded-lg">
                  <p className="text-sm text-orange-600 font-medium">섬유질</p>
                  <p className="text-lg font-bold text-orange-800">{foodData.nutrition.fiber_pct}%</p>
                </div>
              )}
              {foodData.nutrition.moisture_pct !== null && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-600 font-medium">수분</p>
                  <p className="text-lg font-bold text-blue-800">{foodData.nutrition.moisture_pct}%</p>
                </div>
              )}
              {foodData.nutrition.calcium_pct !== null && (
                <div className="bg-purple-50 p-3 rounded-lg">
                  <p className="text-sm text-purple-600 font-medium">칼슘</p>
                  <p className="text-lg font-bold text-purple-800">{foodData.nutrition.calcium_pct}%</p>
                </div>
              )}
              {foodData.nutrition.phosphorus_pct !== null && (
                <div className="bg-pink-50 p-3 rounded-lg">
                  <p className="text-sm text-pink-600 font-medium">인</p>
                  <p className="text-lg font-bold text-pink-800">{foodData.nutrition.phosphorus_pct}%</p>
                </div>
              )}
              {foodData.nutrition.sodium_pct !== null && (
                <div className="bg-red-50 p-3 rounded-lg">
                  <p className="text-sm text-red-600 font-medium">나트륨</p>
                  <p className="text-lg font-bold text-red-800">{foodData.nutrition.sodium_pct}%</p>
                </div>
              )}
              {foodData.nutrition.omega_6_pct !== null && (
                <div className="bg-indigo-50 p-3 rounded-lg">
                  <p className="text-sm text-indigo-600 font-medium">오메가6</p>
                  <p className="text-lg font-bold text-indigo-800">{foodData.nutrition.omega_6_pct}%</p>
                </div>
              )}
              {foodData.nutrition.omega_3_pct !== null && (
                <div className="bg-teal-50 p-3 rounded-lg">
                  <p className="text-sm text-teal-600 font-medium">오메가3</p>
                  <p className="text-lg font-bold text-teal-800">{foodData.nutrition.omega_3_pct}%</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 성분 정보 카드 */}
        {foodData.ingredients && (
          <Card className="bg-white rounded-xl shadow-sm">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">원재료</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 leading-relaxed">{foodData.ingredients}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 제품 정보 카드 */}
        <Card className="bg-white rounded-xl shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">제품 정보</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">제품 ID</span>
                <span className="font-medium text-gray-800">{foodData.id}</span>
              </div>
              {foodData.csv_index && (
                <div className="flex justify-between">
                  <span className="text-gray-600">데이터베이스 인덱스</span>
                  <span className="font-medium text-gray-800">{foodData.csv_index}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">추천 가능 여부</span>
                <Badge 
                  variant={foodData.meta.is_matched ? "default" : "secondary"}
                  className={foodData.meta.is_matched ? "bg-green-100 text-green-800" : ""}
                >
                  {foodData.meta.is_matched ? "가능" : "불가능"}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">등록일</span>
                <span className="text-gray-800">{formatDate(foodData.meta.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">수정일</span>
                <span className="text-gray-800">{formatDate(foodData.meta.updated_at)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 하단 버튼들 */}
        <div className="flex gap-3 pt-4">
          <Link href="/food" className="flex-1">
            <Button variant="outline" className="w-full h-12 rounded-full">
              목록으로 돌아가기
            </Button>
          </Link>
          {foodData.url && (
                         <Button
               onClick={handlePurchase}
               variant="outline"
               className="flex-1 h-12 rounded-full border-lavender-dark text-lavender-dark hover:bg-lavender-light hover:text-lavender-dark"
             >
              <ExternalLink className="w-4 h-4 mr-2" />
              구매하기
            </Button>
          )}
        </div>
      </div>
    </div>
  )
} 