"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Plus, Pill, Clock, Calendar, Trash2, Bell, Check } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { getData, saveData } from "@/lib/storage"
import { useToast } from "@/hooks/use-toast"

type Medication = {
  id: string
  name: string
  dosage: string
  frequency: string
  time: string
  startDate: string
  endDate: string
  isActive: boolean
  notes: string
}

export default function MedicationPage() {
  const { toast } = useToast()
  const [petInfo, setPetInfo] = useState<any>(null)
  const [medications, setMedications] = useState<Medication[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newMedication, setNewMedication] = useState<Medication>({
    id: "",
    name: "",
    dosage: "",
    frequency: "daily",
    time: "08:00",
    startDate: "",
    endDate: "",
    isActive: true,
    notes: "",
  })
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    // 반려견 정보 불러오기
    const savedPetInfo = getData("petInfo")
    if (savedPetInfo) {
      setPetInfo(savedPetInfo)
    }

    // 약 정보 불러오기
    const savedMedications = getData("medications")
    if (savedMedications) {
      setMedications(savedMedications)
    }

    // 현재 날짜 설정
    const today = new Date()
    const formattedDate = today.toISOString().split("T")[0]
    setNewMedication((prev) => ({ ...prev, startDate: formattedDate }))
  }, [])

  const handleInputChange = (field: keyof Medication, value: string) => {
    setNewMedication((prev) => ({ ...prev, [field]: value }))
  }

  const handleAddMedication = () => {
    // 필수 필드 검증
    if (!newMedication.name || !newMedication.dosage || !newMedication.startDate) {
      toast({
        title: "필수 정보를 입력해주세요",
        description: "약 이름, 용량, 시작일은 필수 입력 항목입니다.",
        variant: "destructive",
      })
      return
    }

    const updatedMedications = [...medications]

    if (isEditing) {
      // 기존 약 정보 업데이트
      const index = updatedMedications.findIndex((med) => med.id === newMedication.id)
      if (index !== -1) {
        updatedMedications[index] = newMedication
      }
    } else {
      // 새 약 정보 추가
      const newId = Date.now().toString()
      updatedMedications.push({ ...newMedication, id: newId })
    }

    // 데이터 저장
    saveData("medications", updatedMedications)
    setMedications(updatedMedications)

    // 성공 메시지 표시
    toast({
      title: isEditing ? "약 정보 수정 완료" : "약 정보 추가 완료",
      description: isEditing ? "약 정보가 수정되었습니다." : "새로운 약이 추가되었습니다.",
    })

    // 폼 초기화 및 다이얼로그 닫기
    resetForm()
    setIsDialogOpen(false)
  }

  const handleEditMedication = (medication: Medication) => {
    setNewMedication(medication)
    setIsEditing(true)
    setIsDialogOpen(true)
  }

  const handleDeleteMedication = (id: string) => {
    const updatedMedications = medications.filter((med) => med.id !== id)
    saveData("medications", updatedMedications)
    setMedications(updatedMedications)

    toast({
      title: "약 정보 삭제 완료",
      description: "약 정보가 삭제되었습니다.",
    })
  }

  const handleToggleActive = (id: string) => {
    const updatedMedications = medications.map((med) => (med.id === id ? { ...med, isActive: !med.isActive } : med))
    saveData("medications", updatedMedications)
    setMedications(updatedMedications)

    const medication = updatedMedications.find((med) => med.id === id)
    toast({
      title: medication?.isActive ? "약 알림 활성화" : "약 알림 비활성화",
      description: medication?.isActive
        ? `${medication.name} 알림이 활성화되었습니다.`
        : `${medication.name} 알림이 비활성화되었습니다.`,
    })
  }

  const resetForm = () => {
    setNewMedication({
      id: "",
      name: "",
      dosage: "",
      frequency: "daily",
      time: "08:00",
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
      isActive: true,
      notes: "",
    })
    setIsEditing(false)
  }

  const getFrequencyText = (frequency: string) => {
    switch (frequency) {
      case "daily":
        return "매일"
      case "twice":
        return "하루 2회"
      case "three":
        return "하루 3회"
      case "weekly":
        return "주 1회"
      case "biweekly":
        return "격주"
      case "monthly":
        return "월 1회"
      default:
        return frequency
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`
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

            {medications.length === 0 ? (
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
                            className={`w-3 h-3 rounded-full ${medication.isActive ? "bg-green-500" : "bg-gray-300"}`}
                          />
                          <h3 className="font-medium text-gray-800">{medication.name}</h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={medication.isActive}
                            onCheckedChange={() => handleToggleActive(medication.id)}
                            size="sm"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-500"
                            onClick={() => handleEditMedication(medication)}
                          >
                            <Pill className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500"
                            onClick={() => handleDeleteMedication(medication.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>
                            {medication.time} • {getFrequencyText(medication.frequency)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {formatDate(medication.startDate)}
                            {medication.endDate ? ` ~ ${formatDate(medication.endDate)}` : ""}
                          </span>
                        </div>
                      </div>

                      <div className="mt-2 flex items-center gap-2">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {medication.dosage}
                        </Badge>
                        {medication.notes && <span className="text-xs text-gray-500 truncate">{medication.notes}</span>}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 오늘의 복용 일정 */}
        <Card className="bg-white rounded-xl shadow-sm">
          <CardContent className="p-5">
            <h3 className="font-semibold text-gray-800 mb-3">오늘의 복용 일정</h3>

            {medications.filter((med) => med.isActive).length === 0 ? (
              <p className="text-gray-500 text-center py-4">오늘 복용할 약이 없습니다.</p>
            ) : (
              <div className="space-y-3">
                {medications
                  .filter((med) => med.isActive)
                  .sort((a, b) => a.time.localeCompare(b.time))
                  .map((med) => (
                    <div key={med.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Bell className="h-5 w-5 text-blue-500" />
                        <div>
                          <div className="font-medium">{med.name}</div>
                          <div className="text-sm text-gray-600">{med.dosage}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{med.time}</span>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 rounded-full bg-green-100 text-green-700"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="frequency">복용 주기</Label>
                <Select
                  value={newMedication.frequency}
                  onValueChange={(value) => handleInputChange("frequency", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="복용 주기" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">매일</SelectItem>
                    <SelectItem value="twice">하루 2회</SelectItem>
                    <SelectItem value="three">하루 3회</SelectItem>
                    <SelectItem value="weekly">주 1회</SelectItem>
                    <SelectItem value="biweekly">격주</SelectItem>
                    <SelectItem value="monthly">월 1회</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">복용 시간</Label>
                <Input
                  id="time"
                  type="time"
                  value={newMedication.time}
                  onChange={(e) => handleInputChange("time", e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">시작일 *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={newMedication.startDate}
                  onChange={(e) => handleInputChange("startDate", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">종료일 (선택)</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={newMedication.endDate}
                  onChange={(e) => handleInputChange("endDate", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">메모 (선택)</Label>
              <Input
                id="notes"
                value={newMedication.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="추가 정보를 입력하세요"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={newMedication.isActive}
                onCheckedChange={(checked) => handleInputChange("isActive", checked ? "true" : "false")}
              />
              <Label htmlFor="isActive">알림 활성화</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleAddMedication}>{isEditing ? "수정하기" : "추가하기"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
