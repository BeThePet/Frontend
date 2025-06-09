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
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"
import { emergencyApi, type HospitalDetail, type HospitalCreateRequest } from "@/lib/api"

export default function HospitalContent() {
  const { toast } = useToast()
  const [hospitals, setHospitals] = useState<HospitalDetail[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingHospital, setEditingHospital] = useState<HospitalDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 폼 상태
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [type, setType] = useState("일반 병원")
  const [hours, setHours] = useState("")
  const [notes, setNotes] = useState("")
  const [isEmergency, setIsEmergency] = useState(false)
  const [specialties, setSpecialties] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<string>("all")

  // 전문분야 옵션들 (한글로 사용)
  const getDisplaySpecialties = () => {
    return ["일반 진료", "외과", "내과", "치과", "심장내과", "응급 처치", "피부과", "안과", "중환자실", "특수동물"]
  }

  // 병원 정보 불러오기 (탭에 따라 다른 API 호출)
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        let hospitalData: HospitalDetail[] = []
        
        // 탭에 따라 다른 엔드포인트 호출
        switch (activeTab) {
          case "all":
            hospitalData = await emergencyApi.getAllHospitals()
            break
          case "emergency":
            hospitalData = await emergencyApi.getEmergencyHospitals()
            break
          case "regular":
            hospitalData = await emergencyApi.getRegularHospitals()
            break
          case "specialist":
            hospitalData = await emergencyApi.getSpecialistHospitals()
            break
          default:
            hospitalData = await emergencyApi.getAllHospitals()
        }
        
        setHospitals(hospitalData)
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
  }, [activeTab, toast])

  // 병원 추가 또는 수정
  const handleSaveHospital = async () => {
    if (!name || !phone) {
      toast({
        title: "필수 정보를 입력해주세요",
        description: "병원명과 전화번호는 필수 입력 항목입니다.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)
      
      const hospitalData: HospitalCreateRequest = {
        name,
        phone,
        address,
        type,
        hours,
        notes,
        is_emergency: isEmergency,
        specialties,
      }

      if (editingHospital) {
        // 병원 정보 수정
        const updatedHospital = await emergencyApi.updateHospital(editingHospital.id, hospitalData)
        // 수정 후 현재 탭에 맞는 데이터를 다시 로드
        const updatedHospitals = hospitals.map((hospital) =>
          hospital.id === editingHospital.id ? updatedHospital : hospital
        )
        setHospitals(updatedHospitals)
        toast({ title: "병원 정보가 수정되었습니다" })
      } else {
        // 새 병원 추가
        const newHospital = await emergencyApi.createHospital(hospitalData)
        setHospitals([...hospitals, newHospital])
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
    } finally {
      setIsSubmitting(false)
    }
  }

  // 병원 삭제
  const handleDeleteHospital = async (id: number) => {
    try {
      if (confirm("정말로 이 병원 정보를 삭제하시겠습니까?")) {
        await emergencyApi.deleteHospital(id)
        const updatedHospitals = hospitals.filter((hospital) => hospital.id !== id)
        setHospitals(updatedHospitals)
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
  const handleEditHospital = (hospital: HospitalDetail) => {
    setEditingHospital(hospital)
    setName(hospital.name)
    setPhone(hospital.phone)
    setAddress(hospital.address)
    setType(hospital.type)
    setHours(hospital.hours || "")
    setNotes(hospital.notes || "")
    setIsEmergency(hospital.is_emergency)
    setSpecialties(hospital.specialties || [])
    setShowAddForm(true)
  }

  // 폼 초기화
  const resetForm = () => {
    setName("")
    setPhone("")
    setAddress("")
    setType("일반 병원")
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
          <Button className="bg-pink-500 hover:bg-pink-600 text-white" onClick={() => setShowAddForm(true)}>
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
                      disabled={isSubmitting}
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
                      disabled={isSubmitting}
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
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>병원 유형</Label>
                    <RadioGroup value={type} onValueChange={setType} disabled={isSubmitting}>
                      <div className="flex flex-wrap gap-4">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="일반 병원" id="regular" />
                          <Label htmlFor="regular">일반 병원</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="응급 병원" id="emergency" />
                          <Label htmlFor="emergency">응급 병원</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="전문 병원" id="specialist" />
                          <Label htmlFor="specialist">전문 병원</Label>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* 24시간 응급 진료 가능 스위치 */}
                  <div className="flex items-center justify-between space-x-2 p-3 bg-gray-50 rounded-lg">
                    <Label htmlFor="isEmergencySwitch" className="text-sm font-medium">
                      24시간 응급 진료 가능
                    </Label>
                    <Switch
                      id="isEmergencySwitch"
                      checked={isEmergency}
                      onCheckedChange={setIsEmergency}
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hours">진료 시간</Label>
                    <Input
                      id="hours"
                      value={hours}
                      onChange={(e) => setHours(e.target.value)}
                      placeholder="예: 평일 09:00-18:00, 주말 휴무"
                      className="rounded-lg border-gray-300"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>전문 분야</Label>
                    <div className="flex flex-wrap gap-2">
                      {getDisplaySpecialties().map(
                        (specialty) => (
                          <Badge
                            key={specialty}
                            variant={specialties.includes(specialty) ? "default" : "outline"}
                            className={`cursor-pointer transition-colors ${
                              specialties.includes(specialty) 
                                ? "bg-pink-500 hover:bg-pink-600 text-white border-pink-500" 
                                : "hover:bg-pink-100 text-gray-700"
                            } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
                            onClick={() => !isSubmitting && toggleSpecialty(specialty)}
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
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="flex-1" onClick={resetForm} disabled={isSubmitting}>
                    취소
                  </Button>
                  <Button 
                    className="flex-1 bg-pink-500 hover:bg-pink-600 text-white" 
                    onClick={handleSaveHospital}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        {editingHospital ? "수정 중..." : "추가 중..."}
                      </div>
                    ) : (
                      editingHospital ? "수정하기" : "추가하기"
                    )}
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
                ) : hospitals.length > 0 ? (
                  hospitals.map((hospital) => (
                    <motion.div
                      key={hospital.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card
                        className={`bg-white rounded-xl shadow-sm ${
                          hospital.is_emergency ? "border-l-4 border-l-red-500" : ""
                        }`}
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-gray-800">{hospital.name}</h3>
                                {hospital.is_emergency && (
                                  <Badge variant="destructive" className="bg-red-500">
                                    24시
                                  </Badge>
                                )}
                                {hospital.type === "전문 병원" && (
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
                      className="mt-4 bg-pink-500 hover:bg-pink-600 text-white"
                      onClick={() => setShowAddForm(true)}
                    >
                      <Plus className="w-4 h-4 mr-1" /> 병원 추가하기
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            {hospitals.length > 0 && (
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