"use client"

import { useState, useEffect } from "react"
import { saveData, getData } from "@/lib/storage"
import { useToast } from "@/hooks/use-toast"

export default function ManagePetInfoPage() {
  const { toast } = useToast()
  const [activeType, setActiveType] = useState("walk")
  const [walkDistance, setWalkDistance] = useState(1.5)
  const [walkTime, setWalkTime] = useState(30) // 산책 시간(분)
  const [walkCount, setWalkCount] = useState(1) // 산책 횟수
  const [feedTime, setFeedTime] = useState("")
  const [feedBrand, setFeedBrand] = useState("")
  const [feedAmount, setFeedAmount] = useState(100)
  const [feedCount, setFeedCount] = useState(2) // 사료 급여 횟수
  const [waterAmount, setWaterAmount] = useState(200)
  const [waterCount, setWaterCount] = useState(3) // 물 급여 횟수
  const [weight, setWeight] = useState(5.2) // 체중(kg)
  const [memo, setMemo] = useState("")
  const [healthData, setHealthData] = useState<any>({
    walkDistance: 0,
    walkTime: 0,
    walkCount: 0,
    feedCount: 0,
    feedAmount: 0,
    waterAmount: 0,
    waterCount: 0,
    healthStatus: "양호",
    activities: [],
    weight: 5.2, // 기본 체중
    initialWeight: 5.0, // 초기 체중
  })
  const [isLoading, setIsLoading] = useState(true)

  // 기존 데이터 불러오기
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        const savedHealthData = getData("healthData")
        if (savedHealthData) {
          setHealthData(savedHealthData)
          if (savedHealthData.walkCount) setWalkCount(savedHealthData.walkCount)
          if (savedHealthData.walkTime) setWalkTime(savedHealthData.walkTime)
          if (savedHealthData.feedCount) setFeedCount(savedHealthData.feedCount)
          if (savedHealthData.waterCount) setWaterCount(savedHealthData.waterCount)
          if (savedHealthData.weight) setWeight(savedHealthData.weight)
        }
      } catch (error) {
        console.error("데이터 로딩 중 오류 발생:", error)
        toast({
          title: "데이터 로딩 오류",
          description: "정보를 불러오는 중 문제가 발생했습니다.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [toast])

  // 산책 거리 조절
  const increaseWalk = () => setWalkDistance((prev) => Math.min(10, +(prev + 0.5).toFixed(1)))
  const decreaseWalk = () => setWalkDistance((prev) => Math.max(0, +(prev - 0.5).toFixed(1)))

  // 산책 시간 조절
  const increaseWalkTime = () => setWalkTime((prev) => Math.min(180, prev + 5))
  const decreaseWalkTime = () => setWalkTime((prev) => Math.max(5, prev - 5))

  // 산책 횟수 조절
  const increaseWalkCount = () => setWalkCount((prev) => Math.min(5, prev + 1))
  const decreaseWalkCount = () => setWalkCount((prev) => Math.max(1, prev - 1))

  // 사료량 조절
  const increaseFeed = () => setFeedAmount((prev) => Math.min(500, prev + 50))
  const decreaseFeed = () => setFeedAmount((prev) => Math.max(0, prev - 50))

  // 사료 횟수 조절
  const increaseFeedCount = () => setFeedCount((prev) => Math.min(5, prev + 1))
  const decreaseFeedCount = () => setFeedCount((prev) => Math.max(1, prev - 1))

  // 물 섭취량 조절
  const increaseWater = () => setWaterAmount((prev) => Math.min(1000, prev + 50))
  const decreaseWater = () => setWaterAmount((prev) => Math.max(0, prev - 50))

  // 물 급여 횟수 조절
  const increaseWaterCount = () => setWaterCount((prev) => Math.min(10, prev + 1))
  const decreaseWaterCount = () => setWaterCount((prev) => Math.max(1, prev - 1))

  // 체중 조절
  const increaseWeight = () => setWeight((prev) => Math.min(50, +(prev + 0.1).toFixed(1)))
  const decreaseWeight = () => setWeight((prev) => Math.max(0.5, +(prev - 0.1).toFixed(1)))

  // 산책 기록 저장
  const handleRecordWalk = () => {
    if (walkDistance <= 0) {
      toast({
        title: "산책량을 입력해주세요",
        variant: "destructive",
      })
      return
    }

    try {
      const now = new Date()
      const dateString = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, "0")}.${String(now.getDate()).padStart(2, "0")}`
      const timeString = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`

      const newActivity = {
        type: "walk",
        date: dateString,
        time: timeString,
        description: `${walkDistance}km 산책 (${walkTime}분)`,
      }

      const updatedHealthData = {
        ...healthData,
        walkDistance,
        walkTime,
        walkCount,
        activities: [newActivity, ...(healthData.activities || []).slice(0, 49)], // 최대 50개 활동 유지
      }

      saveData("healthData", updatedHealthData)
      setHealthData(updatedHealthData)

      toast({
        title: "산책 기록이 저장되었습니다",
      })
    } catch (error) {
      console.error("산책 기록 저장 중 오류 발생:", error)
      toast({
        title: "저장 오류",
        description: "산책 기록을 저장하는 중 문제가 발생했습니다.",
        variant: "destructive",
      })
    }
  }

  // 사료 급여 기록 저장
  const handleRecordFeed = () => {
    if (!feedBrand || !feedTime || feedAmount <= 0) {
      toast({
        title: "사료 정보를 모두 입력해주세요",
        variant: "destructive",
      })
      return
    }

    try {
      const now = new Date()
      const dateString = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, "0")}.${String(now.getDate()).padStart(2, "0")}`

      const newActivity = {
        type: "feed",
        date: dateString,
        time: feedTime,
        description: `${feedBrand} ${feedAmount}g`,
      }

      const updatedHealthData = {
        ...healthData,
        feedCount,
        feedAmount,
        activities: [newActivity, ...(healthData.activities || []).slice(0, 49)], // 최대 50개 활동 유지
      }

      saveData("healthData", updatedHealthData)
      setHealthData(updatedHealthData)
      setFeedTime("")
      setFeedBrand("")
      setFeedAmount(100)

      toast({
        title: "사료 급여 기록이 저장되었습니다",
      })
    } catch (error) {
      console.error("사료 급여 기록 저장 중 오류 발생:", error)
      toast({
        title: "저장 오류",
        description: "사료 급여 기록을 저장하는 중 문제가 발생했습니다.",
        variant: "destructive",
      })
    }
  }

  // 물 섭취 기록 저장
  const handleRecordWater = () => {
    if (waterAmount <= 0) {
      toast({
        title: "물 섭취량을 입력해주세요",
        variant: "destructive",
      })
      return
    }

    try {
      const now = new Date()
      const dateString = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, "0")}.${String(now.getDate()).padStart(2, "0")}`
      const timeString = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`

      const newActivity = {
        type: "water",
        date: dateString,
        time: timeString,
        description: `${waterAmount}ml 물 섭취`,
      }

      const updatedHealthData = {
        ...healthData,
        waterAmount: (healthData.waterAmount || 0) + waterAmount,
        waterCount,
        activities: [newActivity, ...(healthData.activities || []).slice(0, 49)], // 최대 50개 활동 유지
      }

      saveData("healthData", updatedHealthData)
      setHealthData(updatedHealthData)

      toast({
        title: "물 섭취 기록이 저장되었습니다",
      })
    } catch (error) {
      console.error("물 섭취 기록 저장 중 오류 발생:", error)
      toast({
