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
  type DogCreateRequest,
  type DogUpdateRequest,
  type DogRegistrationResponse
} from "@/lib/api"

export default function InfoContent() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")
  const [isEditMode, setIsEditMode] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  
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
    neutered: null as boolean | null,
  })
  
  // 이미지 상태는 별도 관리
  const [profileImageUrl, setProfileImageUrl] = useState<string>("")
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null)

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
        
        // 일반 등록 모드에서도 기존 반려견이 있는지 확인
        if (mode !== 'edit') {
          try {
            const dogInfo = await dogApi.getDogInfo()
            if (dogInfo) {
              // 이미 등록된 반려견이 있으면 상세 페이지로 리디렉션
              toast({
                title: "이미 등록된 반려견이 있습니다",
                description: "반려견 정보를 확인하거나 수정하시겠습니까?",
              })
              router.push('/info/detail')
              return
            }
          } catch (error) {
            // 404나 기타 오류는 무시하고 계속 진행 (새 등록)
            console.log("반려견 정보 없음 - 새로 등록 가능")
          }
        }
        
        // 수정 모드일 때만 기존 데이터 로드
        if (mode === 'edit') {
          try {
            // 실제 백엔드에서 반려견 정보 가져오기
            const [dogInfo, imageInfo] = await Promise.all([
              dogApi.getDogInfo(),
              dogApi.getDogImageUrl().catch(() => ({ profile_image_url: null }))
            ])
            
            if (dogInfo) {
              // 백엔드 응답을 프론트엔드 폼 데이터로 변환
              setPetInfo({
                name: dogInfo.name || "",
                birthday: dogInfo.birth_date || "",
                breedId: null, // breed_name에서 breed_id를 찾아야 함
                gender: dogInfo.gender || "",
                weight: dogInfo.weight?.toString() || "",
                ageGroup: dogInfo.age_group || "성견",
                medicine: dogInfo.medication || "",
                neutered: null,
              })
              
              // 프로필 이미지 URL 별도 설정 (API 응답 우선, 없으면 dogInfo에서)
              setProfileImageUrl(imageInfo.profile_image_url || dogInfo.profile_image_url || "")
              
              // breed_name을 통해 breed_id 찾기
              let foundBreed: BreedOption | undefined = undefined
              if (dogInfo.breed_name && breedsData.length > 0) {
                foundBreed = breedsData.find(breed => breed.name === dogInfo.breed_name)
                if (foundBreed) {
                  setPetInfo(prev => ({ ...prev, breedId: foundBreed!.id }))
                }
              }
              
              // allergy_names를 통해 allergy_ids 찾기
              const allergyIds: number[] = []
              if (dogInfo.allergy_names && dogInfo.allergy_names.length > 0) {
                allergiesData.forEach(category => {
                  category.items.forEach(item => {
                    if (dogInfo.allergy_names.includes(item.name)) {
                      allergyIds.push(item.id)
                    }
                  })
                })
                setSelectedAllergies(new Set(allergyIds))
              }
              
              // disease_names를 통해 disease_ids 찾기
              const diseaseIds: number[] = []
              if (dogInfo.disease_names && dogInfo.disease_names.length > 0) {
                diseasesData.forEach(category => {
                  category.items.forEach(item => {
                    if (dogInfo.disease_names.includes(item.name)) {
                      diseaseIds.push(item.id)
                    }
                  })
                })
                setSelectedDiseases(new Set(diseaseIds))
              }
              
              // 백엔드 데이터를 localStorage에도 백업 저장
              const backupInfo = {
                id: dogInfo.id,
                name: dogInfo.name,
                birthday: dogInfo.birth_date,
                breedId: foundBreed?.id || null,
                gender: dogInfo.gender,
                weight: dogInfo.weight,
                ageGroup: dogInfo.age_group,
                medicine: dogInfo.medication,
                allergyIds: Array.from(new Set(allergyIds)),
                diseaseIds: Array.from(new Set(diseaseIds))
              }
              localStorage.setItem('registeredPetInfo', JSON.stringify(backupInfo))
              
            } else {
              // 백엔드에 반려견 정보가 없으면 등록 페이지로 리디렉션
              toast({
                title: "반려견 정보를 찾을 수 없습니다",
                description: "먼저 반려견을 등록해주세요.",
                variant: "destructive",
              })
              router.push('/info')
              return
            }
            
          } catch (error) {
            console.error("백엔드에서 반려견 정보 로드 실패:", error)
            // 백엔드 실패 시 localStorage에서 데이터 로드 시도
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
                neutered: existingDogInfo.neutered || null,
              })
              
              // 프로필 이미지 URL 별도 설정
              setProfileImageUrl(existingDogInfo.photoUrl || "")
              
              // 알레르기와 질병 ID 복원
              if (existingDogInfo.allergyIds) {
                setSelectedAllergies(new Set(existingDogInfo.allergyIds))
              }
              if (existingDogInfo.diseaseIds) {
                setSelectedDiseases(new Set(existingDogInfo.diseaseIds))
              }
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

  // 생년월일 기반 연령대 자동 계산 함수
  const calculateAgeGroup = (birthDate: string): "주니어" | "성견" | "시니어" => {
    if (!birthDate) return "성견"
    
    const birth = new Date(birthDate)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    
    if (
      today.getMonth() < birth.getMonth() ||
      (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())
    ) {
      age--
    }
    
    if (age < 1) return "주니어"
    if (age >= 7) return "시니어"
    return "성견"
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    
    // 생일이 변경되면 연령대 자동 계산 (사용자가 수동으로 선택하지 않은 경우)
    if (id === "birthday") {
      const autoAgeGroup = calculateAgeGroup(value)
      setPetInfo((prev) => ({ 
        ...prev, 
        [id]: value,
        ageGroup: autoAgeGroup // 자동으로 연령대 설정
      }))
    } else {
      setPetInfo((prev) => ({ ...prev, [id]: value }))
    }
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
      // 파일 크기 체크 (5MB 제한)
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        toast({
          title: "파일 크기 초과",
          description: "이미지 파일은 5MB 이하만 업로드 가능합니다.",
          variant: "destructive",
        })
        return
      }
      
      // 파일 타입 체크
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "지원하지 않는 파일 형식",
          description: "JPG, PNG, WEBP 형식의 이미지만 업로드 가능합니다.",
          variant: "destructive",
        })
        return
      }
      
      // 수정 모드면 즉시 업로드, 등록 모드면 pending으로 저장
      if (isEditMode) {
        uploadImageImmediately(file)
      } else {
        setPendingImageFile(file)
        // 미리보기를 위한 로컬 URL 생성
        const localPreviewUrl = URL.createObjectURL(file)
        setProfileImageUrl(localPreviewUrl)
      }
    } else {
      // 이미지 삭제 요청
      if (isEditMode && profileImageUrl) {
        // 수정 모드이고 기존 이미지가 있으면 백엔드에서 삭제
        handleImageDelete()
      } else {
        // 등록 모드이거나 이미지가 없으면 로컬 상태만 초기화
        setProfileImageUrl("")
        setPendingImageFile(null)
      }
    }
  }

  const uploadImageImmediately = async (file: File) => {
    try {
      setIsUploadingImage(true)
      console.log("이미지 업로드 시작:", file.name)
      
      let uploadResult
      
      if (isEditMode) {
        // 수정 모드: 바로 PUT으로 이미지 교체
        console.log("🔄 수정 모드: updateDogImage (PUT) 호출")
        uploadResult = await dogApi.updateDogImage(file)
      } else {
        // 등록 모드: POST로 첫 업로드 시도
        console.log("📤 등록 모드: uploadDogImage (POST) 호출")
        try {
          uploadResult = await dogApi.uploadDogImage(file)
        } catch (error: any) {
          // 이미 이미지가 있으면 PUT으로 교체
          if (error.message.includes('이미 프로필 이미지가 존재합니다')) {
            console.log("🔄 이미 이미지 존재, updateDogImage (PUT)로 재시도")
            uploadResult = await dogApi.updateDogImage(file)
          } else {
            throw error
          }
        }
      }
      
      // S3 URL을 별도 상태에 저장
      setProfileImageUrl(uploadResult.profile_image_url)
      
      toast({
        title: "이미지 업로드 완료",
        description: "반려견 사진이 성공적으로 업로드되었습니다.",
      })
      
      console.log("이미지 업로드 성공:", uploadResult.profile_image_url)
      
    } catch (error) {
      console.error("이미지 업로드 실패:", error)
      toast({
        title: "이미지 업로드 실패",
        description: "이미지 업로드 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      })
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handleImageDelete = async () => {
    try {
      setIsUploadingImage(true)
      console.log("🗑️ 이미지 삭제 시작")
      
      // 백엔드에서 이미지 삭제
      await dogApi.deleteDogImage()
      
      // 상태 초기화 (초기 등록 전 상태로)
      setProfileImageUrl("")
      setPendingImageFile(null)
      
      toast({
        title: "이미지 삭제 완료",
        description: "반려견 사진이 성공적으로 삭제되었습니다.",
      })
      
      console.log("✅ 이미지 삭제 성공")
      
    } catch (error) {
      console.error("❌ 이미지 삭제 실패:", error)
      toast({
        title: "이미지 삭제 실패",
        description: "이미지 삭제 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      })
    } finally {
      setIsUploadingImage(false)
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

    // 필수 필드 검증 (체중 추가)
    if (!petInfo.name || !petInfo.birthday || !petInfo.breedId || !petInfo.gender || !petInfo.weight) {
      toast({
        title: "필수 정보를 입력해주세요",
        description: "이름, 생일, 품종, 성별, 체중은 필수 입력 항목입니다.",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    try {
      let result
      if (isEditMode) {
        // 수정 모드: DogUpdateRequest 사용 (allergy_ids, disease_ids 필수)
        const updateData: DogUpdateRequest = {
          name: petInfo.name,
          birth_date: petInfo.birthday,
          age_group: petInfo.ageGroup,
          weight: parseFloat(petInfo.weight),
          breed_id: petInfo.breedId,
          gender: petInfo.gender as "남아" | "여아" | "중성화",
          medication: petInfo.medicine || null,
          allergy_ids: Array.from(selectedAllergies),  // 필수
          disease_ids: Array.from(selectedDiseases)    // 필수
        }
        
        result = await dogApi.updateDog(updateData)
        
        // 로컬스토리지에도 저장 (테스트용)
        const updatedInfo = {
          ...updateData,
          allergyIds: updateData.allergy_ids,
          diseaseIds: updateData.disease_ids
        }
        localStorage.setItem('registeredPetInfo', JSON.stringify(updatedInfo))
        
        // 수정 완료 메시지 표시 후 페이지에 머무르기
        toast({
          title: "수정 완료!",
          description: `${result.name}의 정보가 성공적으로 수정되었습니다.`,
        })
        
        setIsSubmitting(false)
        // 수정 모드에서는 리다이렉트하지 않음
        return
        
      } else {
        // 등록 모드: DogCreateRequest 사용 (allergy_ids, disease_ids 선택사항)
        const createData: DogCreateRequest = {
          name: petInfo.name,
          birth_date: petInfo.birthday,
          age_group: petInfo.ageGroup,
          weight: parseFloat(petInfo.weight),
          breed_id: petInfo.breedId,
          gender: petInfo.gender as "남아" | "여아" | "중성화",
          medication: petInfo.medicine || null,
          allergy_ids: Array.from(selectedAllergies),  // 선택사항이지만 값 전달
          disease_ids: Array.from(selectedDiseases)    // 선택사항이지만 값 전달
        }
        
        result = await dogApi.registerDog(createData)
        
        // 로컬스토리지에도 저장 (테스트용)
        const savedInfo = {
          ...createData,
          allergyIds: createData.allergy_ids,
          diseaseIds: createData.disease_ids
        }
        localStorage.setItem('registeredPetInfo', JSON.stringify(savedInfo))
      }
      
      // 등록 모드이고 대기 중인 이미지가 있으면 업로드
      if (!isEditMode && pendingImageFile) {
        try {
          console.log("반려견 등록 완료 후 이미지 업로드 시작")
          const uploadResult = await dogApi.uploadDogImage(pendingImageFile)
          setProfileImageUrl(uploadResult.profile_image_url)
          setPendingImageFile(null)
          console.log("이미지 업로드도 완료:", uploadResult.profile_image_url)
        } catch (error) {
          console.error("이미지 업로드 실패 (반려견 등록은 완료됨):", error)
          // 이미지 업로드 실패해도 등록은 완료되었으므로 성공 메시지 표시
        }
      }

      // 등록 모드일 때만 성공 메시지 표시 및 리다이렉트
      if (!isEditMode) {
        toast({
          title: "등록 완료!",
          description: `${result.name}의 정보가 성공적으로 등록되었습니다.`,
        })

        // 잠시 후 대시보드로 이동 (등록 모드일 때만)
        setTimeout(() => {
          setIsSubmitting(false)
          router.push("/dashboard")
        }, 1500) // 이미지 업로드 시간 고려하여 조금 더 길게
      }
      
    } catch (error) {
      console.error("반려견 정보 처리 실패:", error)
      toast({
        title: isEditMode ? "수정 실패" : "등록 실패",
        description: `반려견 정보 ${isEditMode ? '수정' : '등록'}에 실패했습니다. 다시 시도해주세요.`,
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
                <PhotoUpload 
                  size="lg" 
                  initialImage={profileImageUrl} 
                  onImageChange={handleImageChange}
                  uploadedImageUrl={profileImageUrl}
                />
              </div>
              
              {(isUploadingImage || (isSubmitting && pendingImageFile)) && (
                <div className="text-center text-sm text-gray-600 mb-4">
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-pink-500"></div>
                    {isUploadingImage ? "이미지 업로드 중..." : "반려견 등록 후 이미지 업로드 중..."}
                  </div>
                </div>
              )}

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
                  required
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