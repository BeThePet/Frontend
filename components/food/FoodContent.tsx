"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, AlertTriangle, Search, Sparkles } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getData } from "@/lib/storage"
import { motion } from "framer-motion"

export default function FoodContent() {
  const [petInfo, setPetInfo] = useState<any>(null)
  const [healthInfo, setHealthInfo] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeFilter, setActiveFilter] = useState("all")
  const [recommendedFoods, setRecommendedFoods] = useState<any[]>([])
  const [topRecommendations, setTopRecommendations] = useState<any[]>([])
  const [allFoods, setAllFoods] = useState<any[]>([])
  const [showRecommendations, setShowRecommendations] = useState(false)
  const [isGeneratingRecommendations, setIsGeneratingRecommendations] = useState(false)

  useEffect(() => {
    // 반려견 정보 불러오기
    const savedPetInfo = getData("petInfo")
    if (savedPetInfo) {
      setPetInfo(savedPetInfo)
    }

    // 건강 정보 불러오기
    const savedHealthInfo = getData("dogHealthInfo")
    if (savedHealthInfo) {
      setHealthInfo(savedHealthInfo)
    }

    // 기본 사료 데이터 설정
    const foodsData = [
      {
        id: 1,
        name: "로얄캐닌 미니 어덜트",
        brand: "로얄캐닌",
        image: "/placeholder.svg?height=80&width=80",
        ingredients: ["닭고기", "쌀", "옥수수"],
        price: 45000,
        calories: 350,
        popularity: 9,
        ageGroup: "adult",
        diseaseTargets: ["관절", "피부"],
        allergyIngredients: ["닭고기"],
      },
      // ... 나머지 사료 데이터
    ]

    setAllFoods(foodsData)
  }, [])

  // 추천 생성 함수
  const generateRecommendations = () => {
    setIsGeneratingRecommendations(true)
    
    // 알레르기 및 질병 정보 가져오기
    const allergies = healthInfo?.allergies || []
    const diseases = healthInfo?.diseases || []
    
    // 필터링된 사료 목록 생성
    const filtered = allFoods.filter((food) => {
      // 알레르기 체크
      const hasAllergy = food.allergyIngredients.some((ingredient: string) =>
        allergies.includes(ingredient)
      )
      if (hasAllergy) return false
      
      // 질병 관련 체크
      if (diseases.length > 0) {
        const hasDiseaseTarget = food.diseaseTargets.some((target: string) =>
          diseases.includes(target)
        )
        if (!hasDiseaseTarget) return false
      }
      
      return true
    })
    
    // 점수 계산 및 정렬
    const scored = filtered.map((food) => {
      let score = 0
      
      // 인기도 반영
      score += food.popularity * 2
      
      // 질병 타겟 매칭
      const diseaseMatches = food.diseaseTargets.filter((target: string) =>
        diseases.includes(target)
      ).length
      score += diseaseMatches * 3
      
      // 가격 점수 (역순)
      score += (100000 - food.price) / 10000
      
      return { ...food, score }
    })
    
    // 점수순 정렬
    scored.sort((a, b) => b.score - a.score)
    
    // 상위 5개 추천
    setRecommendedFoods(scored.slice(0, 5))
    setShowRecommendations(true)
    setIsGeneratingRecommendations(false)
  }

  // 검색 및 필터링 함수
  const filteredFoods = () => {
    return allFoods.filter((food) => {
      const matchesSearch = food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          food.brand.toLowerCase().includes(searchTerm.toLowerCase())
      
      if (activeFilter === "all") return matchesSearch
      if (activeFilter === "allergy") {
        const hasAllergy = food.allergyIngredients.some((ingredient: string) =>
          (healthInfo?.allergies || []).includes(ingredient)
        )
        return matchesSearch && !hasAllergy
      }
      if (activeFilter === "disease") {
        const hasDiseaseTarget = food.diseaseTargets.some((target: string) =>
          (healthInfo?.diseases || []).includes(target)
        )
        return matchesSearch && hasDiseaseTarget
      }
      return matchesSearch
    })
  }

  return (
    <div className="min-h-screen bg-beige pb-20">
      <div className="bg-lavender-light p-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/dashboard" className="text-gray-800">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-bold text-gray-800 ml-4">맞춤 사료 추천</h1>
        </div>
      </div>

      <div className="p-4">
        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-pink-500" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  {petInfo?.name || "반려견"}을 위한 맞춤 사료
                </h2>
                <p className="text-sm text-gray-600">
                  건강 상태와 알레르기를 고려한 최적의 사료를 추천해드려요
                </p>
              </div>
            </div>

            {/* 검색 및 필터 */}
            <div className="mb-6">
              <div className="flex gap-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="사료 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant={activeFilter === "all" ? "default" : "outline"}
                  onClick={() => setActiveFilter("all")}
                  className={activeFilter === "all" ? "bg-lavender-DEFAULT hover:bg-lavender-dark" : ""}
                >
                  전체
                </Button>
                <Button
                  variant={activeFilter === "allergy" ? "default" : "outline"}
                  onClick={() => setActiveFilter("allergy")}
                  className={activeFilter === "allergy" ? "bg-lavender-DEFAULT hover:bg-lavender-dark" : ""}
                >
                  알레르기 안전
                </Button>
                <Button
                  variant={activeFilter === "disease" ? "default" : "outline"}
                  onClick={() => setActiveFilter("disease")}
                  className={activeFilter === "disease" ? "bg-lavender-DEFAULT hover:bg-lavender-dark" : ""}
                >
                  질병 맞춤
                </Button>
              </div>
            </div>

            {/* 사료 목록 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredFoods().map((food) => (
                <Card key={food.id} className="bg-white border border-gray-100">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                        <Image
                          src={food.image}
                          alt={food.name}
                          width={80}
                          height={80}
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-800">{food.name}</h3>
                        <p className="text-sm text-gray-500">{food.brand}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {food.diseaseTargets.map((target: string) => (
                            <Badge key={target} variant="outline" className="bg-green-50 text-green-600">
                              {target}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-sm font-medium text-gray-700 mt-2">
                          {food.price.toLocaleString()}원
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 