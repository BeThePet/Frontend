"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Edit, Trash2, Dog, Heart, Calendar, Scale, Pill, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { dogApi, BreedOption, AllergyCategory, DiseaseCategory } from "@/lib/api"

export default function PetDetailContent() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [petInfo, setPetInfo] = useState<any>(null)
  const [breeds, setBreeds] = useState<BreedOption[]>([])
  const [allergyCategories, setAllergyCategories] = useState<AllergyCategory[]>([])
  const [diseaseCategories, setDiseaseCategories] = useState<DiseaseCategory[]>([])

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        
        // 1순위: 백엔드에서 반려견 정보 가져오기
        try {
          const dogInfo = await dogApi.getDogInfo()
          if (dogInfo) {
            // 백엔드 응답을 프론트엔드 형태로 변환
            const petData = {
              id: dogInfo.id,
              name: dogInfo.name,
              birthday: dogInfo.birth_date,
              breedId: null, // breed_name을 통해 breed_id 찾기 필요
              gender: dogInfo.gender,
              weight: dogInfo.weight,
              ageGroup: dogInfo.age_group,
              medicine: dogInfo.medication,
              breed: dogInfo.breed_name,
              allergyIds: [], // 나중에 name을 통해 id 찾기
              diseaseIds: [], // 나중에 name을 통해 id 찾기
              allergy_names: dogInfo.allergy_names,
              disease_names: dogInfo.disease_names
            }
            setPetInfo(petData)
            
            // 백엔드 데이터를 localStorage에도 백업 저장
            localStorage.setItem('registeredPetInfo', JSON.stringify(petData))
          } else {
            // 백엔드에 반려견 정보가 없으면 localStorage 확인
            const savedPetInfo = localStorage.getItem('registeredPetInfo')
            if (savedPetInfo) {
              setPetInfo(JSON.parse(savedPetInfo))
            } else {
              // 반려견 정보가 없으면 등록 페이지로 리디렉션
              router.push('/info')
              return
            }
          }
        } catch (error) {
          console.error('백엔드에서 반려견 정보 로드 실패:', error)
          // 2순위: localStorage에서 반려견 정보 복원
          const savedPetInfo = localStorage.getItem('registeredPetInfo')
          if (savedPetInfo) {
            setPetInfo(JSON.parse(savedPetInfo))
          } else {
            // 반려견 정보가 없으면 등록 페이지로 리디렉션
            router.push('/info')
            return
          }
        }

        // API 데이터 로드 (품종, 알레르기, 질병 옵션들)
        const [breedsData, allergiesData, diseasesData] = await Promise.all([
          dogApi.getBreeds(),
          dogApi.getAllergies(),
          dogApi.getDiseases()
        ])

        setBreeds(breedsData)
        setAllergyCategories(allergiesData)
        setDiseaseCategories(diseasesData)
      } catch (error) {
        console.error('데이터 로드 실패:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router])

  const calculateAge = (birthday: string) => {
    if (!birthday) return "나이 정보 없음"

    const birthDate = new Date(birthday)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()

    if (
      today.getMonth() < birthDate.getMonth() ||
      (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())
    ) {
      age--
    }

    return `${age}살`
  }

  const handleEdit = () => {
    router.push('/info?mode=edit')
  }

  const handleDelete = async () => {
    if (!confirm('반려견 정보를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return
    }

    try {
      setLoading(true)
      
      // 실제 백엔드 API 호출
      await dogApi.deleteDog()
      
      // 로컬스토리지에서도 삭제 (테스트용)
      localStorage.removeItem('registeredPetInfo')
      
      alert('반려견 정보가 삭제되었습니다.')
      router.push('/dashboard')
    } catch (error) {
      console.error('삭제 실패:', error)
      alert('삭제 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const getBreedName = (breedId: number) => {
    const breed = breeds.find(b => b.id === breedId)
    return breed ? breed.name : '품종 정보 없음'
  }

  const getAllergyNames = (allergyIds: number[]) => {
    const names: string[] = []
    allergyCategories.forEach(category => {
      category.items.forEach(item => {
        if (allergyIds.includes(item.id)) {
          names.push(item.name)
        }
      })
    })
    return names
  }

  const getDiseaseNames = (diseaseIds: number[]) => {
    const names: string[] = []
    diseaseCategories.forEach(category => {
      category.items.forEach(item => {
        if (diseaseIds.includes(item.id)) {
          names.push(item.name)
        }
      })
    })
    return names
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-beige flex justify-center items-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  if (!petInfo) {
    return (
      <div className="min-h-screen bg-beige flex flex-col items-center justify-center p-6">
        <div className="text-center">
          <Dog className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">반려견 정보가 없습니다</h2>
          <p className="text-gray-600 mb-6">먼저 반려견 정보를 등록해주세요.</p>
          <Button onClick={() => router.push('/info')} className="bg-pink-500 hover:bg-pink-600">
            반려견 등록하기
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-beige">
      {/* 헤더 */}
      <div className="bg-pink-200 p-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/dashboard" className="text-gray-800 mr-4">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-bold text-gray-800">반려견 정보</h1>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleEdit}
            size="sm"
            variant="outline"
            className="bg-white border-pink-300 text-pink-600 hover:bg-pink-50"
          >
            <Edit className="w-4 h-4 mr-1" />
            수정
          </Button>
          <Button
            onClick={handleDelete}
            size="sm"
            variant="outline"
            className="bg-white border-red-300 text-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            삭제
          </Button>
        </div>
      </div>

      <div className="p-5 space-y-6">
        {/* 기본 정보 카드 */}
        <Card className="bg-white rounded-xl shadow-sm border-2 border-pink-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dog className="w-5 h-5 text-pink-500" />
              기본 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center">
                {petInfo.photoUrl ? (
                  <Image
                    src={petInfo.photoUrl}
                    alt={petInfo.name}
                    width={80}
                    height={80}
                    className="rounded-full object-cover w-full h-full"
                  />
                ) : (
                  <Dog className="w-10 h-10 text-pink-400" />
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">{petInfo.name}</h3>
                <p className="text-gray-600">{getBreedName(petInfo.breedId)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">나이</p>
                  <p className="font-medium">{calculateAge(petInfo.birthday)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">성별</p>
                  <p className="font-medium">{petInfo.gender}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">체중</p>
                  <p className="font-medium">{petInfo.weight ? `${petInfo.weight}kg` : '정보 없음'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">연령대</p>
                  <p className="font-medium">{petInfo.ageGroup || '정보 없음'}</p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-1">생일</p>
              <p className="font-medium">{petInfo.birthday || '정보 없음'}</p>
            </div>
          </CardContent>
        </Card>

        {/* 건강 정보 카드 */}
        <Card className="bg-white rounded-xl shadow-sm border-2 border-pink-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" />
              건강 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 알레르기 */}
            <div>
              <p className="text-sm text-gray-500 mb-2">알레르기</p>
              <div className="flex flex-wrap gap-1">
                {petInfo.allergyIds && petInfo.allergyIds.length > 0 ? (
                  getAllergyNames(petInfo.allergyIds).map((name, index) => (
                    <Badge key={index} variant="secondary" className="bg-red-50 text-red-700 border-red-200">
                      {name}
                    </Badge>
                  ))
                ) : (
                  <span className="text-gray-400">없음</span>
                )}
              </div>
            </div>

            {/* 질병 이력 */}
            <div>
              <p className="text-sm text-gray-500 mb-2">질병 이력</p>
              <div className="flex flex-wrap gap-1">
                {petInfo.diseaseIds && petInfo.diseaseIds.length > 0 ? (
                  getDiseaseNames(petInfo.diseaseIds).map((name, index) => (
                    <Badge key={index} variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                      {name}
                    </Badge>
                  ))
                ) : (
                  <span className="text-gray-400">없음</span>
                )}
              </div>
            </div>

            {/* 현재 복용약 */}
            {petInfo.medicine && (
              <div>
                <p className="text-sm text-gray-500 mb-2">현재 복용약</p>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm">{petInfo.medicine}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 