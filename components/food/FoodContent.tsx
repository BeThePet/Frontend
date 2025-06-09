"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, AlertTriangle, Search, Sparkles, RefreshCw, Star, ExternalLink, ShoppingCart } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getData } from "@/lib/storage"
import { motion } from "framer-motion"
import { foodApi } from "@/lib/api/index"
import type { 
  FoodProductListResponse, 
  FoodRecommendationResponse, 
  LatestRecommendationResponse,
  FoodProductSummary,
  FoodRecommendation
} from "@/lib/api"

export default function FoodContent() {
  const router = useRouter()
  const [petInfo, setPetInfo] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false)
  
  // 사료 목록 관련 상태
  const [foodProducts, setFoodProducts] = useState<FoodProductSummary[]>([])
  const [pagination, setPagination] = useState<any>(null)
  
  // 추천 관련 상태
  const [recommendations, setRecommendations] = useState<FoodRecommendation[]>([])
  const [recommendationInfo, setRecommendationInfo] = useState<any>(null)
  const [hasRecommendation, setHasRecommendation] = useState(false)
  
  const [activeTab, setActiveTab] = useState("recommendations")

  useEffect(() => {
    // 반려견 정보 불러오기
    const savedPetInfo = getData("petInfo")
    if (savedPetInfo) {
      setPetInfo(savedPetInfo)
    }

    // 초기 데이터 로드
    loadInitialData()
  }, [])

  // 초기 데이터 로드
  const loadInitialData = async () => {
    try {
      // 최신 추천 기록 확인
      await checkLatestRecommendation()
      
      // 사료 목록 로드
      await loadFoodProducts()
    } catch (error) {
      console.error('초기 데이터 로드 실패:', error)
    }
  }

  // 최신 추천 기록 확인
  const checkLatestRecommendation = async () => {
    try {
      setIsLoadingRecommendations(true)
      const response: LatestRecommendationResponse = await foodApi.getLatestRecommendation()
      
      if (response.has_recommendation && response.recommendations) {
        setRecommendations(response.recommendations)
        setRecommendationInfo({
          dogName: response.dog_name,
          confidenceScore: response.confidence_score,
          totalRecommendations: response.total_recommendations,
          lastRecommendedAt: response.last_recommended_at
        })
        setHasRecommendation(true)
      } else {
        setHasRecommendation(false)
      }
    } catch (error: any) {
      console.error('추천 기록 조회 실패:', error)
      if (error.message?.includes('로그인')) {
        // 로그인이 필요한 경우 처리
        setHasRecommendation(false)
      }
    } finally {
      setIsLoadingRecommendations(false)
    }
  }

  // 새로운 추천 생성
  const generateNewRecommendation = async () => {
    try {
      setIsLoadingRecommendations(true)
      const response: FoodRecommendationResponse = await foodApi.getNewRecommendation()
      
      setRecommendations(response.recommendations.recommendations)
      setRecommendationInfo({
        dogName: response.dog_name,
        confidenceScore: response.recommendations.confidence_score,
        totalRecommendations: response.recommendations.total_count,
        lastRecommendedAt: new Date().toISOString()
      })
      setHasRecommendation(true)
    } catch (error: any) {
      console.error('새 추천 생성 실패:', error)
      if (error.message?.includes('로그인')) {
        alert('로그인이 필요합니다.')
      } else if (error.message?.includes('반려견 정보')) {
        alert('반려견 정보를 먼저 등록해주세요.')
      } else {
        alert('추천 생성에 실패했습니다.')
      }
    } finally {
      setIsLoadingRecommendations(false)
    }
  }

  // 사료 목록 로드
  const loadFoodProducts = async (page = 1, search = "") => {
    try {
      setIsLoading(true)
      const response: FoodProductListResponse = await foodApi.getProducts({
        page,
        limit: 10,
        search: search || undefined
      })
      
      setFoodProducts(response.products)
      setPagination(response.pagination)
      setCurrentPage(page)
    } catch (error) {
      console.error('사료 목록 로드 실패:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 검색 처리
  const handleSearch = (term: string) => {
    setSearchTerm(term)
    loadFoodProducts(1, term)
  }

  // 페이지 변경
  const handlePageChange = (page: number) => {
    loadFoodProducts(page, searchTerm)
  }

  // 가격 포맷팅
  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`
  }

  // 사료 상세 페이지로 이동
  const goToProductDetail = (productId: number) => {
    router.push(`/food/${productId}`)
  }

  return (
    <div className="min-h-screen bg-beige pb-20">
      <div className="bg-lavender-light p-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/dashboard" className="text-gray-800">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-bold text-gray-800 ml-4">사료 추천</h1>
        </div>
      </div>

      <div className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="recommendations" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              AI 추천
            </TabsTrigger>
            <TabsTrigger value="browse" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              사료 검색
            </TabsTrigger>
          </TabsList>

          {/* AI 추천 탭 */}
          <TabsContent value="recommendations" className="space-y-4">
            <Card className="bg-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-pink-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">
                      {petInfo?.name || "반려견"}을 위한 AI 맞춤 추천
                    </h2>
                    <p className="text-sm text-gray-600">
                      건강 상태와 알레르기를 고려한 최적의 사료를 추천해드려요
                    </p>
                  </div>
                </div>

                {!hasRecommendation ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">
                      아직 추천 기록이 없어요
                    </h3>
                    <p className="text-gray-600 mb-6">
                      AI가 {petInfo?.name || "반려견"}에게 맞는 사료를 찾아드릴게요
                    </p>
                    <Button
                      onClick={generateNewRecommendation}
                      disabled={isLoadingRecommendations}
                      variant="outline"
                      className="border-lavender-dark text-lavender-dark hover:bg-lavender-light hover:text-lavender-dark"
                    >
                      {isLoadingRecommendations ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          추천 생성 중...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          AI 추천 시작
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* 추천 정보 헤더 */}
                    <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold text-gray-800">
                          {recommendationInfo?.dogName}을 위한 추천 사료
                        </h3>
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm font-medium">
                            신뢰도 {Math.round((recommendationInfo?.confidenceScore || 0) * 100)}%
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">
                        총 {recommendationInfo?.totalRecommendations}개 추천 중 상위 추천
                      </p>
                      <div className="flex justify-between items-center mt-3">
                        <span className="text-xs text-gray-500">
                          마지막 업데이트: {recommendationInfo?.lastRecommendedAt ? 
                            new Date(recommendationInfo.lastRecommendedAt).toLocaleDateString() : 
                            '방금 전'
                          }
                        </span>
                        <Button
                          onClick={generateNewRecommendation}
                          disabled={isLoadingRecommendations}
                          variant="outline"
                          size="sm"
                        >
                          {isLoadingRecommendations ? (
                            <RefreshCw className="w-3 h-3 animate-spin" />
                          ) : (
                            <RefreshCw className="w-3 h-3" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* 추천 사료 목록 */}
                    <div className="space-y-3">
                      {recommendations.map((recommendation, index) => (
                        <motion.div
                          key={recommendation.rank}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Card className="border border-gray-200 hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg flex items-center justify-center">
                                  <span className="text-lg font-bold text-pink-600">
                                    {recommendation.rank}
                                  </span>
                                </div>
                                
                                <div className="flex-1">
                                  <div className="flex justify-between items-start mb-2">
                                    <div>
                                      <h4 className="font-medium text-gray-800">
                                        {recommendation.product_name}
                                      </h4>
                                      <p className="text-sm text-gray-600">
                                        {recommendation.brand}
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <p className="font-semibold text-gray-800">
                                        {formatPrice(recommendation.price)}
                                      </p>
                                      <Badge variant="outline" className="bg-green-50 text-green-600">
                                        {recommendation.life_stage}
                                      </Badge>
                                    </div>
                                  </div>

                                  {/* 영양 정보 */}
                                  <div className="flex gap-2 mb-3">
                                    {recommendation.protein_pct && (
                                      <Badge variant="outline" className="text-xs">
                                        단백질 {recommendation.protein_pct}%
                                      </Badge>
                                    )}
                                    {recommendation.fat_pct && (
                                      <Badge variant="outline" className="text-xs">
                                        지방 {recommendation.fat_pct}%
                                      </Badge>
                                    )}
                                    {recommendation.fiber_pct && (
                                      <Badge variant="outline" className="text-xs">
                                        섬유질 {recommendation.fiber_pct}%
                                      </Badge>
                                    )}
                                  </div>

                                  {/* 칼로리 정보 */}
                                  <p className="text-xs text-gray-500 mb-3">
                                    {recommendation.calorie_content}
                                  </p>

                                  {/* 버튼들 */}
                                  <div className="flex gap-2">
                                    {recommendation.db_product_id && (
                                      <Button
                                        onClick={() => goToProductDetail(recommendation.db_product_id!)}
                                        variant="outline"
                                        size="sm"
                                        className="flex-1"
                                      >
                                        <Search className="w-3 h-3 mr-1" />
                                        상세보기
                                      </Button>
                                    )}
                                    <Button
                                      onClick={() => window.open(recommendation.url, '_blank')}
                                      size="sm"
                                      variant="outline"
                                      className="flex-1 border-lavender-dark text-lavender-dark hover:bg-lavender-light hover:text-lavender-dark"
                                    >
                                      <ExternalLink className="w-3 h-3 mr-1" />
                                      구매하기
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 사료 검색 탭 */}
          <TabsContent value="browse" className="space-y-4">
            <Card className="bg-white">
              <CardContent className="p-6">
                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      type="text"
                      placeholder="사료명 또는 브랜드로 검색..."
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto"></div>
                    <p className="text-gray-600 mt-2">사료 목록을 불러오는 중...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* 사료 목록 */}
                    <div className="grid grid-cols-1 gap-3">
                      {foodProducts.map((product) => (
                        <Card key={product.id} className="border border-gray-100 hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-800">
                                  {product.product_name}
                                </h4>
                                <p className="text-sm text-gray-600">{product.brand}</p>
                                <div className="flex items-center gap-2 mt-2">
                                  <p className="font-semibold text-gray-800">
                                    {formatPrice(product.price)}
                                  </p>
                                  {product.is_matched && (
                                    <Badge variant="outline" className="bg-green-50 text-green-600 text-xs">
                                      추천 가능
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <Button
                                onClick={() => goToProductDetail(product.id)}
                                variant="outline"
                                size="sm"
                              >
                                <Search className="w-3 h-3 mr-1" />
                                상세
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* 페이지네이션 */}
                    {pagination && (
                      <div className="flex justify-center gap-2 mt-6">
                        <Button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={!pagination.has_prev}
                          variant="outline"
                          size="sm"
                        >
                          이전
                        </Button>
                        <span className="flex items-center px-3 text-sm text-gray-600">
                          {pagination.current_page} / {pagination.total_pages}
                        </span>
                        <Button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={!pagination.has_next}
                          variant="outline"
                          size="sm"
                        >
                          다음
                        </Button>
                      </div>
                    )}

                    {/* 총 개수 표시 */}
                    {pagination && (
                      <p className="text-center text-sm text-gray-500">
                        총 {pagination.total_count}개 사료
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 