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

export default function FoodRecommendationPage() {
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
      {
        id: 2,
        name: "내추럴발란스 오리지널",
        brand: "내추럴발란스",
        image: "/placeholder.svg?height=80&width=80",
        ingredients: ["양고기", "현미", "감자"],
        price: 38000,
        calories: 320,
        popularity: 7,
        ageGroup: "adult",
        diseaseTargets: ["소화기"],
        allergyIngredients: ["양고기"],
      },
      {
        id: 3,
        name: "아카나 퍼피 스몰브리드",
        brand: "아카나",
        image: "/placeholder.svg?height=80&width=80",
        ingredients: ["닭고기", "계란", "생선"],
        price: 52000,
        calories: 380,
        popularity: 8,
        ageGroup: "junior",
        diseaseTargets: [],
        allergyIngredients: ["닭고기", "계란"],
      },
      {
        id: 4,
        name: "힐스 사이언스 다이어트 시니어",
        brand: "힐스",
        image: "/placeholder.svg?height=80&width=80",
        ingredients: ["닭고기", "쌀", "보리"],
        price: 48000,
        calories: 300,
        popularity: 8,
        ageGroup: "senior",
        diseaseTargets: ["신장", "관절"],
        allergyIngredients: ["닭고기"],
      },
      {
        id: 5,
        name: "오리젠 오리지널",
        brand: "오리젠",
        image: "/placeholder.svg?height=80&width=80",
        ingredients: ["닭고기", "칠면조", "생선", "계란"],
        price: 65000,
        calories: 400,
        popularity: 9,
        ageGroup: "adult",
        diseaseTargets: [],
        allergyIngredients: ["닭고기", "계란"],
      },
      {
        id: 6,
        name: "웰니스 컴플리트 헬스",
        brand: "웰니스",
        image: "/placeholder.svg?height=80&width=80",
        ingredients: ["칠면조", "닭고기", "연어"],
        price: 55000,
        calories: 360,
        popularity: 7,
        ageGroup: "adult",
        diseaseTargets: ["피부", "소화기"],
        allergyIngredients: ["닭고기"],
      },
      {
        id: 7,
        name: "테이스트 오브 와일드",
        brand: "테이스트 오브 와일드",
        image: "/placeholder.svg?height=80&width=80",
        ingredients: ["연어", "감자", "완두콩"],
        price: 50000,
        calories: 340,
        popularity: 8,
        ageGroup: "adult",
        diseaseTargets: ["피부", "알러지"],
        allergyIngredients: ["연어"],
      },
      {
        id: 8,
        name: "힐스 처방식 i/d",
        brand: "힐스",
        image: "/placeholder.svg?height=80&width=80",
        ingredients: ["닭고기", "쌀", "계란"],
        price: 60000,
        calories: 320,
        popularity: 7,
        ageGroup: "adult",
        diseaseTargets: ["소화기", "위장"],
        allergyIngredients: ["닭고기", "계란"],
        isSpecial: true,
      },
      {
        id: 9,
        name: "로얄캐닌 저칼로리 다이어트",
        brand: "로얄캐닌",
        image: "/placeholder.svg?height=80&width=80",
        ingredients: ["칠면조", "쌀", "옥수수"],
        price: 49000,
        calories: 280,
        popularity: 7,
        ageGroup: "adult",
        diseaseTargets: ["비만"],
        allergyIngredients: [],
      },
      {
        id: 10,
        name: "ANF 유기농 6Free",
        brand: "ANF",
        image: "/placeholder.svg?height=80&width=80",
        ingredients: ["양고기", "고구마", "완두콩"],
        price: 35000,
        calories: 330,
        popularity: 6,
        ageGroup: "adult",
        diseaseTargets: ["알러지", "피부"],
        allergyIngredients: ["양고기"],
      },
      {
        id: 11,
        name: "뉴트로 내추럴 초이스",
        brand: "뉴트로",
        image: "/placeholder.svg?height=80&width=80",
        ingredients: ["양고기", "현미", "감자"],
        price: 42000,
        calories: 310,
        popularity: 8,
        ageGroup: "adult",
        diseaseTargets: ["피부"],
        allergyIngredients: ["양고기"],
      },
      {
        id: 12,
        name: "아카나 그래스랜드",
        brand: "아카나",
        image: "/placeholder.svg?height=80&width=80",
        ingredients: ["양고기", "돼지고기", "렌틸콩"],
        price: 58000,
        calories: 370,
        popularity: 8,
        ageGroup: "adult",
        diseaseTargets: [],
        allergyIngredients: ["양고기"],
      },
    ]

    setAllFoods(foodsData)
  }, [])

  // 사용자 정보가 로드되면 추천 사료 생성
  useEffect(() => {
    if (petInfo && healthInfo && allFoods.length > 0) {
      generateRecommendations()
    }
  }, [petInfo, healthInfo, allFoods])

  const generateRecommendations = () => {
    // 알러지 정보 파싱
    const allergies = healthInfo?.allergies || []
    const diseases = healthInfo?.diseases || []

    // 알러지 성분 매핑 (ID를 실제 성분명으로 변환)
    const allergyIngredients = getAllergyIngredients(allergies)

    // 질병 정보 매핑
    const diseaseConditions = getDiseaseConditions(diseases)

    // 연령대에 맞는 사료 필터링
    const ageGroupFoods = allFoods.filter((food) => food.ageGroup === petInfo.ageGroup || food.ageGroup === "adult")

    // 알러지가 없는 사료 필터링
    const nonAllergenicFoods = ageGroupFoods.filter((food) => {
      return !food.allergyIngredients.some((ingredient: string) =>
        allergyIngredients.includes(ingredient.toLowerCase()),
      )
    })

    // 질병 맞춤 사료 찾기
    const diseaseFriendlyFoods = nonAllergenicFoods.filter((food) => {
      if (diseaseConditions.length === 0) return true
      return food.diseaseTargets.some((target: string) =>
        diseaseConditions.some((condition: string) => target.includes(condition)),
      )
    })

    // 최종 추천 사료 선정
    let recommendations = []

    // 질병 맞춤 사료가 있으면 우선 추천
    if (diseaseFriendlyFoods.length > 0) {
      recommendations.push(diseaseFriendlyFoods[0])
    }

    // 알러지 없는 사료 중 가장 인기 있는 것 추가
    const popularFood = [...nonAllergenicFoods].sort((a, b) => b.popularity - a.popularity)[0]
    if (popularFood && !recommendations.find((food) => food.id === popularFood.id)) {
      recommendations.push(popularFood)
    }

    // 저칼로리 사료 추가
    const lowCalorieFood = [...nonAllergenicFoods].sort((a, b) => a.calories - b.calories)[0]
    if (lowCalorieFood && !recommendations.find((food) => food.id === lowCalorieFood.id)) {
      recommendations.push(lowCalorieFood)
    }

    // 중복 제거
    recommendations = recommendations.filter((food, index, self) => index === self.findIndex((f) => f.id === food.id))

    setRecommendedFoods(recommendations)
  }

  // 맞춤 추천 버튼 클릭 시 실행되는 함수
  const handleGenerateTopRecommendations = () => {
    setIsGeneratingRecommendations(true)

    // 알러지 정보 파싱
    const allergies = healthInfo?.allergies || []
    const diseases = healthInfo?.diseases || []
    const allergyIngredients = getAllergyIngredients(allergies)

    // 알러지가 없는 사료 필터링
    const nonAllergenicFoods = allFoods.filter((food) => {
      return !food.allergyIngredients.some((ingredient: string) =>
        allergyIngredients.includes(ingredient.toLowerCase()),
      )
    })

    // 연령대에 맞는 사료 필터링
    const ageGroupFoods = nonAllergenicFoods.filter(
      (food) => food.ageGroup === petInfo?.ageGroup || food.ageGroup === "adult",
    )

    // 질병 맞춤 사료 찾기
    const diseaseConditions = getDiseaseConditions(diseases)
    const diseaseFriendlyFoods = ageGroupFoods.filter((food) => {
      if (diseaseConditions.length === 0) return true
      return food.diseaseTargets.some((target: string) =>
        diseaseConditions.some((condition: string) => target.includes(condition)),
      )
    })

    // 최종 필터링된 사료 목록
    const filteredFoods = diseaseFriendlyFoods.length > 0 ? diseaseFriendlyFoods : ageGroupFoods

    // 1. 가장 적은 칼로리의 사료
    const lowestCalorieFood = [...filteredFoods].sort((a, b) => a.calories - b.calories)[0]

    // 2. 가장 저렴한 사료
    const cheapestFood = [...filteredFoods].sort((a, b) => a.price - b.price)[0]

    // 3. 가장 유명한 브랜드의 사료 (브랜드 최빈값)
    // 브랜드별 빈도 계산
    const brandFrequency: Record<string, number> = {}
    filteredFoods.forEach((food) => {
      brandFrequency[food.brand] = (brandFrequency[food.brand] || 0) + 1
    })

    // 가장 빈도가 높은 브랜드 찾기
    let mostPopularBrand = ""
    let maxFrequency = 0

    for (const [brand, frequency] of Object.entries(brandFrequency)) {
      if (frequency > maxFrequency) {
        maxFrequency = frequency
        mostPopularBrand = brand
      }
    }

    // 해당 브랜드 중 가장 인기 있는 사료 선택
    const mostPopularBrandFoods = filteredFoods.filter((food) => food.brand === mostPopularBrand)
    const mostPopularFood = mostPopularBrandFoods.sort((a, b) => b.popularity - a.popularity)[0]

    // 결과 배열 생성 (중복 제거)
    const topRecommendations = []

    if (lowestCalorieFood) {
      lowestCalorieFood.recommendReason = "최저 칼로리"
      topRecommendations.push(lowestCalorieFood)
    }

    if (cheapestFood && !topRecommendations.find((food) => food.id === cheapestFood.id)) {
      cheapestFood.recommendReason = "최저가"
      topRecommendations.push(cheapestFood)
    }

    if (mostPopularFood && !topRecommendations.find((food) => food.id === mostPopularFood.id)) {
      mostPopularFood.recommendReason = "인기 브랜드"
      topRecommendations.push(mostPopularFood)
    }

    // 추천 결과가 3개 미만인 경우 다른 사료로 채우기
    if (topRecommendations.length < 3 && filteredFoods.length > topRecommendations.length) {
      const remainingFoods = filteredFoods
        .filter((food) => !topRecommendations.find((rec) => rec.id === food.id))
        .sort((a, b) => b.popularity - a.popularity)

      for (let i = 0; i < remainingFoods.length && topRecommendations.length < 3; i++) {
        remainingFoods[i].recommendReason = "추가 추천"
        topRecommendations.push(remainingFoods[i])
      }
    }

    // 애니메이션 효과를 위한 지연
    setTimeout(() => {
      setTopRecommendations(topRecommendations)
      setShowRecommendations(true)
      setIsGeneratingRecommendations(false)
    }, 1500)
  }

  // 알러지 ID를 실제 성분명으로 변환하는 함수
  const getAllergyIngredients = (allergies: string[]) => {
    const allergyMap: Record<string, string> = {
      chicken: "닭고기",
      beef: "소고기",
      pork: "돼지고기",
      lamb: "양고기",
      turkey: "칠면조",
      duck: "오리고기",
      rabbit: "토끼고기",
      venison: "사슴고기",
      kangaroo: "캥거루고기",
      quail: "메추라기",
      salmon: "연어",
      tuna: "참치",
      whitefish: "흰살생선",
      shellfish: "조개류",
      shrimp: "새우",
      crab: "게",
      squid: "오징어",
      anchovy: "멸치",
      mackerel: "고등어",
      sardine: "정어리",
      wheat: "밀",
      corn: "옥수수",
      soy: "대두",
      rice: "쌀",
      barley: "보리",
      oats: "귀리",
      rye: "호밀",
      quinoa: "퀴노아",
      millet: "기장",
      buckwheat: "메밀",
      milk: "우유",
      cheese: "치즈",
      yogurt: "요거트",
      butter: "버터",
      cream: "크림",
      icecream: "아이스크림",
      whey: "유청",
      casein: "카제인",
      peanut: "땅콩",
      almond: "아몬드",
      walnut: "호두",
      cashew: "캐슈넛",
      pistachio: "피스타치오",
      flaxseed: "아마씨",
      sesame: "참깨",
      sunflower: "해바라기씨",
      pumpkin: "호박씨",
      apple: "사과",
      banana: "바나나",
      carrot: "당근",
      potato: "감자",
      tomato: "토마토",
      avocado: "아보카도",
      broccoli: "브로콜리",
      spinach: "시금치",
      peas: "완두콩",
      sweetpotato: "고구마",
    }

    return allergies.map((id) => allergyMap[id] || id.toLowerCase())
  }

  // 질병 ID를 실제 질병명으로 변환하는 함수
  const getDiseaseConditions = (diseases: string[]) => {
    const diseaseMap: Record<string, string> = {
      gastritis: "위염",
      pancreatitis: "췌장염",
      ibd: "염증성 장질환",
      colitis: "대장염",
      gastric_dilation: "위 확장",
      gastric_torsion: "위 염전",
      megaesophagus: "거대식도증",
      liver_disease: "간 질환",
      gallbladder_disease: "담낭 질환",
      constipation: "변비",
      diarrhea: "설사",
      atopic_dermatitis: "아토피 피부염",
      flea_allergy: "벼룩 알레르기",
      hot_spots: "핫스팟",
      yeast_infection: "효모 감염",
      ringworm: "백선",
      mange: "개선충증",
      seborrhea: "지루성 피부염",
      acral_lick_granuloma: "핥는 육아종",
      pyoderma: "농피증",
      alopecia: "탈모",
      skin_tumors: "피부 종양",
      arthritis: "관절염",
      hip_dysplasia: "고관절 이형성증",
      cruciate_ligament: "십자인대 손상",
      osteoarthritis: "골관절염",
      elbow_dysplasia: "팔꿈치 이형성증",
      patellar_luxation: "슬개골 탈구",
      osteochondrosis: "골연골증",
      intervertebral_disc: "추간판 질환",
      wobbler_syndrome: "워블러 증후군",
      hypertrophic_osteodystrophy: "비대성 골이영양증",
      heart_murmur: "심장 잡음",
      congestive_heart_failure: "울혈성 심부전",
      dilated_cardiomyopathy: "확장성 심근병증",
      mitral_valve_disease: "승모판 질환",
      heartworm: "심장사상충",
      bronchitis: "기관지염",
      pneumonia: "폐렴",
      kennel_cough: "켄넬코프",
      collapsed_trachea: "기관 허탈",
      pulmonary_edema: "폐부종",
      epilepsy: "간질",
      vestibular_disease: "전정기관 질환",
      meningitis: "수막염",
      encephalitis: "뇌염",
      autoimmune_disease: "자가면역 질환",
      lupus: "루푸스",
      myasthenia_gravis: "중증근무력증",
      hypothyroidism: "갑상선 기능저하증",
      hyperthyroidism: "갑상선 기능항진증",
      cushings_disease: "쿠싱병",
      addisons_disease: "애디슨병",
      cataracts: "백내장",
      glaucoma: "녹내장",
      conjunctivitis: "결막염",
      progressive_retinal_atrophy: "진행성 망막위축",
      cherry_eye: "체리아이",
      ear_infection: "귀 감염",
      ear_mites: "귀진드기",
      deafness: "청각 장애",
      otitis: "외이염",
      urinary_tract_infection: "요로 감염",
      kidney_disease: "신장 질환",
      bladder_stones: "방광 결석",
      incontinence: "요실금",
      prostate_problems: "전립선 문제",
      pyometra: "자궁축농증",
      mammary_tumors: "유선 종양",
      testicular_tumors: "고환 종양",
      cryptorchidism: "잠복고환",
      diabetes: "당뇨병",
      obesity: "비만",
      cancer: "암",
      anemia: "빈혈",
      dental_disease: "치과 질환",
      parasites: "기생충",
      lyme_disease: "라임병",
      parvovirus: "파보바이러스",
      distemper: "디스템퍼",
      leptospirosis: "렙토스피라증",
    }

    // 질병 ID를 질병명으로 변환하고, 주요 카테고리로 그룹화
    const diseaseCategories: Record<string, string[]> = {
      소화기: [
        "위염",
        "췌장염",
        "염증성 장질환",
        "대장염",
        "위 확장",
        "위 염전",
        "거대식도증",
        "간 질환",
        "담낭 질환",
        "변비",
        "설사",
      ],
      피부: [
        "아토피 피부염",
        "벼룩 알레르기",
        "핫스팟",
        "효모 감염",
        "백선",
        "개선충증",
        "지루성 피부염",
        "핥는 육아종",
        "농피증",
        "탈모",
        "피부 종양",
      ],
      관절: [
        "관절염",
        "고관절 이형성증",
        "십자인대 손상",
        "골관절염",
        "팔꿈치 이형성증",
        "슬개골 탈구",
        "골연골증",
        "추간판 질환",
        "워블러 증후군",
        "비대성 골이영양증",
      ],
      심장: ["심장 잡음", "울혈성 심부전", "확장성 심근병증", "승모판 질환", "심장사상충"],
      호흡기: ["기관지염", "폐렴", "켄넬코프", "기관 허탈", "폐부종"],
      신경: ["간질", "전정기관 질환", "수막염", "뇌염"],
      면역: ["자가면역 질환", "루푸스", "중증근무력증"],
      내분비: ["갑상선 기능저하증", "갑상선 기능항진증", "쿠싱병", "애디슨병", "당뇨병"],
      눈: ["백내장", "녹내장", "결막염", "진행성 망막위축", "체리아이"],
      귀: ["귀 감염", "귀진드기", "청각 장애", "외이염"],
      비뇨기: ["요로 감염", "신장 질환", "방광 결석", "요실금"],
      생식기: ["전립선 문제", "자궁축농증", "유선 종양", "고환 종양", "잠복고환"],
      기타: ["비만", "암", "빈혈", "치과 질환", "기생충", "라임병", "파보바이러스", "디스템퍼", "렙토스피라증"],
    }

    // 질병 ID를 질병명으로 변환
    const diseaseNames = diseases.map((id) => diseaseMap[id] || id)

    // 질병명을 카테고리로 변환
    const categories = new Set<string>()

    diseaseNames.forEach((diseaseName) => {
      for (const [category, diseases] of Object.entries(diseaseCategories)) {
        if (diseases.some((d) => diseaseName.includes(d))) {
          categories.add(category)
          break
        }
      }
    })

    return Array.from(categories)
  }

  // 필터링된 사료 목록
  const filteredFoods = () => {
    // 알러지 정보 파싱
    const allergies = healthInfo?.allergies || []
    const allergyIngredients = getAllergyIngredients(allergies)

    // 검색어 필터링
    let filtered = allFoods.filter(
      (food) =>
        food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        food.ingredients.some((ing: string) => ing.toLowerCase().includes(searchTerm.toLowerCase())),
    )

    // 탭 필터링
    if (activeFilter === "allergy") {
      filtered = filtered.filter((food) => {
        return !food.allergyIngredients.some((ingredient: string) =>
          allergyIngredients.includes(ingredient.toLowerCase()),
        )
      })
    } else if (activeFilter === "disease") {
      const diseases = healthInfo?.diseases || []
      const diseaseConditions = getDiseaseConditions(diseases)

      filtered = filtered.filter((food) => {
        if (diseaseConditions.length === 0) return food.isSpecial
        return food.diseaseTargets.some((target: string) =>
          diseaseConditions.some((condition: string) => target.includes(condition)),
        )
      })
    }

    return filtered
  }

  // 사료에 알러지 성분이 포함되어 있는지 확인
  const hasAllergy = (food: any) => {
    if (!healthInfo?.allergies) return false

    const allergyIngredients = getAllergyIngredients(healthInfo.allergies)
    return food.allergyIngredients.some((ingredient: string) => allergyIngredients.includes(ingredient.toLowerCase()))
  }

  // 사료가 질병에 적합한지 확인
  const isDiseaseRelevant = (food: any) => {
    if (!healthInfo?.diseases) return false

    const diseaseConditions = getDiseaseConditions(healthInfo.diseases)
    return food.diseaseTargets.some((target: string) =>
      diseaseConditions.some((condition: string) => target.includes(condition)),
    )
  }

  // 사료 추천 페이지의 스크롤 문제 해결
  return (
    <div className="min-h-screen bg-pink-50 overflow-y-auto">
      <div className="bg-blue-100 p-4 flex items-center">
        <Link href="/dashboard" className="text-gray-800">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-bold text-gray-800 ml-4">우리 아이에게 맞는 사료 찾기</h1>
      </div>

      <div className="p-5 space-y-6 max-w-md mx-auto pb-20">
        {/* 맞춤 추천 버튼 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full"
        >
          <Button
            onClick={handleGenerateTopRecommendations}
            disabled={isGeneratingRecommendations}
            className="w-full h-14 rounded-xl bg-gradient-to-r from-blue-400 to-blue-600 text-white font-bold shadow-lg flex items-center justify-center gap-2"
          >
            {isGeneratingRecommendations ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>맞춤 사료 분석 중...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>{petInfo?.name || "반려견"}에게 맞는 사료 추천해주세요</span>
              </>
            )}
          </Button>
        </motion.div>

        {/* 맞춤 추천 결과 */}
        {showRecommendations && topRecommendations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">맞춤 추천 사료 TOP 3 🏆</h2>
              <Badge className="bg-blue-100 text-blue-800 border-blue-200">AI 추천</Badge>
            </div>

            {topRecommendations.map((food, index) => (
              <Link href={`/food/${food.id}`} key={food.id}>
                <Card className="bg-white rounded-xl shadow-md overflow-hidden border-2 border-blue-100 hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <div className="w-16 h-16 relative rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                          <Image src={food.image || "/placeholder.svg"} alt={food.name} fill className="object-cover" />
                        </div>
                        <div className="absolute -top-2 -left-2 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-gray-800">{food.name}</h3>
                            <Badge variant="outline" className="mt-1 bg-blue-50 border-blue-200 text-blue-700">
                              {food.recommendReason}
                            </Badge>
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-gray-600">
                          <div className="flex justify-between">
                            <span>{food.price.toLocaleString()}원</span>
                            <span>{food.calories}kcal/cup</span>
                          </div>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {food.ingredients.slice(0, 3).map((ingredient: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {ingredient}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </motion.div>
        )}

        {/* 추천 사료 섹션 */}
        {recommendedFoods.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h2 className="text-lg font-semibold mb-4 text-gray-800">맞춤 추천 사료 💯</h2>
            <div className="space-y-4">
              {recommendedFoods.map((food, index) => (
                <Link href={`/food/${food.id}`} key={food.id}>
                  <Card className="bg-white rounded-xl shadow-sm overflow-hidden border border-blue-100 hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-16 h-16 relative rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                          <Image src={food.image || "/placeholder.svg"} alt={food.name} fill className="object-cover" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium text-gray-800">{food.name}</h3>
                              <Badge
                                variant="outline"
                                className={`mt-1 ${
                                  index === 0
                                    ? "bg-blue-50 border-blue-200 text-blue-700"
                                    : index === 1
                                      ? "bg-green-50 border-green-200 text-green-700"
                                      : "bg-amber-50 border-amber-200 text-amber-700"
                                }`}
                              >
                                {index === 0
                                  ? isDiseaseRelevant(food)
                                    ? "질병 맞춤 사료"
                                    : "알러지 없는 사료"
                                  : index === 1
                                    ? "인기 많은 사료"
                                    : "저칼로리 사료"}
                              </Badge>
                            </div>
                          </div>
                          <div className="mt-2 text-sm text-gray-600">
                            <div className="flex justify-between">
                              <span>{food.price.toLocaleString()}원</span>
                              <span>{food.calories}kcal/cup</span>
                            </div>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {food.ingredients.slice(0, 3).map((ingredient: string, idx: number) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {ingredient}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </motion.div>
        )}

        {/* 검색 필터 */}
        <div className="relative mt-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="사료 이름 검색"
            className="pl-10 rounded-full border-gray-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* 필터 탭 */}
        <Tabs defaultValue="all" value={activeFilter} onValueChange={setActiveFilter}>
          <TabsList className="w-full bg-pink-50 p-1 rounded-lg">
            <TabsTrigger value="all" className="flex-1 rounded-md data-[state=active]:bg-white">
              전체
            </TabsTrigger>
            <TabsTrigger value="allergy" className="flex-1 rounded-md data-[state=active]:bg-white">
              알러지 없음
            </TabsTrigger>
            <TabsTrigger value="disease" className="flex-1 rounded-md data-[state=active]:bg-white">
              질병 맞춤
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeFilter} className="mt-4 space-y-4">
            {filteredFoods().map((food) => (
              <Link href={`/food/${food.id}`} key={food.id}>
                <Card className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-16 h-16 relative rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                        <Image src={food.image || "/placeholder.svg"} alt={food.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-gray-800">{food.name}</h3>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {food.ingredients.slice(0, 2).map((ingredient: string, idx: number) => (
                                <Badge
                                  key={idx}
                                  variant="outline"
                                  className={`text-xs ${
                                    healthInfo?.allergies &&
                                    getAllergyIngredients(healthInfo.allergies).includes(ingredient.toLowerCase())
                                      ? "bg-amber-50 border-amber-200 text-amber-700"
                                      : ""
                                  }`}
                                >
                                  {ingredient}
                                  {healthInfo?.allergies &&
                                    getAllergyIngredients(healthInfo.allergies).includes(ingredient.toLowerCase()) &&
                                    " ⚠️"}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center">
                            {hasAllergy(food) && <AlertTriangle className="w-5 h-5 text-amber-500 mr-1" />}
                            {food.isSpecial && (
                              <Badge className="bg-blue-100 text-blue-800 border-blue-200">처방식</Badge>
                            )}
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-gray-600">
                          <div className="flex justify-between">
                            <span>{food.price.toLocaleString()}원</span>
                            <span>{food.calories}kcal/cup</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}

            {filteredFoods().length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">검색 결과가 없습니다.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
