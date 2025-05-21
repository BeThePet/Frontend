"use client"

import { useEffect, useState } from "react"
import { Wifi, WifiOff } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { registerOfflineListener } from "@/lib/pwa"

export default function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(false)
  const [showAlert, setShowAlert] = useState(false)

  useEffect(() => {
    // 오프라인 상태 변경 리스너 등록
    const unregister = registerOfflineListener((offline) => {
      setIsOffline(offline)
      if (offline) {
        setShowAlert(true)
        // 5초 후 알림 자동 닫기
        setTimeout(() => setShowAlert(false), 5000)
      }
    })

    return unregister
  }, [])

  if (!showAlert) return null

  return (
    <div className="fixed bottom-20 left-0 right-0 z-50 px-4 transition-all duration-300 ease-in-out">
      <Alert
        variant={isOffline ? "destructive" : "default"}
        className="animate-in fade-in slide-in-from-bottom-5 duration-300"
      >
        {isOffline ? <WifiOff className="h-4 w-4" /> : <Wifi className="h-4 w-4" />}
        <AlertTitle>{isOffline ? "오프라인 모드" : "온라인 모드"}</AlertTitle>
        <AlertDescription>
          {isOffline
            ? "인터넷 연결이 끊겼습니다. 일부 기능이 제한될 수 있습니다."
            : "인터넷 연결이 복구되었습니다. 모든 기능을 사용할 수 있습니다."}
        </AlertDescription>
      </Alert>
    </div>
  )
}
