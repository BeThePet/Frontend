"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Plus, Pill, Clock, Calendar, Trash2 } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Checkbox } from "@/components/ui/checkbox"
import { medicationApi, MedicationRequest, MedicationResponse } from "@/lib/api"
import { getData } from "@/lib/storage"
import { scheduleNotification, cancelNotification } from "@/lib/notification"

export default function MedicationContent() {
  const { toast } = useToast()
  const [petInfo, setPetInfo] = useState<any>(null)
  const [medications, setMedications] = useState<MedicationResponse[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [newMedication, setNewMedication] = useState<MedicationRequest>({
    name: "",
    dosage: "",
    weekdays: "",
    time: "08:00:00",
    start_date: "",
    end_date: "",
    alarm_enabled: true,
    memo: "",
  })
  const [selectedWeekdays, setSelectedWeekdays] = useState<string[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)

  const weekdayOptions = [
    { value: "월", label: "월요일" },
    { value: "화", label: "화요일" },
    { value: "수", label: "수요일" },
    { value: "목", label: "목요일" },
    { value: "금", label: "금요일" },
    { value: "토", label: "토요일" },
    { value: "일", label: "일요일" },
  ]

  useEffect(() => {
    // 반려견 정보 불러오기
    const savedPetInfo = getData("petInfo")
    if (savedPetInfo) {
      setPetInfo(savedPetInfo)
    }

    // 약 정보 불러오기
    loadMedications()

    // 현재 날짜 설정
    const today = new Date()
    const formattedDate = today.toISOString().split("T")[0]
    setNewMedication((prev) => ({ ...prev, start_date: formattedDate }))
  }, [])

  // 약 알림 스케줄링 함수
  const scheduleMedicationNotifications = (medication: MedicationResponse) => {
    if (!medication.alarm_enabled) return

    // 먼저 기존 알림들을 취소
    cancelMedicationNotifications(medication.id)

    const [hours, minutes] = medication.time.split(':').map(Number)
    const today = new Date()
    
    // 오늘과 내일 알림 스케줄링 (해당 요일인 경우만)
    for (let i = 0; i < 2; i++) {
      const scheduleDate = new Date(today)
      scheduleDate.setDate(today.getDate() + i)
      scheduleDate.setHours(hours, minutes, 0, 0)

      // 이미 지난 시간이면 스킵
      if (scheduleDate <= new Date()) continue

      // 해당 날짜가 복용 요일인지 확인
      const weekdays = ['일', '월', '화', '수', '목', '금', '토']
      const dayWeekday = weekdays[scheduleDate.getDay()]
      const weekdaysList = medication.weekdays.split(', ').map(day => day.trim())
      
      if (!weekdaysList.includes(dayWeekday)) continue

      const notificationId = `medication-${medication.id}-${scheduleDate.toDateString()}`
      
      scheduleNotification(
        notificationId,
        `${medication.name} 복용 시간`,
        `${medication.dosage} 복용해주세요`,
        scheduleDate,
        "/medication"
      )
    }
  }

  // 약 알림 취소 함수 (개별 약)
  const cancelMedicationNotifications = (medicationId: number) => {
    const today = new Date()
    
    // 오늘과 내일 알림 취소
    for (let i = 0; i < 2; i++) {
      const scheduleDate = new Date(today)
      scheduleDate.setDate(today.getDate() + i)
      const notificationId = `medication-${medicationId}-${scheduleDate.toDateString()}`
      cancelNotification(notificationId)
    }
  }

  const loadMedications = async () => {
    try {
      setIsLoading(true)
      const medicationList = await medicationApi.getMedications()
      setMedications(medicationList)
      
      // 각 약의 기존 알림만 취소하고 다시 스케줄링 (전체 리셋 안함)
      medicationList.forEach(med => {
        if (med.alarm_enabled) {
          scheduleMedicationNotifications(med)
        }
      })
    } catch (error) {
      console.error("약 정보 로드 실패:", error)
      toast({
        title: "약 정보 로드 실패",
        description: "약 정보를 불러오는데 실패했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof MedicationRequest, value: string | boolean) => {
    setNewMedication((prev) => ({ ...prev, [field]: value }))
  }

  const handleWeekdayChange = (weekday: string, checked: boolean) => {
    let updatedWeekdays
    if (checked) {
      updatedWeekdays = [...selectedWeekdays, weekday]
    } else {
      updatedWeekdays = selectedWeekdays.filter((day) => day !== weekday)
    }
    setSelectedWeekdays(updatedWeekdays)
    setNewMedication((prev) => ({ ...prev, weekdays: updatedWeekdays.join(", ") }))
  }

  const handleAddMedication = async () => {
    // 필수 필드 검증
    if (!newMedication.name || !newMedication.dosage || !newMedication.start_date || !newMedication.time) {
      toast({
        title: "필수 정보를 입력해주세요",
        description: "약 이름, 용량, 시작일, 복용 시간은 필수 입력 항목입니다.",
        variant: "destructive",
      })
      return
    }

    if (selectedWeekdays.length === 0) {
      toast({
        title: "복용 요일을 선택해주세요",
        description: "최소 하나의 요일을 선택해야 합니다.",
        variant: "destructive",
      })
      return
    }

    // 종료일이 시작일보다 이전인지 검증
    if (newMedication.end_date && newMedication.end_date < newMedication.start_date) {
      toast({
        title: "종료일 오류",
        description: "종료일은 시작일보다 이후여야 합니다.",
        variant: "destructive",
      })
      return
    }

    // 시작일이 종료일보다 이후인지 검증
    if (newMedication.end_date && newMedication.start_date > newMedication.end_date) {
      toast({
        title: "시작일 오류",
        description: "시작일은 종료일보다 이전이어야 합니다.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      
      // 종료일이 비어있거나 null이면 제거
      const requestData = { ...newMedication }
      if (!requestData.end_date || requestData.end_date === null) {
        delete (requestData as any).end_date
      }
      
      let result: MedicationResponse
      
      if (isEditing && editingId) {
        // 기존 알림 취소
        cancelMedicationNotifications(editingId)
        
        // PUT 요청으로 기존 약 정보 업데이트
        result = await medicationApi.updateMedication(editingId, requestData)
        toast({
          title: "약 정보 수정 완료",
          description: "약 정보가 수정되었습니다.",
        })
      } else {
        // POST 요청으로 새 약 정보 추가
        result = await medicationApi.createMedication(requestData)
        toast({
          title: "약 정보 추가 완료",
          description: "새로운 약이 추가되었습니다.",
        })
      }

      // 알림이 활성화되어 있으면 스케줄링
      if (result.alarm_enabled) {
        scheduleMedicationNotifications(result)
      }

      // 목록 새로고침
      await loadMedications()
      
      // 폼 초기화 및 다이얼로그 닫기
      resetForm()
      setIsDialogOpen(false)
    } catch (error) {
      console.error("약 정보 저장 실패:", error)
      toast({
        title: "저장 실패",
        description: "약 정보 저장에 실패했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditMedication = (medication: MedicationResponse) => {
    const weekdayList = medication.weekdays ? medication.weekdays.split(", ") : []
    setSelectedWeekdays(weekdayList)
    
    setNewMedication({
      name: medication.name,
      dosage: medication.dosage,
      weekdays: medication.weekdays,
      time: medication.time,
      start_date: medication.start_date,
      end_date: medication.end_date || "",
      alarm_enabled: medication.alarm_enabled,
      memo: medication.memo || "",
    })
    setIsEditing(true)
    setEditingId(medication.id)
    setIsDialogOpen(true)
  }

  const handleDeleteMedication = async (id: number) => {
    try {
      setIsLoading(true)
      
      // 알림 취소
      cancelMedicationNotifications(id)
      
      await medicationApi.deleteMedication(id)
      await loadMedications()
      
      toast({
        title: "약 정보 삭제 완료",
        description: "약 정보가 삭제되었습니다.",
      })
    } catch (error) {
      console.error("약 정보 삭제 실패:", error)
      toast({
        title: "삭제 실패",
        description: "약 정보 삭제에 실패했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleActive = async (id: number, currentStatus: boolean) => {
    try {
      const medication = medications.find(med => med.id === id)
      if (!medication) return

      const updatedMedication: MedicationRequest = {
        name: medication.name,
        dosage: medication.dosage,
        weekdays: medication.weekdays,
        time: medication.time,
        start_date: medication.start_date,
        end_date: medication.end_date || "",
        alarm_enabled: !currentStatus,
        memo: medication.memo || "",
      }

      // 종료일이 비어있거나 null이면 제거
      if (!updatedMedication.end_date || updatedMedication.end_date === null) {
        delete (updatedMedication as any).end_date
      }

      // 알림 상태에 따라 스케줄링/취소
      if (!currentStatus) {
        // 알림 활성화 - 스케줄링
        const result = await medicationApi.updateMedication(id, updatedMedication)
        scheduleMedicationNotifications(result)
      } else {
        // 알림 비활성화 - 취소
        cancelMedicationNotifications(id)
        await medicationApi.updateMedication(id, updatedMedication)
      }

      await loadMedications()

      toast({
        title: !currentStatus ? "약 알림 활성화" : "약 알림 비활성화",
        description: !currentStatus
          ? `${medication.name} 알림이 활성화되었습니다.`
          : `${medication.name} 알림이 비활성화되었습니다.`,
      })
    } catch (error) {
      console.error("알림 설정 변경 실패:", error)
      toast({
        title: "설정 변경 실패",
        description: "알림 설정 변경에 실패했습니다.",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setNewMedication({
      name: "",
      dosage: "",
      weekdays: "",
      time: "08:00:00",
      start_date: new Date().toISOString().split("T")[0],
      end_date: "",
      alarm_enabled: true,
      memo: "",
    })
    setSelectedWeekdays([])
    setIsEditing(false)
    setEditingId(null)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`
  }

  const formatTime = (timeString: string) => {
    if (!timeString) return ""
    return timeString.substring(0, 5) // HH:MM 형식으로 표시
  }

  // 요일 매칭 함수
  const getTodayWeekday = () => {
    const weekdays = ['일', '월', '화', '수', '목', '금', '토']
    const today = new Date()
    return weekdays[today.getDay()]
  }

  const isTodayMedicationDay = (weekdaysString: string) => {
    if (!weekdaysString) return false
    const todayWeekday = getTodayWeekday()
    const weekdaysList = weekdaysString.split(', ').map(day => day.trim())
    return weekdaysList.includes(todayWeekday)
  }

  return (
    <div className="min-h-screen bg-beige pb-20">
      <div className="bg-blue-light p-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/dashboard" className="text-gray-800">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-bold text-gray-800 ml-4">약 복용 관리</h1>
        </div>
        <Button
          size="icon"
          className="rounded-full bg-white w-10 h-10 shadow-md active:scale-95 transition-transform text-blue-500"
          onClick={() => {
            resetForm()
            setIsDialogOpen(true)
          }}
          disabled={isLoading}
        >
          <Plus className="w-5 h-5" />
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-5 space-y-6"
      >
        <Card className="bg-white rounded-xl shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-light rounded-full flex items-center justify-center">
                <Pill className="w-6 h-6 text-blue-DEFAULT" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">{petInfo?.name || "반려견"}의 약 복용 관리</h2>
                <p className="text-sm text-gray-600">약 복용 시간을 설정하고 알림을 받아보세요.</p>
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-gray-500">로딩 중...</p>
              </div>
            ) : medications.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">등록된 약이 없습니다.</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    resetForm()
                    setIsDialogOpen(true)
                  }}
                >
                  약 추가하기
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {medications.map((medication) => (
                  <Card key={medication.id} className="border rounded-lg overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-3 h-3 rounded-full ${medication.alarm_enabled ? "bg-green-500" : "bg-gray-300"}`}
                          />
                          <h3 className="font-medium text-gray-800">{medication.name}</h3>
                          {isTodayMedicationDay(medication.weekdays) && (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              오늘
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={medication.alarm_enabled}
                            onCheckedChange={() => handleToggleActive(medication.id, medication.alarm_enabled)}
                            disabled={isLoading}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-500"
                            onClick={() => handleEditMedication(medication)}
                            disabled={isLoading}
                          >
                            <Pill className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500"
                            onClick={() => handleDeleteMedication(medication.id)}
                            disabled={isLoading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-2 mt-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>{formatTime(medication.time)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>{medication.weekdays}</span>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center gap-2">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {medication.dosage}
                        </Badge>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>
                            {formatDate(medication.start_date)}
                            {medication.end_date ? ` ~ ${formatDate(medication.end_date)}` : ""}
                          </span>
                        </div>
                      </div>

                      {medication.memo && (
                        <div className="mt-2">
                          <span className="text-xs text-gray-500">{medication.memo}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* 약 추가/수정 다이얼로그 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? "약 정보 수정" : "새 약 추가"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">약 이름 *</Label>
              <Input
                id="name"
                value={newMedication.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="약 이름을 입력하세요"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dosage">용량 *</Label>
              <Input
                id="dosage"
                value={newMedication.dosage}
                onChange={(e) => handleInputChange("dosage", e.target.value)}
                placeholder="예: 1정, 5ml 등"
              />
            </div>
            <div className="space-y-2">
              <Label>복용 요일 *</Label>
              <div className="grid grid-cols-4 gap-2">
                {weekdayOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={option.value}
                      checked={selectedWeekdays.includes(option.value)}
                      onCheckedChange={(checked) => handleWeekdayChange(option.value, checked as boolean)}
                    />
                    <Label htmlFor={option.value} className="text-sm">
                      {option.value}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">복용 시간 *</Label>
              <Input
                id="time"
                type="time"
                value={newMedication.time.substring(0, 5)}
                onChange={(e) => handleInputChange("time", `${e.target.value}:00`)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">시작일 *</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={newMedication.start_date}
                  max={newMedication.end_date || undefined}
                  onChange={(e) => handleInputChange("start_date", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">종료일 (선택)</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={newMedication.end_date || ""}
                  min={newMedication.start_date}
                  onChange={(e) => handleInputChange("end_date", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="memo">메모 (선택)</Label>
              <Input
                id="memo"
                value={newMedication.memo || ""}
                onChange={(e) => handleInputChange("memo", e.target.value)}
                placeholder="추가 정보를 입력하세요"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="alarm_enabled"
                checked={newMedication.alarm_enabled}
                onCheckedChange={(checked) => handleInputChange("alarm_enabled", checked)}
              />
              <Label htmlFor="alarm_enabled">알림 활성화</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isLoading}>
              취소
            </Button>
            <Button onClick={handleAddMedication} disabled={isLoading}>
              {isLoading ? "처리 중..." : isEditing ? "수정하기" : "추가하기"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 