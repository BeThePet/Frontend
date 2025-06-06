"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Plus, Pencil, Trash2, Phone, MapPin, Clock, AlertTriangle, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { saveData, getData } from "@/lib/storage"
import { motion } from "framer-motion"

// 병원 정보 타입 정의
type HospitalType = "emergency" | "regular" | "specialist"

interface HospitalInfo {
  id: string
  name: string
  phone: string
  address: string
  type: HospitalType
  hours?: string
  notes?: string
  isEmergency: boolean
  specialties?: string[]
}

export default function HospitalManagementPage() {
  const { toast } = useToast()
  const [hospitals, setHospitals] = useState<HospitalInfo[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingHospital, setEditingHospital] = useState<HospitalInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // 폼 상태
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [type, setType] = useState<HospitalType>("regular")
  const [hours, setHours] = useState("")
  const [notes, setNotes] = useState("")
  const [isEmergency, setIsEmergency] = useState(false)
  const [specialties, setSpecialties] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<string>("all")

  // 병원 정보 불러오기
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        const savedHospitals = getData("hospitalInfo")
        if (savedHospitals) {
          setHospitals(savedHospitals)
        } else {
          // 샘플 데이터
          const sampleHospitals: HospitalInfo[] = [
            {
              id: "1",
              name: "24시 동물메디컬센터",
              phone: "02-1234-5678",
              address: "서울시 강남구 테헤란로 123",
              type: "emergency",
              hours: "24시간",
              notes: "응급 수술 가능",
              isEmergency: true,
              specialties: ["응급 처치", "중환자실"],
            },
            {
              id: "2",
              name: "우리동네 동물병원",
              phone: "02-9876-5432",
              address: "서울시 서초구 서초대로 456",
              type: "regular",
              hours: "평일 09:00-18:00, 토요일 09:00-13:00",
              notes: "정기 검진 및 예방 접종",
              isEmergency: false,
              specialties: ["일반 진료", "예방 접종"],
            },
            {
              id: "3",
              name: "특수동물 전문센터",
              phone: "02-5555-1234",
              address: "서울시 용산구 이태원로 789",
              type: "specialist",
              hours: "평일 10:00-19:00",
              notes: "특수동물 및 야생동물 전문",
              isEmergency: false,
              specialties: ["특수동물", "야생동물", "이국적 동물"],
            },
          ]
          setHospitals(sampleHospitals)
          saveData("hospitalInfo", sampleHospitals)
        }
      } catch (error) {
        console.error("병원 정보를 불러오는 중 오류가 발생했습니다:", error)
        toast({
          title: "데이터 로딩 오류",
          description: "병원 정보를 불러오는 중 문제가 발생했습니다.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [toast])

  // 병원 추가 또는 수정
  const handleSaveHospital = () => {
    if (!name || !phone) {
      toast({
        title: "필수 정보를 입력해주세요",
        description: "병원명과 전화번호는 필수 입력 항목입니다.",
        variant: "destructive",
      })
      return
    }

    try {
      if (editingHospital) {
        // 병원 정보 수정
        const updatedHospitals = hospitals.map((hospital) =>
          hospital.id === editingHospital.id
            ? {
                ...hospital,
                name,
                phone,
                address,
                type,
                hours,
                notes,
                isEmergency,
                specialties,
              }
            : hospital,
        )
        setHospitals(updatedHospitals)
        saveData("hospitalInfo", updatedHospitals)
        toast({ title: "병원 정보가 수정되었습니다" })
      } else {
        // 새 병원 추가
        const newHospital: HospitalInfo = {
          id: Date.now().toString(),
          name,
          phone,
          address,
          type,
          hours,
          notes,
          isEmergency,
          specialties,
        }
        const updatedHospitals = [...hospitals, newHospital]
        setHospitals(updatedHospitals)
        saveData("hospitalInfo", updatedHospitals)
        toast({ title: "병원이 추가되었습니다" })
      }

      // 폼 초기화
      resetForm()
    } catch (error) {
      console.error("병원 정보 저장 중 오류가 발생했습니다:", error)
      toast({
        title: "저장 오류",
        description: "병원 정보를 저장하는 중 문제가 발생했습니다.",
        variant: "destructive",
      })
    }
  }

  // 병원 삭제
  const handleDeleteHospital = (id: string) => {
    try {
      if (confirm("정말로 이 병원 정보를 삭제하시겠습니까?")) {
        const updatedHospitals = hospitals.filter((hospital) => hospital.id !== id)
        setHospitals(updatedHospitals)
        saveData("hospitalInfo", updatedHospitals)
        toast({ title: "병원 정보가 삭제되었습니다" })
      }
    } catch (error) {
      console.error("병원 정보 삭제 중 오류가 발생했습니다:", error)
      toast({
        title: "삭제 오류",
        description: "병원 정보를 삭제하는 중 문제가 발생했습니다.",
        variant: "destructive",
      })
    }
  }

  // 병원 수정 시작
  const handleEditHospital = (hospital: HospitalInfo) => {
    setEditingHospital(hospital)
    setName(hospital.name)
    setPhone(hospital.phone)
    setAddress(hospital.address)
    setType(hospital.type)
    setHours(hospital.hours || "")
    setNotes(hospital.notes || "")
    setIsEmergency(hospital.isEmergency)
    setSpecialties(hospital.specialties || [])
    setShowAddForm(true)
  }

  // 폼 초기화
  const resetForm = () => {
    setName("")
    setPhone("")
    setAddress("")
    setType("regular")
    setHours("")
    setNotes("")
    setIsEmergency(false)
    setSpecialties([])
    setEditingHospital(null)
    setShowAddForm(false)
  }

  // 전문 분야 토글
  const toggleSpecialty = (specialty: string) => {
    if (specialties.includes(specialty)) {
      setSpecialties(specialties.filter((s) => s !== specialty))
    } else {
      setSpecialties([...specialties, specialty])
    }
  }

  // 필터링된 병원 목록
  const filteredHospitals = hospitals.filter((hospital) => {
    if (activeTab === "all") return true
    if (activeTab === "emergency") return hospital.isEmergency
    if (activeTab === "regular") return hospital.type === "regular"
    if (activeTab === "specialist") return hospital.type === "specialist"
    return true
  })

  return (
    <div className="min-h-screen bg-beige pb-20">
      <div className="bg-pink-light p-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/emergency" className="text-gray-800">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-bold text-gray-800 ml-4">병원 정보 관리</h1>
        </div>
        {!showAddForm && (
          <Button className="bg-pink-DEFAULT hover:bg-pink-dark text-white" onClick={() => setShowAddForm(true)}>
            <Plus className="w-4 h-4 mr-1" /> 병원 추가
          </Button>
        )}
      </div>

      <div className="p-5 space-y-6">
        {showAddForm ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Card className="bg-white rounded-xl shadow-sm">
              <CardContent className="p-5 space-y-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  {editingHospital ? "병원 정보 수정" : "새 병원 추가"}
                </h2>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      병원명 <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="병원 이름을 입력하세요"
                      className="rounded-lg border-gray-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      전화번호 <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="전화번호를 입력하세요"
                      className="rounded-lg border-gray-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">주소</Label>
                    <Input
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="주소를 입력하세요"
                      className="rounded-lg border-gray-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>병원 유형</Label>
                    <RadioGroup value={type} onValueChange={(value) => setType(value as HospitalType)}>
                      <div className="flex flex-wrap gap-4">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="regular" id="regular" />
                          <Label htmlFor="regular">일반 병원</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="emergency" id="emergency" />
                          <Label htmlFor="emergency">응급 병원</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="specialist" id="specialist" />
                          <Label htmlFor="specialist">전문 병원</Label>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isEmergency"
                      checked={isEmergency}
                      onChange={(e) => setIsEmergency(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="isEmergency">24시간 응급 진료 가능</Label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hours">진료 시간</Label>
                    <Input
                      id="hours"
                      value={hours}
                      onChange={(e) => setHours(e.target.value)}
                      placeholder="예: 평일 09:00-18:00, 주말 휴무"
                      className="rounded-lg border-gray-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>전문 분야</Label>
                    <div className="flex flex-wrap gap-2">
                      {["일반 진료", "응급 처치", "외과", "내과", "피부과", "안과", "치과", "중환자실", "특수동물"].map(
                        (specialty) => (
                          <Badge
                            key={specialty}
                            variant={specialties.includes(specialty) ? "default" : "outline"}
                            className={`cursor-pointer ${specialties.includes(specialty) ? "bg-pink-DEFAULT" : ""}`}
                            onClick={() => toggleSpecialty(specialty)}
                          >
                            {specialty}
                          </Badge>
                        ),
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">메모</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="추가 정보를 입력하세요"
                      className="rounded-lg border-gray-300 min-h-[100px]"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="flex-1" onClick={resetForm}>
                    취소
                  </Button>
                  <Button className="flex-1 bg-pink-DEFAULT hover:bg-pink-dark text-white" onClick={handleSaveHospital}>
                    {editingHospital ? "수정하기" : "추가하기"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full grid grid-cols-4 bg-beige p-1 rounded-lg">
                <TabsTrigger value="all" className="rounded-md data-[state=active]:bg-pink-light">
                  전체
                </TabsTrigger>
                <TabsTrigger value="emergency" className="rounded-md data-[state=active]:bg-red-100">
                  응급
                </TabsTrigger>
                <TabsTrigger value="regular" className="rounded-md data-[state=active]:bg-blue-light">
                  일반
                </TabsTrigger>
                <TabsTrigger value="specialist" className="rounded-md data-[state=active]:bg-lavender-light">
                  전문
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-4 space-y-4">
                {isLoading ? (
                  <div className="flex justify-center items-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
                  </div>
                ) : filteredHospitals.length > 0 ? (
                  filteredHospitals.map((hospital) => (
                    <motion.div
                      key={hospital.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card
                        className={`bg-white rounded-xl shadow-sm ${
                          hospital.isEmergency ? "border-l-4 border-l-red-500" : ""
                        }`}
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-gray-800">{hospital.name}</h3>
                                {hospital.isEmergency && (
                                  <Badge variant="destructive" className="bg-red-500">
                                    24시
                                  </Badge>
                                )}
                                {hospital.type === "specialist" && (
                                  <Badge variant="secondary" className="bg-lavender-light text-gray-800">
                                    전문
                                  </Badge>
                                )}
                              </div>

                              <div className="mt-2 space-y-1 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <Phone className="w-4 h-4" />
                                  <a href={`tel:${hospital.phone}`} className="text-blue-500">
                                    {hospital.phone}
                                  </a>
                                </div>

                                {hospital.address && (
                                  <div className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    <span>{hospital.address}</span>
                                  </div>
                                )}

                                {hospital.hours && (
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    <span>{hospital.hours}</span>
                                  </div>
                                )}
                              </div>

                              {hospital.specialties && hospital.specialties.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                  {hospital.specialties.map((specialty) => (
                                    <Badge key={specialty} variant="outline" className="text-xs">
                                      {specialty}
                                    </Badge>
                                  ))}
                                </div>
                              )}

                              {hospital.notes && <p className="mt-2 text-sm text-gray-500">{hospital.notes}</p>}
                            </div>

                            <div className="flex flex-col gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full"
                                onClick={() => handleEditHospital(hospital)}
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full text-red-500"
                                onClick={() => handleDeleteHospital(hospital.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-10">
                    <AlertTriangle className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-500">등록된 병원이 없습니다</p>
                    <Button
                      className="mt-4 bg-pink-DEFAULT hover:bg-pink-dark text-white"
                      onClick={() => setShowAddForm(true)}
                    >
                      <Plus className="w-4 h-4 mr-1" /> 병원 추가하기
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            {filteredHospitals.length > 0 && (
              <div className="mt-4 bg-pink-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="w-5 h-5 text-pink-500" />
                  <h3 className="font-medium text-gray-800">알아두세요</h3>
                </div>
                <p className="text-sm text-gray-600">
                  응급 상황에 대비하여 가까운 24시간 동물병원 정보를 미리 저장해두세요. 응급 상황 발생 시 빠르게 대처할
                  수 있습니다.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
