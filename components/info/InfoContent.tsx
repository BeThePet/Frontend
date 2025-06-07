"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, Check } from "lucide-react"
import { motion } from "framer-motion"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import PhotoUpload from "@/components/photo-upload"
import { 
  dogApi, 
  type BreedOption, 
  type AllergyCategory, 
  type DiseaseCategory,
  type DogRegistrationRequest,
  type DogRegistrationResponse
} from "@/lib/api"

export default function InfoContent() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")
  const [isEditMode, setIsEditMode] = useState(false)
  
  // API에서 받아온 데이터
  const [breeds, setBreeds] = useState<BreedOption[]>([])
  const [allergyCategories, setAllergyCategories] = useState<AllergyCategory[]>([])
  const [diseaseCategories, setDiseaseCategories] = useState<DiseaseCategory[]>([])
  const [loading, setLoading] = useState(true)
  
  const [petInfo, setPetInfo] = useState({
    name: "",
    birthday: "",
    breedId: null as number | null,
    gender: "",
    weight: "",
    ageGroup: "성견" as "주니어" | "성견" | "시니어",
    medicine: "",
    photoUrl: "",
    neutered: null as boolean | null,
  })

  // 알레르기 상태 (이제 ID 기반)
  const [selectedAllergies, setSelectedAllergies] = useState<Set<number>>(new Set())

  // 질병 이력 상태 (이제 ID 기반)
  const [selectedDiseases, setSelectedDiseases] = useState<Set<number>>(new Set())

  // 기타 알레르기 및 질병 입력 상태
  const [otherAllergy, setOtherAllergy] = useState("")
  const [otherDisease, setOtherDisease] = useState("")

  // API 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        
        // URL 파라미터에서 mode 확인
        const searchParams = new URLSearchParams(window.location.search)
        const mode = searchParams.get('mode')
        setIsEditMode(mode === 'edit')
        
        const [breedsData, allergiesData, diseasesData] = await Promise.all([
          dogApi.getBreeds(),
          dogApi.getAllergies(),
          dogApi.getDiseases()
        ])
        
        setBreeds(breedsData)
        setAllergyCategories(allergiesData)
        setDiseaseCategories(diseasesData)
        
        // 수정 모드일 때만 기존 데이터 로드
        if (mode === 'edit') {
          const savedPetInfo = localStorage.getItem('registeredPetInfo')
          if (savedPetInfo) {
            const existingDogInfo = JSON.parse(savedPetInfo)
            setPetInfo({
              name: existingDogInfo.name || "",
              birthday: existingDogInfo.birthday || "",
              breedId: existingDogInfo.breedId || null,
              gender: existingDogInfo.gender || "",
              weight: existingDogInfo.weight?.toString() || "",
              ageGroup: existingDogInfo.ageGroup || "성견",
              medicine: existingDogInfo.medicine || "",
              photoUrl: existingDogInfo.photoUrl || "",
              neutered: existingDogInfo.neutered || null,
            })
            
            // 알레르기와 질병 ID 복원
            if (existingDogInfo.allergyIds) {
              setSelectedAllergies(new Set(existingDogInfo.allergyIds))
            }
            if (existingDogInfo.diseaseIds) {
              setSelectedDiseases(new Set(existingDogInfo.diseaseIds))
            }
          }
        }
        

        
      } catch (error) {
        console.error("데이터 로드 실패:", error)
        toast({
          title: "데이터 로드 실패",
          description: "옵션 데이터를 불러오는데 실패했습니다. 새로고침 후 다시 시도해주세요.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setPetInfo((prev) => ({ ...prev, [id]: value }))
  }

  const handleGenderSelect = (gender: string) => {
    setPetInfo((prev) => ({ ...prev, gender }))
  }

  const handleAgeGroupSelect = (ageGroup: "주니어" | "성견" | "시니어") => {
    setPetInfo((prev) => ({ ...prev, ageGroup }))
  }

  const handleBreedSelect = (breedId: number) => {
    setPetInfo((prev) => ({ ...prev, breedId }))
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

  const handleAllergyToggle = (allergyId: number) => {
    const newSelection = new Set(selectedAllergies)
    if (newSelection.has(allergyId)) {
      newSelection.delete(allergyId)
    } else {
      newSelection.add(allergyId)
    }
    setSelectedAllergies(newSelection)
  }

  const handleDiseaseToggle = (diseaseId: number) => {
    const newSelection = new Set(selectedDiseases)
    if (newSelection.has(diseaseId)) {
      newSelection.delete(diseaseId)
    } else {
      newSelection.add(diseaseId)
    }
    setSelectedDiseases(newSelection)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // 필수 필드 검증
    if (!petInfo.name || !petInfo.birthday || !petInfo.breedId || !petInfo.gender) {
      toast({
        title: "필수 정보를 입력해주세요",
        description: "이름, 생일, 품종, 성별은 필수 입력 항목입니다.",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    try {
      // 백엔드 API 요청 데이터 구성
      const requestData: DogRegistrationRequest = {
        name: petInfo.name,
        birth_date: petInfo.birthday,
        age_group: petInfo.ageGroup,
        weight: parseFloat(petInfo.weight) || 5.0,
        breed_id: petInfo.breedId,
        gender: petInfo.gender as "남아" | "여아" | "중성화",
        medication: petInfo.medicine || null,
        allergy_ids: Array.from(selectedAllergies),
        disease_ids: Array.from(selectedDiseases)
      }

      let result
      if (isEditMode) {
        // 수정 모드: 기존 정보 업데이트
        const savedPetInfo = localStorage.getItem('registeredPetInfo')
        const existingInfo = savedPetInfo ? JSON.parse(savedPetInfo) : {}
        
        const updatedInfo = {
          ...existingInfo,
          ...requestData,
          allergyIds: requestData.allergy_ids,
          diseaseIds: requestData.disease_ids
        }
        
        localStorage.setItem('registeredPetInfo', JSON.stringify(updatedInfo))
        result = updatedInfo
        
        // 실제 백엔드 연결 시 사용할 코드
        // result = await dogApi.updateDog(existingInfo.id, requestData)
      } else {
        // 등록 모드: 새 반려견 정보 등록
        result = await dogApi.registerDog(requestData)
        
        // 로컬스토리지에도 저장 (테스트용)
        const savedInfo = {
          ...requestData,
          allergyIds: requestData.allergy_ids,
          diseaseIds: requestData.disease_ids
        }
        localStorage.setItem('registeredPetInfo', JSON.stringify(savedInfo))
      }
      
      // 성공 메시지 표시
      toast({
        title: isEditMode ? "수정 완료!" : "등록 완료!",
        description: `${result.name}의 정보가 성공적으로 ${isEditMode ? '수정' : '등록'}되었습니다.`,
      })

      // 잠시 후 대시보드로 이동
      setTimeout(() => {
        setIsSubmitting(false)
        router.push("/dashboard")
      }, 1000)
      
    } catch (error) {
      console.error("반려견 등록 실패:", error)
      toast({
        title: "등록 실패",
        description: "반려견 정보 등록에 실패했습니다. 다시 시도해주세요.",
        variant: "destructive",
      })
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-pink-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500"></div>
      </div>
    )
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
                  max={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">연령대</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className={`flex-1 h-12 rounded-xl border-2 ${
                      petInfo.ageGroup === "주니어"
                        ? "bg-pink-500 border-pink-500 text-white"
                        : "bg-white border-pink-200 text-gray-700"
                    }`}
                    onClick={() => handleAgeGroupSelect("주니어")}
                  >
                    주니어
                  </button>
                  <button
                    type="button"
                    className={`flex-1 h-12 rounded-xl border-2 ${
                      petInfo.ageGroup === "성견"
                        ? "bg-pink-500 border-pink-500 text-white"
                        : "bg-white border-pink-200 text-gray-700"
                    }`}
                    onClick={() => handleAgeGroupSelect("성견")}
                  >
                    성견
                  </button>
                  <button
                    type="button"
                    className={`flex-1 h-12 rounded-xl border-2 ${
                      petInfo.ageGroup === "시니어"
                        ? "bg-pink-500 border-pink-500 text-white"
                        : "bg-white border-pink-200 text-gray-700"
                    }`}
                    onClick={() => handleAgeGroupSelect("시니어")}
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
                  {breeds.map((breed) => (
                    <button
                      key={breed.id}
                      type="button"
                      className={`h-12 rounded-xl border-2 ${
                        petInfo.breedId === breed.id
                          ? "bg-pink-500 border-pink-500 text-white"
                          : "bg-white border-pink-200 text-gray-700"
                      }`}
                      onClick={() => handleBreedSelect(breed.id)}
                    >
                      {breed.name}
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
                      petInfo.gender === "남아"
                        ? "bg-blue-500 border-blue-500 text-white"
                        : "bg-white border-blue-200 text-gray-700"
                    }`}
                    onClick={() => handleGenderSelect("남아")}
                  >
                    남아
                  </button>
                  <button
                    type="button"
                    className={`flex-1 h-12 rounded-xl border-2 ${
                      petInfo.gender === "여아"
                        ? "bg-pink-500 border-pink-500 text-white"
                        : "bg-white border-pink-200 text-gray-700"
                    }`}
                    onClick={() => handleGenderSelect("여아")}
                  >
                    여아
                  </button>
                  <button
                    type="button"
                    className={`flex-1 h-12 rounded-xl border-2 ${
                      petInfo.gender === "중성화"
                        ? "bg-green-500 border-green-500 text-white"
                        : "bg-white border-green-200 text-gray-700"
                    }`}
                    onClick={() => handleGenderSelect("중성화")}
                  >
                    중성화
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
                        <h4 className="font-medium text-sm text-gray-700">{category.category}</h4>
                        <div className="flex flex-wrap gap-2">
                          {category.items.map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => handleAllergyToggle(item.id)}
                              className={`px-3 py-1.5 rounded-full text-sm ${
                                selectedAllergies.has(item.id)
                                  ? "bg-pink-500 text-white"
                                  : "bg-white border-2 border-pink-200 text-gray-700"
                              }`}
                            >
                              {item.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
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
                        <h4 className="font-medium text-sm text-gray-700">{category.category}</h4>
                        <div className="flex flex-wrap gap-2">
                          {category.items.map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => handleDiseaseToggle(item.id)}
                              className={`px-3 py-1.5 rounded-full text-sm ${
                                selectedDiseases.has(item.id)
                                  ? "bg-blue-500 text-white"
                                  : "bg-white border-2 border-blue-200 text-gray-700"
                              }`}
                            >
                              {item.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
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