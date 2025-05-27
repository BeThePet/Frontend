"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, AlertTriangle, MapPin, Phone, Clock } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getData } from "@/lib/storage"

interface Hospital {
  id: string
  name: string
  phone: string
  address: string
  isEmergency: boolean
  hours: string
  distance?: string
}

export default function HospitalContent() {
  const [mounted, setMounted] = useState(false)
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setMounted(true)
    // 병원 정보 불러오기
    const savedHospitals = getData("hospitalInfo")
    if (savedHospitals) {
      setHospitals(savedHospitals)
    } else {
      // 샘플 데이터
      const sampleHospitals: Hospital[] = [
        {
          id: "1",
          name: "24시 동물메디컬센터",
          phone: "02-1234-5678",
          address: "서울시 강남구 테헤란로 123",
          isEmergency: true,
          hours: "24시간",
          distance: "1.2km",
        },
        {
          id: "2",
          name: "우리동네 동물병원",
          phone: "02-9876-5432",
          address: "서울시 서초구 서초대로 456",
          isEmergency: false,
          hours: "평일 09:00-18:00",
          distance: "2.5km",
        },
      ]
      setHospitals(sampleHospitals)
    }
    setIsLoading(false)
  }, [])

  if (!mounted) return null

  const emergencyHospitals = hospitals.filter((hospital) => hospital.isEmergency)
  const regularHospitals = hospitals.filter((hospital) => !hospital.isEmergency)

  return (
    <div className="min-h-screen bg-beige pb-20">
      <div className="bg-red-100 p-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/emergency" className="text-gray-800">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-bold text-gray-800 ml-4">주변 동물병원</h1>
        </div>
        <Badge variant="destructive" className="bg-red-500">
          긴급
        </Badge>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-5 space-y-6"
      >
        {/* 긴급 안내 */}
        <Card className="bg-white rounded-xl shadow-sm border-2 border-red-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              <p className="text-sm text-gray-700">
                긴급 상황 시 반드시 전화로 방문 가능 여부를 확인하세요.
              </p>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
          </div>
        ) : (
          <>
            {/* 24시 응급 병원 */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-800">24시 응급 병원</h2>
              {emergencyHospitals.length > 0 ? (
                emergencyHospitals.map((hospital) => (
                  <HospitalCard key={hospital.id} hospital={hospital} />
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">주변에 24시 응급 병원이 없습니다.</p>
              )}
            </div>

            {/* 일반 병원 */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-800">일반 병원</h2>
              {regularHospitals.length > 0 ? (
                regularHospitals.map((hospital) => (
                  <HospitalCard key={hospital.id} hospital={hospital} />
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">주변에 일반 병원이 없습니다.</p>
              )}
            </div>
          </>
        )}
      </motion.div>
    </div>
  )
}

function HospitalCard({ hospital }: { hospital: Hospital }) {
  const handleFindRoute = () => {
    if (typeof window !== "undefined") {
      window.open(`https://map.naver.com/search/${encodeURIComponent(hospital.name)}`)
    }
  }

  return (
    <Card className="bg-white rounded-xl shadow-sm">
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
              {hospital.distance && (
                <Badge variant="outline" className="text-gray-600">
                  {hospital.distance}
                </Badge>
              )}
            </div>

            <div className="mt-2 space-y-1 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <a href={`tel:${hospital.phone}`} className="text-blue-500">
                  {hospital.phone}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{hospital.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{hospital.hours}</span>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="text-blue-600 border-blue-200"
            onClick={handleFindRoute}
          >
            <MapPin className="w-4 h-4 mr-1" />
            길찾기
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 