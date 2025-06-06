"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, AlertTriangle, Search, ChevronRight, Heart, Thermometer, Droplets, X } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { emergencyApi, type EmergencyGuide, type HospitalSummary } from "@/lib/api"

export default function EmergencyContent() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedGuide, setSelectedGuide] = useState<EmergencyGuide | null>(null)
  const [emergencyHospitals, setEmergencyHospitals] = useState<HospitalSummary[]>([])
  const [emergencyGuides, setEmergencyGuides] = useState<EmergencyGuide[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingGuides, setIsLoadingGuides] = useState(false)

  // 병원 정보 및 가이드 불러오기
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        setIsLoadingGuides(true)
        
        // 응급 병원 요약 정보와 응급 가이드를 동시에 불러오기
        const [emergencyHospitalsSummary, guides] = await Promise.all([
          emergencyApi.getEmergencyHospitalsSummary(), // 업데이트된 API 함수 사용
          emergencyApi.getGuides()
        ])
        
        setEmergencyHospitals(emergencyHospitalsSummary)
        setEmergencyGuides(guides)
      } catch (error) {
        console.error("데이터를 불러오는 중 오류가 발생했습니다:", error)
      } finally {
        setIsLoading(false)
        setIsLoadingGuides(false)
      }
    }

    loadData()
  }, [])

  // 가이드 상세 정보 불러오기
  const handleSelectGuide = async (guide: EmergencyGuide) => {
    try {
      const detailGuide = await emergencyApi.getGuideDetail(guide.id)
      if (detailGuide) {
        setSelectedGuide(detailGuide)
      }
    } catch (error) {
      console.error("가이드 상세 정보를 불러오는 중 오류가 발생했습니다:", error)
      // 실패 시 기본 가이드 정보로 표시
      setSelectedGuide(guide)
    }
  }

  // 검색어 필터링
  const filteredGuides = emergencyGuides.filter((guide) => {
    if (!searchTerm) return true
    return (
      guide.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guide.symptoms.some((symptom) => symptom.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  })

  // 아이콘 선택 함수
  const getGuideIcon = (id: string) => {
    switch (id) {
      case "heatstroke":
        return <Thermometer className="h-5 w-5" />
      case "bleeding":
        return <Heart className="h-5 w-5" />
      case "dehydration":
        return <Droplets className="h-5 w-5" />
      default:
        return <AlertTriangle className="h-5 w-5" />
    }
  }

  return (
    <div className="min-h-screen bg-pink-50 pb-20">
      <div className="bg-pink-200 p-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/dashboard" className="text-gray-800">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-bold text-gray-800 ml-4">긴급 상황 가이드</h1>
        </div>
        <Badge variant="destructive" className="bg-red-500 text-white">
          응급 처치
        </Badge>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-5 space-y-6"
      >
        {/* 긴급 연락처 */}
        <Card className="bg-white rounded-xl shadow-sm border-2 border-red-100">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">긴급 상황 안내 🚨</h2>
                <p className="text-sm text-gray-600">응급 상황 시 즉시 가까운 동물병원을 방문하세요.</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <div className="font-medium">응급 상황 발생 시</div>
                <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200">
                  즉시 병원 방문
                </Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-pink-50 rounded-lg">
                <div className="font-medium">병원 방문 전 응급 처치</div>
                <Badge variant="outline" className="bg-pink-100 text-pink-700 border-pink-200">
                  아래 가이드 참고
                </Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div className="font-medium">병원 정보 미리 저장하기</div>
                <Link href="/emergency/hospital">
                  <Button variant="outline" size="sm" className="text-gray-700">
                    병원 정보 관리
                  </Button>
                </Link>
              </div>
            </div>

            {/* 등록된 응급 병원 정보 표시 (is_emergency: true인 병원만) */}
            {isLoading ? (
              <div className="mt-4 border-t border-gray-100 pt-4">
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-500"></div>
                </div>
              </div>
            ) : emergencyHospitals.length > 0 ? (
              <div className="mt-4 border-t border-gray-100 pt-4">
                <h3 className="font-medium text-gray-800 mb-2">24시간 응급 병원</h3>
                <div className="space-y-2">
                  {emergencyHospitals.map((hospital) => (
                    <div key={hospital.id} className="flex justify-between items-center p-2 bg-red-50 rounded-lg">
                      <span className="font-medium text-sm">{hospital.name}</span>
                      <a href={`tel:${hospital.phone}`} className="text-sm text-blue-500">
                        {hospital.phone}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* 검색 필드 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="증상이나 상황을 검색하세요"
            className="pl-10 pr-10 rounded-full border-gray-300 h-12"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-10 w-10 rounded-full"
              onClick={() => setSearchTerm("")}
            >
              <X className="w-5 h-5 text-gray-400" />
            </Button>
          )}
        </div>

        {/* 응급 상황 목록 */}
        {!selectedGuide ? (
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-800">응급 상황 가이드 🚑</h3>
            {isLoadingGuides ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
              </div>
            ) : filteredGuides.length > 0 ? (
              filteredGuides.map((guide) => (
                <motion.div
                  key={guide.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <Card
                    className={`cursor-pointer hover:shadow-md transition-shadow ${
                      guide.severity === "high"
                        ? "border-l-4 border-l-red-500"
                        : guide.severity === "medium"
                          ? "border-l-4 border-l-amber-500"
                          : "border-l-4 border-l-green-500"
                    }`}
                    onClick={() => handleSelectGuide(guide)}
                  >
                    <CardContent className="p-4 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            guide.severity === "high"
                              ? "bg-red-100 text-red-500"
                              : guide.severity === "medium"
                                ? "bg-amber-100 text-amber-500"
                                : "bg-green-100 text-green-500"
                          }`}
                        >
                          {getGuideIcon(guide.id)}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-800">{guide.title}</h4>
                          <p className="text-xs text-gray-500">
                            {guide.symptoms.slice(0, 3).join(", ")}
                            {guide.symptoms.length > 3 ? " 외" : ""}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">검색 결과가 없습니다.</p>
              </div>
            )}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <Button variant="ghost" className="flex items-center gap-2" onClick={() => setSelectedGuide(null)}>
              <ArrowLeft className="w-4 h-4" />
              <span>돌아가기</span>
            </Button>

            <Card
              className={`${
                selectedGuide.severity === "high"
                  ? "border-t-4 border-t-red-500"
                  : selectedGuide.severity === "medium"
                    ? "border-t-4 border-t-amber-500"
                    : "border-t-4 border-t-green-500"
              }`}
            >
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      selectedGuide.severity === "high"
                        ? "bg-red-100 text-red-500"
                        : selectedGuide.severity === "medium"
                          ? "bg-amber-100 text-amber-500"
                          : "bg-green-100 text-green-500"
                    }`}
                  >
                    {getGuideIcon(selectedGuide.id)}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">{selectedGuide.title}</h2>
                    <Badge
                      variant={
                        selectedGuide.severity === "high"
                          ? "destructive"
                          : selectedGuide.severity === "medium"
                            ? "outline"
                            : "secondary"
                      }
                    >
                      {selectedGuide.severity === "high"
                        ? "긴급"
                        : selectedGuide.severity === "medium"
                          ? "주의"
                          : "경미"}
                    </Badge>
                  </div>
                </div>

                <Accordion type="single" collapsible defaultValue="symptoms">
                  <AccordionItem value="symptoms">
                    <AccordionTrigger className="text-base font-medium">증상 🔍</AccordionTrigger>
                    <AccordionContent>
                      <ul className="list-disc pl-5 space-y-1">
                        {selectedGuide.symptoms.map((symptom, index) => (
                          <li key={index} className="text-gray-700">
                            {symptom}
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="firstAid">
                    <AccordionTrigger className="text-base font-medium">응급 처치 🩹</AccordionTrigger>
                    <AccordionContent>
                      <ol className="list-decimal pl-5 space-y-2">
                        {selectedGuide.first_aid.map((step, index) => (
                          <li key={index} className="text-gray-700">
                            {step}
                          </li>
                        ))}
                      </ol>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="notes">
                    <AccordionTrigger className="text-base font-medium">주의사항 ⚠️</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-gray-700">{selectedGuide.notes}</p>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <div className="mt-6">
                  <Link href="/emergency/hospital">
                    <Button className="w-full" variant="outline">
                      내 동물병원 정보 관리하기
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
} 