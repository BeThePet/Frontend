"use client"

import { useEffect } from "react"

export default function InstallPwaScript() {
  useEffect(() => {
    // beforeinstallprompt 이벤트 캡처 및 저장
    window.addEventListener("beforeinstallprompt", (e) => {
      // 기본 동작 방지
      e.preventDefault()
      // 이벤트 저장
      ;(window as any).deferredPrompt = e
      console.log("beforeinstallprompt 이벤트가 발생했습니다")
    })

    // 앱 설치 완료 이벤트
    window.addEventListener("appinstalled", () => {
      // deferredPrompt 초기화
      ;(window as any).deferredPrompt = null
      console.log("앱이 성공적으로 설치되었습니다")
    })

    // 온라인/오프라인 상태 감지
    window.addEventListener("online", () => {
      console.log("온라인 상태로 전환되었습니다")
    })

    window.addEventListener("offline", () => {
      console.log("오프라인 상태로 전환되었습니다")
    })

    return () => {
      window.removeEventListener("beforeinstallprompt", () => {})
      window.removeEventListener("appinstalled", () => {})
      window.removeEventListener("online", () => {})
      window.removeEventListener("offline", () => {})
    }
  }, [])

  return null
}
