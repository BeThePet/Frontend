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

// 알레르기 데이터
const allergyCategories = [
  {
    name: "단백질 및 육류",
    items: [
      { id: "chicken", label: "닭고기" },
      { id: "beef", label: "소고기" },
      { id: "pork", label: "돼지고기" },
      { id: "lamb", label: "양고기" },
      { id: "turkey", label: "칠면조" },
      { id: "duck", label: "오리고기" },
      { id: "rabbit", label: "토끼고기" },
      { id: "venison", label: "사슴고기" },
      { id: "kangaroo", label: "캥거루고기" },
      { id: "quail", label: "메추라기" },
    ],
  },
  {
    name: "해산물",
    items: [
      { id: "salmon", label: "연어" },
      { id: "tuna", label: "참치" },
      { id: "whitefish", label: "흰살생선" },
      { id: "shellfish", label: "조개류" },
      { id: "shrimp", label: "새우" },
      { id: "crab", label: "게" },
      { id: "squid", label: "오징어" },
      { id: "anchovy", label: "멸치" },
      { id: "mackerel", label: "고등어" },
      { id: "sardine", label: "정어리" },
    ],
  },
  {
    name: "곡물",
    items: [
      { id: "wheat", label: "밀" },
      { id: "corn", label: "옥수수" },
      { id: "soy", label: "대두" },
      { id: "rice", label: "쌀" },
      { id: "barley", label: "보리" },
      { id: "oats", label: "귀리" },
      { id: "rye", label: "호밀" },
      { id: "quinoa", label: "퀴노아" },
      { id: "millet", label: "기장" },
      { id: "buckwheat", label: "메밀" },
    ],
  },
  {
    name: "유제품",
    items: [
      { id: "milk", label: "우유" },
      { id: "cheese", label: "치즈" },
      { id: "yogurt", label: "요거트" },
      { id: "butter", label: "버터" },
      { id: "cream", label: "크림" },
      { id: "icecream", label: "아이스크림" },
      { id: "whey", label: "유청" },
      { id: "casein", label: "카제인" },
    ],
  },
  {
    name: "견과류 및 씨앗",
    items: [
      { id: "peanut", label: "땅콩" },
      { id: "almond", label: "아몬드" },
      { id: "walnut", label: "호두" },
      { id: "cashew", label: "캐슈넛" },
      { id: "pistachio", label: "피스타치오" },
      { id: "flaxseed", label: "아마씨" },
      { id: "sesame", label: "참깨" },
      { id: "sunflower", label: "해바라기씨" },
      { id: "pumpkin", label: "호박씨" },
    ],
  },
  {
    name: "과일 및 채소",
    items: [
      { id: "apple", label: "사과" },
      { id: "banana", label: "바나나" },
      { id: "carrot", label: "당근" },
      { id: "potato", label: "감자" },
      { id: "tomato", label: "토마토" },
      { id: "avocado", label: "아보카도" },
      { id: "broccoli", label: "브로콜리" },
      { id: "spinach", label: "시금치" },
      { id: "peas", label: "완두콩" },
      { id: "sweetpotato", label: "고구마" },
    ],
  },
  {
    name: "첨가물",
    items: [
      { id: "artificial_colors", label: "인공색소" },
      { id: "artificial_flavors", label: "인공향료" },
      { id: "preservatives", label: "방부제" },
      { id: "bha_bht", label: "BHA/BHT" },
      { id: "propylene_glycol", label: "프로필렌 글리콜" },
      { id: "ethoxyquin", label: "에톡시퀸" },
      { id: "msg", label: "MSG" },
      { id: "sulfites", label: "아황산염" },
      { id: "nitrates", label: "질산염" },
    ],
  },
]

// 질병 데이터
const diseaseCategories = [
  {
    name: "소화기 질환",
    items: [
      { id: "gastritis", label: "위염" },
      { id: "pancreatitis", label: "췌장염" },
      { id: "ibd", label: "염증성 장질환" },
      { id: "colitis", label: "대장염" },
      { id: "gastric_dilation", label: "위 확장" },
      { id: "gastric_torsion", label: "위 염전" },
      { id: "megaesophagus", label: "거대식도증" },
      { id: "liver_disease", label: "간 질환" },
      { id: "gallbladder_disease", label: "담낭 질환" },
      { id: "constipation", label: "변비" },
      { id: "diarrhea", label: "설사" },
    ],
  },
  {
    name: "피부 질환",
    items: [
      { id: "atopic_dermatitis", label: "아토피 피부염" },
      { id: "flea_allergy", label: "벼룩 알레르기" },
      { id: "hot_spots", label: "핫스팟" },
      { id: "yeast_infection", label: "효모 감염" },
      { id: "ringworm", label: "백선" },
      { id: "mange", label: "개선충증" },
      { id: "seborrhea", label: "지루성 피부염" },
      { id: "acral_lick_granuloma", label: "핥는 육아종" },
      { id: "pyoderma", label: "농피증" },
      { id: "alopecia", label: "탈모" },
      { id: "skin_tumors", label: "피부 종양" },
    ],
  },
  {
    name: "관절 및 뼈 질환",
    items: [
      { id: "arthritis", label: "관절염" },
      { id: "hip_dysplasia", label: "고관절 이형성증" },
      { id: "cruciate_ligament", label: "십자인대 손상" },
      { id: "osteoarthritis", label: "골관절염" },
      { id: "elbow_dysplasia", label: "팔꿈치 이형성증" },
      { id: "patellar_luxation", label: "슬개골 탈구" },
      { id: "osteochondrosis", label: "골연골증" },
      { id: "intervertebral_disc", label: "추간판 질환" },
      { id: "wobbler_syndrome", label: "워블러 증후군" },
      { id: "hypertrophic_osteodystrophy", label: "비대성 골이영양증" },
    ],
  },
  {
    name: "심장 및 호흡기 질환",
    items: [
      { id: "heart_murmur", label: "심장 잡음" },
      { id: "congestive_heart_failure", label: "울혈성 심부전" },
      { id: "dilated_cardiomyopathy", label: "확장성 심근병증" },
      { id: "mitral_valve_disease", label: "승모판 질환" },
      { id: "heartworm", label: "심장사상충" },
      { id: "bronchitis", label: "기관지염" },
      { id: "pneumonia", label: "폐렴" },
      { id: "kennel_cough", label: "켄넬코프" },
      { id: "collapsed_trachea", label: "기관 허탈" },
      { id: "pulmonary_edema", label: "폐부종" },
    ],
  },
  {
    name: "신경 및 면역계 질환",
    items: [
      { id: "epilepsy", label: "간질" },
      { id: "vestibular_disease", label: "전정기관 질환" },
      { id: "meningitis", label: "수막염" },
      { id: "encephalitis", label: "뇌염" },
      { id: "autoimmune_disease", label: "자가면역 질환" },
      { id: "lupus", label: "루푸스" },
      { id: "myasthenia_gravis", label: "중증근무력증" },
      { id: "hypothyroidism", label: "갑상선 기능저하증" },
      { id: "hyperthyroidism", label: "갑상선 기능항진증" },
      { id: "cushings_disease", label: "쿠싱병" },
      { id: "addisons_disease", label: "애디슨병" },
    ],
  },
  {
    name: "눈 및 귀 질환",
    items: [
      { id: "cataracts", label: "백내장" },
      { id: "glaucoma", label: "녹내장" },
      { id: "conjunctivitis", label: "결막염" },
      { id: "progressive_retinal_atrophy", label: "진행성 망막위축" },
      { id: "cherry_eye", label: "체리아이" },
      { id: "ear_infection", label: "귀 감염" },
      { id: "ear_mites", label: "귀진드기" },
      { id: "deafness", label: "청각 장애" },
      { id: "otitis", label: "외이염" },
    ],
  },
  {
    name: "비뇨기 및 생식기 질환",
    items: [
      { id: "urinary_tract_infection", label: "요로 감염" },
      { id: "kidney_disease", label: "신장 질환" },
      { id: "bladder_stones", label: "방광 결석" },
      { id: "incontinence", label: "요실금" },
      { id: "prostate_problems", label: "전립선 문제" },
      { id: "pyometra", label: "자궁축농증" },
      { id: "mammary_tumors", label: "유선 종양" },
      { id: "testicular_tumors", label: "고환 종양" },
      { id: "cryptorchidism", label: "잠복고환" },
    ],
  },
  {
    name: "기타 질환",
    items: [
      { id: "diabetes", label: "당뇨병" },
      { id: "obesity", label: "비만" },
      { id: "cancer", label: "암" },
      { id: "anemia", label: "빈혈" },
      { id: "dental_disease", label: "치과 질환" },
      { id: "parasites", label: "기생충" },
      { id: "lyme_disease", label: "라임병" },
      { id: "parvovirus", label: "파보바이러스" },
      { id: "distemper", label: "디스템퍼" },
      { id: "leptospirosis", label: "렙토스피라증" },
    ],
  },
]

export default function PetInfoPage() {
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
