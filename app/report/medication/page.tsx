"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Plus, Clock, Calendar, Bell, Check, Trash2, Edit, AlertTriangle } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { getData, saveData } from "@/lib/storage"
import { useToast } from "@/hooks/use-toast"
import { scheduleNotification, cancelNotification } from "@/lib/notification"

interface Medication {
  id: string
  name: string
  time: string
  days: string[]
  dosage: string
  isActive: boolean
  notes: string
  startDate: string
  endDate?: string
  notificationEnabled: boolean
}

export default function MedicationPage() {
  const { toast } = useToast()
  const [medications, setMedications] = useState<Medication[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [currentMedication, setCurrentMedication] = useState<Medication | null>(null)

  // 폼 상태
  const [name, setName] = useState("")
  const [time, setTime] = useState("")
  const [days, setDays] = useState<string[]>(["월", "화", "수", "목", "금", "토", "일"])
  const [dosage, setDosage] = useState("")
  const [notes, setNotes] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [notificationEnabled, setNotificationEnabled] = useState(true)

  // 약 정보 불러오기
  useEffect(() => {
    const savedMedications = getData("medications")
    if (savedMedications) {
      setMedications(savedMedications)
    }

    // 오늘 날짜 설정
    const today = new Date()
    const formattedDate = today.toISOString().split("T")[0]
    setStartDate(formattedDate)
  }, [])

  // 약 추가 폼 초기화
  const resetForm = () => {
    setName("")
    setTime("")
    setDays(["월", "화", "수", "목", "금", "토", "일"])
    setDosage("")
    setNotes("")
    setEndDate("")
    setNotificationEnabled(true)
  }

  // 약 추가 처리
  const handleAddMedication = () => {
    if (!name || !time || days.length === 0 || !dosage || !startDate) {
      toast({
        title: "필수 정보를 모두 입력해주세요",
        variant: "destructive",
      })
      return
    }

    const newMedication: Medication = {
      id: Date.now().toString(),
      name,
      time,
      days,
      dosage,
      isActive: true,
      notes,
      startDate,
      endDate: endDate || undefined,
      notificationEnabled,
    }

    const updatedMedications = [...medications, newMedication]
    saveData("medications", updatedMedications)
    setMedications(updatedMedications)

    // 알림 설정
    if (notificationEnabled) {
      scheduleNextNotification(newMedication)
    }

    toast({
      title: "약 정보가 추가되었습니다",
    })

    resetForm()
    setShowAddForm(false)
  }

  // 약 수정 처리
  const handleEditMedication = () => {
    if (!currentMedication || !name || !time || days.length === 0 || !dosage || !startDate) {
      toast({
        title: "필수 정보를 모두 입력해주세요",
        variant: "destructive",
      })
      return
    }

    // 기존 알림 취소
    if (currentMedication.notificationEnabled) {
      cancelNotification(`medication_${currentMedication.id}`)
    }

    const updatedMedication: Medication = {
      ...currentMedication,
      name,
      time,
      days,
      dosage,
      notes,
      startDate,
      endDate: endDate || undefined,
      notificationEnabled,
    }

    const updatedMedications = medications.map((med) => (med.id === currentMedication.id ? updatedMedication : med))

    saveData("medications", updatedMedications)
    setMedications(updatedMedications)

    // 알림 재설정
    if (notificationEnabled) {
      scheduleNextNotification(updatedMedication)
    }

    toast({
      title: "약 정보가 수정되었습니다",
    })

    resetForm()
    setShowEditForm(false)
    setCurrentMedication(null)
  }

  // 약 삭제 처리
  const handleDeleteMedication = (id: string) => {
    // 알림 취소
    cancelNotification(`medication_${id}`)

    const updatedMedications = medications.filter((med) => med.id !== id)
    saveData("medications", updatedMedications)
    setMedications(updatedMedications)

    toast({
      title: "약 정보가 삭제되었습니다",
    })

    if (showEditForm && currentMedication?.id === id) {
      setShowEditForm(false)
      setCurrentMedication(null)
      resetForm()
    }
  }

  // 약 활성화/비활성화 처리
  const toggleMedicationActive = (id: string) => {
    const updatedMedications = medications.map((med) => {
      if (med.id === id) {
        const updated = { ...med, isActive: !med.isActive }

        // 알림 상태 업데이트
        if (updated.notificationEnabled) {
          if (updated.isActive) {
            scheduleNextNotification(updated)
          } else {
            cancelNotification(`medication_${id}`)
          }
        }

        return updated
      }
      return med
    })

    saveData("medications", updatedMedications)
    setMedications(updatedMedications)

    toast({
      title: updatedMedications.find((med) => med.id === id)?.isActive
        ? "약 복용이 활성화되었습니다"
        : "약 복용이 비활성화되었습니다",
    })
  }

  // 약 수정 폼 열기
  const openEditForm = (medication: Medication) => {
    setCurrentMedication(medication)
    setName(medication.name)
    setTime(medication.time)
    setDays(medication.days)
    setDosage(medication.dosage)
    setNotes(medication.notes || "")
    setStartDate(medication.startDate)
    setEndDate(medication.endDate || "")
    setNotificationEnabled(medication.notificationEnabled)
    setShowEditForm(true)
  }

  // 요일 선택 토글
  const toggleDay = (day: string) => {
    if (days.includes(day)) {
      setDays(days.filter((d) => d !== day))
    } else {
      setDays([...days, day])
    }
  }

  // 다음 알림 예약
  const scheduleNextNotification = (medication: Medication) => {
    if (!medication.notificationEnabled || !medication.isActive) return

    const now = new Date()
    const [hours, minutes] = medication.time.split(":").map(Number)

    // 오늘 날짜의 약 복용 시간 설정
    const notificationTime = new Date()
    notificationTime.setHours(hours, minutes, 0, 0)

    // 요일 확인 (한국어 요일을 숫자로 변환)
    const dayMap: Record<string, number> = {
      일: 0,
      월: 1,
      화: 2,
      수: 3,
      목: 4,
      금: 5,
      토: 6,
    }

    const today = now.getDay()
    const todayName = Object.keys(dayMap).find((key) => dayMap[key] === today)

    // 오늘이 약 복용 요일이고, 알림 시간이 아직 지나지 않았으면 오늘 알림 설정
    if (todayName && medication.days.includes(todayName) && notificationTime > now) {
      scheduleNotification(
        `medication_${medication.id}`,
        "약 복용 시간",
        `${medication.name} ${medication.dosage}을(를) 복용할 시간입니다.`,
        notificationTime,
        "/report/medication",
      )
      return
    }

    // 다음 복용 요일 찾기
    let daysToAdd = 1
    let nextDay = (today + daysToAdd) % 7
    let nextDayName = Object.keys(dayMap).find((key) => dayMap[key] === nextDay)

    while (nextDayName && !medication.days.includes(nextDayName)) {
      daysToAdd++
      nextDay = (today + daysToAdd) % 7
      nextDayName = Object.keys(dayMap).find((key) => dayMap[key] === nextDay)
    }

    // 다음 복용일 설정
    const nextDate = new Date()
    nextDate.setDate(now.getDate() + daysToAdd)
    nextDate.setHours(hours, minutes, 0, 0)

    // 종료일이 있고 다음 복용일이 종료일 이후면 알림 설정 안함
    if (medication.endDate) {
      const endDate = new Date(medication.endDate)
      if (nextDate > endDate) return
    }

    // 알림 예약
    scheduleNotification(
      `medication_${medication.id}`,
      "약 복용 시간",
      `${medication.name} ${medication.dosage}을(를) 복용할 시간입니다.`,
      nextDate,
      "/report/medication",
    )
  }

  return (
    <div className="min-h-screen bg-pink-50 pb-20">
      <div className="bg-pink-200 p-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/report" className="text-gray-800">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-bold text-gray-800 ml-4">약 관리</h1>
        </div>
        <Button
          size="icon"
          className="bg-pink-500 hover:bg-pink-600 h-9 w-9 rounded-full"
          onClick={() => {
            resetForm()
            setShowAddForm(true)
          }}
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-5 space-y-6"
      >
        {/* 약 목록 */}
        {medications.length > 0 ? (
          <div className="space-y-4">
            {medications.map((medication) => (
              <Card
                key={medication.id}
                className={`bg-white rounded-xl shadow-sm ${
                  medication.isActive ? "border-l-4 border-l-pink-500" : "border-l-4 border-l-gray-300"
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-800">{medication.name}</h3>
                        {!medication.isActive && (
                          <Badge variant="outline" className="bg-gray-100 text-gray-500">
                            비활성
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>{medication.time}</span>
                        <span>•</span>
                        <span>{medication.days.join(", ")}</span>
                      </div>
                      <div className="mt-2">
                        <Badge variant="outline" className="bg-pink-50 text-pink-700">
                          {medication.dosage}
                        </Badge>
                      </div>
                      {medication.notes && <p className="mt-2 text-sm text-gray-500">{medication.notes}</p>}
                      <div className="mt-2 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {medication.startDate} ~ {medication.endDate || "계속"}
                          </span>
                        </div>
                        {medication.notificationEnabled && (
                          <div className="flex items-center gap-1 mt-1">
                            <Bell className="h-3 w-3" />
                            <span>알림 활성화됨</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 rounded-full"
                        onClick={() => toggleMedicationActive(medication.id)}
                      >
                        <Check className={`h-4 w-4 ${medication.isActive ? "text-green-500" : "text-gray-400"}`} />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 rounded-full"
                        onClick={() => openEditForm(medication)}
                      >
                        <Edit className="h-4 w-4 text-gray-500" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 rounded-full text-red-500"
                        onClick={() => handleDeleteMedication(medication.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <div className="bg-pink-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-8 w-8 text-pink-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-800">등록된 약이 없습니다</h3>
            <p className="text-gray-500 mt-1">+ 버튼을 눌러 약을 추가해보세요</p>
          </div>
        )}
      </motion.div>

      {/* 약 추가 모달 */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
          >
            <div className="p-5">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">약 추가</h2>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 rounded-full"
                  onClick={() => setShowAddForm(false)}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">약 이름</Label>
                  <Input
                    id="name"
                    placeholder="약 이름을 입력하세요"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="time">복용 시간</Label>
                  <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
                </div>

                <div>
                  <Label>복용 요일</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {["월", "화", "수", "목", "금", "토", "일"].map((day) => (
                      <Button
                        key={day}
                        type="button"
                        variant="outline"
                        className={`rounded-full px-3 py-1 h-auto ${
                          days.includes(day) ? "bg-pink-100 text-pink-700 border-pink-200" : ""
                        }`}
                        onClick={() => toggleDay(day)}
                      >
                        {day}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="dosage">복용량</Label>
                  <Input
                    id="dosage"
                    placeholder="예: 1정, 5ml 등"
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">시작일</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">종료일 (선택)</Label>
                    <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">메모 (선택)</Label>
                  <Textarea
                    id="notes"
                    placeholder="추가 정보를 입력하세요"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="notification">알림 설정</Label>
                  <Switch id="notification" checked={notificationEnabled} onCheckedChange={setNotificationEnabled} />
                </div>

                <Button className="w-full bg-pink-500 hover:bg-pink-600" onClick={handleAddMedication}>
                  약 추가하기
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* 약 수정 모달 */}
      {showEditForm && currentMedication && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
          >
            <div className="p-5">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">약 수정</h2>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 rounded-full"
                  onClick={() => setShowEditForm(false)}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-name">약 이름</Label>
                  <Input
                    id="edit-name"
                    placeholder="약 이름을 입력하세요"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="edit-time">복용 시간</Label>
                  <Input id="edit-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
                </div>

                <div>
                  <Label>복용 요일</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {["월", "화", "수", "목", "금", "토", "일"].map((day) => (
                      <Button
                        key={day}
                        type="button"
                        variant="outline"
                        className={`rounded-full px-3 py-1 h-auto ${
                          days.includes(day) ? "bg-pink-100 text-pink-700 border-pink-200" : ""
                        }`}
                        onClick={() => toggleDay(day)}
                      >
                        {day}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="edit-dosage">복용량</Label>
                  <Input
                    id="edit-dosage"
                    placeholder="예: 1정, 5ml 등"
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-startDate">시작일</Label>
                    <Input
                      id="edit-startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-endDate">종료일 (선택)</Label>
                    <Input id="edit-endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                  </div>
                </div>

                <div>
                  <Label htmlFor="edit-notes">메모 (선택)</Label>
                  <Textarea
                    id="edit-notes"
                    placeholder="추가 정보를 입력하세요"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="edit-notification">알림 설정</Label>
                  <Switch
                    id="edit-notification"
                    checked={notificationEnabled}
                    onCheckedChange={setNotificationEnabled}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleDeleteMedication(currentMedication.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    삭제
                  </Button>
                  <Button className="flex-1 bg-pink-500 hover:bg-pink-600" onClick={handleEditMedication}>
                    수정 완료
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
