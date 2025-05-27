"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, Check } from "lucide-react"
import { motion } from "framer-motion"
import { saveData, getData } from "@/lib/storage"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import PhotoUpload from "@/components/photo-upload"
import { allergyCategories } from "@/data/allergyCategories"
import { diseaseCategories } from "@/data/diseaseCategories"

export default function InfoContent() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")
  const [petInfo, setPetInfo] = useState({
    name: "",
    birthday: "",
    breed: "",
    gender: "",
    weight: "",
    ageGroup: "adult", // junior, adult, senior
    allergies: "",
    disease: "",
    medicine: "",
    photoUrl: "",
    neutered: null, // 중성화 여부 추가
  })

  // 알레르기 상태
  const [allergies, setAllergies] = useState<Record<string, boolean>>({})

  // 질병 이력 상태
  const [diseases, setDiseases] = useState<Record<string, boolean>>({})

  // 기타 알레르기 및 질병 입력 상태
  const [otherAllergy, setOtherAllergy] = useState("")
  const [otherDisease, setOtherDisease] = useState("")

  // 기존 데이터 불러오기
  useEffect(() => {
    const savedPetInfo = getData("petInfo")
    if (savedPetInfo) {
      setPetInfo(savedPetInfo)
    }

    // 건강 정보 불러오기
    const healthInfo = getData("dogHealthInfo")
    if (healthInfo) {
      // 알레르기 설정
      const allergyState: Record<string, boolean> = {}
      healthInfo.allergies?.forEach((id: string) => {
        allergyState[id] = true
      })
      setAllergies(allergyState)

      // 질병 이력 설정
      const diseaseState: Record<string, boolean> = {}
      healthInfo.diseases?.forEach((id: string) => {
        diseaseState[id] = true
      })
      setDiseases(diseaseState)

      // 기타 항목 설정
      setOtherAllergy(healthInfo.otherAllergy || "")
      setOtherDisease(healthInfo.otherDisease || "")
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setPetInfo((prev) => ({ ...prev, [id]: value }))
  }

  const handleGenderSelect = (gender: string) => {
    setPetInfo((prev) => ({ ...prev, gender }))
  }

  const handleAgeGroupSelect = (ageGroup: string) => {
    setPetInfo((prev) => ({ ...prev, ageGroup }))
  }

  const handleBreedSelect = (breed: string) => {
    setPetInfo((prev) => ({ ...prev, breed }))
  }

  const handleImageChange = (file: File | null) => {
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPetInfo((prev) => ({ ...prev, photoUrl: reader.result as string }))
      }
      reader.readAsDataURL(file)
    } else {
      setPetInfo((prev) => ({ ...prev, photoUrl: "" }))
    }
  }

  // 알레르기 토글 핸들러
  const toggleAllergy = (id: string) => {
    setAllergies((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  // 질병 토글 핸들러
  const toggleDisease = (id: string) => {
    setDiseases((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // 필수 필드 검증
    if (!petInfo.name || !petInfo.birthday || !petInfo.breed || !petInfo.gender) {
      toast({
        title: "필수 정보를 입력해주세요",
        description: "이름, 생일, 품종, 성별은 필수 입력 항목입니다.",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    // 데이터 저장
    saveData("petInfo", petInfo)

    // 건강 데이터 초기화 (없는 경우)
    const healthData = getData("healthData")
    if (!healthData) {
      saveData("healthData", {
        walkDistance: 0,
        feedCount: 0,
        waterAmount: 0,
        healthStatus: "양호",
        activities: [],
        weight: Number.parseFloat(petInfo.weight) || 5.0,
        initialWeight: Number.parseFloat(petInfo.weight) || 5.0,
      })
    } else if (petInfo.weight && (!healthData.weight || healthData.weight !== Number.parseFloat(petInfo.weight))) {
      // 체중이 변경된 경우 업데이트
      saveData("healthData", {
        ...healthData,
        weight: Number.parseFloat(petInfo.weight),
        initialWeight: healthData.initialWeight || Number.parseFloat(petInfo.weight),
      })
    }

    // 건강 정보 저장
    try {
      // 선택된 알레르기 항목 추출
      const selectedAllergies = Object.entries(allergies)
        .filter(([_, isChecked]) => isChecked)
        .map(([id]) => id)

      // 선택된 질병 항목 추출
      const selectedDiseases = Object.entries(diseases)
        .filter(([_, isChecked]) => isChecked)
        .map(([id]) => id)

      // 건강 정보 객체 생성
      const healthInfo = {
        allergies: selectedAllergies,
        diseases: selectedDiseases,
        otherAllergy,
        otherDisease,
        lastUpdated: new Date().toISOString(),
      }

      // 로컬 스토리지에 저장
      saveData("dogHealthInfo", healthInfo)
    } catch (error) {
      console.error("Error saving health info:", error)
    }

    // 성공 메시지 표시
    toast({
      title: "정보가 저장되었습니다",
      description: "반려견 정보가 성공적으로 저장되었습니다.",
    })

    // 잠시 후 대시보드로 이동
    setTimeout(() => {
      setIsSubmitting(false)
      router.push("/dashboard")
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-pink-50 pb-safe">
      <div className="bg-pink-200 p-4 flex items-center shadow-md">
        <Link href="/dashboard" className="text-gray-800">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-bold text-gray-800 ml-4">반려견 정보 입력 📝</h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-4 pb-20"
      >
        <form className="space-y-5" onSubmit={handleSubmit}>
          <Tabs defaultValue="basic" value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="w-full bg-pink-100 p-1 rounded-lg">
              <TabsTrigger value="basic" className="flex-1 rounded-md data-[state=active]:bg-white">
                기본 정보
              </TabsTrigger>
              <TabsTrigger value="health" className="flex-1 rounded-md data-[state=active]:bg-white">
                건강 정보
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="mt-4 space-y-5">
              {/* 사진 업로드 */}
              <div className="flex justify-center mb-4">
                <PhotoUpload size="lg" initialImage={petInfo.photoUrl} onImageChange={handleImageChange} />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
                <input
                  id="name"
                  placeholder="반려견 이름을 입력해주세요"
                  className="input-field w-full"
                  value={petInfo.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">생일</label>
                <input
                  id="birthday"
                  type="date"
                  className="input-field w-full"
                  value={petInfo.birthday}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">연령대</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className={`flex-1 h-12 rounded-xl border-2 ${
                      petInfo.ageGroup === "junior"
                        ? "bg-pink-500 border-pink-500 text-white"
                        : "bg-white border-pink-200 text-gray-700"
                    }`}
                    onClick={() => handleAgeGroupSelect("junior")}
                  >
                    주니어
                  </button>
                  <button
                    type="button"
                    className={`flex-1 h-12 rounded-xl border-2 ${
                      petInfo.ageGroup === "adult"
                        ? "bg-pink-500 border-pink-500 text-white"
                        : "bg-white border-pink-200 text-gray-700"
                    }`}
                    onClick={() => handleAgeGroupSelect("adult")}
                  >
                    성견
                  </button>
                  <button
                    type="button"
                    className={`flex-1 h-12 rounded-xl border-2 ${
                      petInfo.ageGroup === "senior"
                        ? "bg-pink-500 border-pink-500 text-white"
                        : "bg-white border-pink-200 text-gray-700"
                    }`}
                    onClick={() => handleAgeGroupSelect("senior")}
                  >
                    시니어
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">체중 (kg)</label>
                <input
                  id="weight"
                  type="number"
                  step="0.1"
                  placeholder="체중을 입력해주세요"
                  className="input-field w-full"
                  value={petInfo.weight}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">품종</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    "말티즈",
                    "푸들",
                    "포메라니안",
                    "시츄",
                    "웰시코기",
                    "치와와",
                    "비숑프리제",
                    "요크셔테리어",
                    "프렌치불독",
                    "골든리트리버",
                    "보더콜리",
                    "비글",
                    "닥스훈트",
                    "시바이누",
                    "진돗개",
                    "믹스견",
                    "기타",
                  ].map((breed) => (
                    <button
                      key={breed}
                      type="button"
                      className={`h-12 rounded-xl border-2 ${
                        petInfo.breed === breed.toLowerCase()
                          ? "bg-pink-500 border-pink-500 text-white"
                          : "bg-white border-pink-200 text-gray-700"
                      }`}
                      onClick={() => handleBreedSelect(breed.toLowerCase())}
                    >
                      {breed}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">성별</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    className={`flex-1 h-12 rounded-xl border-2 ${
                      petInfo.gender === "male"
                        ? "bg-blue-500 border-blue-500 text-white"
                        : "bg-white border-blue-200 text-gray-700"
                    }`}
                    onClick={() => handleGenderSelect("male")}
                  >
                    남아
                  </button>
                  <button
                    type="button"
                    className={`flex-1 h-12 rounded-xl border-2 ${
                      petInfo.gender === "female"
                        ? "bg-pink-500 border-pink-500 text-white"
                        : "bg-white border-pink-200 text-gray-700"
                    }`}
                    onClick={() => handleGenderSelect("female")}
                  >
                    여아
                  </button>
                </div>
              </div>

              <div className="space-y-2 mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">중성화 여부</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    className={`flex-1 h-12 rounded-xl border-2 ${
                      petInfo.neutered === true
                        ? "bg-green-500 border-green-500 text-white"
                        : "bg-white border-green-200 text-gray-700"
                    }`}
                    onClick={() => setPetInfo((prev) => ({ ...prev, neutered: true }))}
                  >
                    예
                  </button>
                  <button
                    type="button"
                    className={`flex-1 h-12 rounded-xl border-2 ${
                      petInfo.neutered === false
                        ? "bg-red-500 border-red-500 text-white"
                        : "bg-white border-red-200 text-gray-700"
                    }`}
                    onClick={() => setPetInfo((prev) => ({ ...prev, neutered: false }))}
                  >
                    아니오
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">현재 복용약 (선택)</label>
                <textarea
                  id="medicine"
                  placeholder="있는 경우 입력해주세요"
                  className="input-field w-full min-h-[80px]"
                  value={petInfo.medicine}
                  onChange={handleChange}
                />
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => setActiveTab("health")}
                  className="w-full h-12 rounded-xl bg-pink-100 border-2 border-pink-200 text-pink-600 font-bold"
                >
                  다음: 건강 정보 입력
                </button>
              </div>
            </TabsContent>

            <TabsContent value="health" className="mt-4 space-y-6">
              {/* 알레르기 체크리스트 */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <span className="text-pink-500">🧪</span> 알레르기 체크리스트
                  </h3>
                  <p className="text-sm text-gray-500">반려견이 민감하게 반응하는 성분을 선택하세요.</p>
                </div>

                <ScrollArea className="h-64 rounded-xl border-2 border-pink-100 p-4 bg-white">
                  <div className="space-y-6">
                    {allergyCategories.map((category, idx) => (
                      <div key={idx} className="space-y-2">
                        <h4 className="font-medium text-sm text-gray-700">{category.name}</h4>
                        <div className="flex flex-wrap gap-2">
                          {category.items.map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => toggleAllergy(item.id)}
                              className={`px-3 py-1.5 rounded-full text-sm ${
                                allergies[item.id]
                                  ? "bg-pink-500 text-white"
                                  : "bg-white border-2 border-pink-200 text-gray-700"
                              }`}
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}

                    <div className="space-y-2">
                      <h4 className="font-medium text-sm text-gray-700">기타 알레르기</h4>
                      <div className="flex items-center space-x-2">
                        <input
                          placeholder="기타 알레르기가 있다면 입력해주세요"
                          value={otherAllergy}
                          onChange={(e) => setOtherAllergy(e.target.value)}
                          className="input-field flex-1"
                        />
                        <button
                          type="button"
                          className="h-10 w-10 rounded-full bg-pink-500 text-white flex items-center justify-center"
                          onClick={() => setOtherAllergy((prev) => (prev ? `${prev}, ` : ""))}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </div>

              {/* 질병 이력 체크리스트 */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <span className="text-blue-500">🩺</span> 질병 이력 체크리스트
                  </h3>
                  <p className="text-sm text-gray-500">반려견이 앓았던 질병을 선택하세요.</p>
                </div>

                <ScrollArea className="h-64 rounded-xl border-2 border-pink-100 p-4 bg-white">
                  <div className="space-y-6">
                    {diseaseCategories.map((category, idx) => (
                      <div key={idx} className="space-y-2">
                        <h4 className="font-medium text-sm text-gray-700">{category.name}</h4>
                        <div className="flex flex-wrap gap-2">
                          {category.items.map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => toggleDisease(item.id)}
                              className={`px-3 py-1.5 rounded-full text-sm ${
                                diseases[item.id]
                                  ? "bg-blue-500 text-white"
                                  : "bg-white border-2 border-blue-200 text-gray-700"
                              }`}
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}

                    <div className="space-y-2">
                      <h4 className="font-medium text-sm text-gray-700">기타 질병</h4>
                      <div className="flex items-center space-x-2">
                        <input
                          placeholder="기타 질병이 있다면 입력해주세요"
                          value={otherDisease}
                          onChange={(e) => setOtherDisease(e.target.value)}
                          className="input-field flex-1"
                        />
                        <button
                          type="button"
                          className="h-10 w-10 rounded-full bg-blue-500 text-white flex items-center justify-center"
                          onClick={() => setOtherDisease((prev) => (prev ? `${prev}, ` : ""))}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab("basic")}
                  className="flex-1 h-12 rounded-xl bg-white border-2 border-pink-200 text-gray-700 font-bold"
                >
                  이전
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 h-12 rounded-xl bg-pink-500 text-white font-bold shadow-md active:scale-95 transition-transform flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>처리 중...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Check className="w-5 h-5" />
                      <span>저장하기</span>
                    </div>
                  )}
                </button>
              </div>
            </TabsContent>
          </Tabs>
        </form>
      </motion.div>
    </div>
  )
} 