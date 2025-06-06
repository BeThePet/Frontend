"use client"

import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Bell, BellOff, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import { requestNotificationPermission, getScheduledNotifications, cancelNotification } from "@/lib/notification"

export default function NotificationManager() {
  const { toast } = useToast()
  const [isSupported, setIsSupported] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>("default")
  const [showPermissionCard, setShowPermissionCard] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const [showNotifications, setShowNotifications] = useState(false)

  // 알림 목록 업데이트 함수
  const updateNotifications = () => {
    const scheduledNotifications = getScheduledNotifications()
    const today = new Date()
    const todayString = today.toDateString()
    
    // 오늘 날짜의 활성화된 알림만 필터링
    const activeNotifications = scheduledNotifications.filter((n) => {
      if (!n.isActive || n.triggered) return false
      
      // 약 관련 알림인지 확인
      if (n.id.startsWith('medication-')) {
        const notificationDate = new Date(n.scheduledTime).toDateString()
        return notificationDate === todayString
      }
      
      // 다른 종류의 알림은 그대로 표시
      return true
    })
    
    setNotifications(activeNotifications)
  }

  useEffect(() => {
    // 클라이언트 사이드에서만 실행
    if (typeof window !== "undefined" && "Notification" in window) {
      setIsSupported(true)
      setPermission(Notification.permission)
      
      // 권한이 아직 요청되지 않았으면 카드 표시
      if (Notification.permission === "default") {
        setShowPermissionCard(true)
      }

      // 예약된 알림 목록 로드
      updateNotifications()

      // 1초마다 알림 목록 업데이트
      const interval = setInterval(updateNotifications, 1000)
      
      return () => clearInterval(interval)
    }
  }, [])

  // 알림 권한 요청 처리
  const handleRequestPermission = async () => {
    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      setShowPermissionCard(false)
      
      if (result === "granted") {
        toast({
          title: "알림 설정 완료",
          description: "이제 중요한 알림을 받아볼 수 있습니다.",
        })
      } else if (result === "denied") {
        toast({
          title: "알림이 차단되었습니다",
          description: "브라우저 설정에서 알림을 허용해주세요.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("알림 권한 요청 중 오류 발생:", error)
    }
  }

  // 알림 취소 처리
  const handleCancelNotification = (id: string) => {
    try {
      cancelNotification(id)
      updateNotifications() // 목록 즉시 업데이트
      toast({
        title: "알림 취소됨",
        description: "예정된 알림이 취소되었습니다.",
      })
    } catch (error) {
      console.error("알림 취소 중 오류 발생:", error)
      toast({
        title: "알림 취소 실패",
        description: "알림 취소 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    }
  }

  // 알림 목록 토글
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications)
    if (!showNotifications) {
      updateNotifications() // 패널 열 때 최신 목록으로 업데이트
    }
  }

  // 브라우저 지원 여부 확인
  if (!isSupported) {
    return null
  }

  return (
    <>
      {/* 알림 권한 요청 카드 */}
      <AnimatePresence>
        {showPermissionCard && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed bottom-20 left-0 right-0 px-4 z-40 max-w-md mx-auto"
          >
            <Card className="bg-white shadow-lg border-pink-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-pink-100 p-2 rounded-full">
                      <Bell className="h-5 w-5 text-pink-500" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">알림 기능 활성화</h3>
                      <p className="text-xs text-gray-500">약 복용, 건강 체크 등의 알림을 받아보세요</p>
                    </div>
                  </div>
                  <Button size="sm" className="bg-pink-500" onClick={handleRequestPermission}>
                    허용
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 알림 관리 버튼 */}
      {permission === "granted" && (
        <div className="fixed bottom-20 right-4 z-40">
          <Button
            size="icon"
            className={`rounded-full shadow-lg ${showNotifications ? "bg-gray-700" : "bg-pink-500"}`}
            onClick={toggleNotifications}
          >
            {notifications.length > 0 && !showNotifications && (
              <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs min-w-[20px] h-5 flex items-center justify-center">
                {notifications.length}
              </Badge>
            )}
            {showNotifications ? <X className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
          </Button>
        </div>
      )}

      {/* 알림 목록 패널 */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-32 right-4 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-40"
          >
            <div className="p-3 border-b border-gray-100">
              <h3 className="font-medium text-gray-800">예정된 알림</h3>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div key={notification.id} className="p-3 border-b border-gray-100 last:border-0">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 pr-2">
                        <h4 className="font-medium text-sm">{notification.title || '알림'}</h4>
                        <p className="text-xs text-gray-500">{notification.body || ''}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {notification.scheduledTime ? new Date(notification.scheduledTime).toLocaleString() : ''}
                        </p>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 flex-shrink-0"
                        onClick={() => handleCancelNotification(notification.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500 text-sm">
                  <BellOff className="h-5 w-5 mx-auto mb-2 text-gray-400" />
                  예정된 알림이 없습니다
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
