/**
 * PWA 관련 유틸리티 함수
 *
 * 프로그레시브 웹 앱 기능을 지원하기 위한 유틸리티 함수들입니다.
 */

// 앱 설치 가능 여부 확인
export function isPwaInstallable(): boolean {
  if (typeof window === "undefined") return false

  // deferredPrompt 이벤트가 있는지 확인 (전역 변수로 저장된 beforeinstallprompt 이벤트)
  return Boolean((window as any).deferredPrompt)
}

// 앱이 이미 설치되었는지 확인
export function isPwaInstalled(): boolean {
  if (typeof window === "undefined") return false

  // display-mode: standalone 또는 fullscreen이면 설치된 것으로 간주
  return window.matchMedia("(display-mode: standalone), (display-mode: fullscreen)").matches
}

// 앱이 오프라인인지 확인
export function isOffline(): boolean {
  if (typeof window === "undefined") return false

  return !navigator.onLine
}

// 로컬 스토리지 기반 오프라인 데이터 캐싱
export function cacheAppData(key: string, data: any): void {
  try {
    localStorage.setItem(`app_cache_${key}`, JSON.stringify(data))
  } catch (error) {
    console.error("Failed to cache app data:", error)
  }
}

// 캐시된 앱 데이터 가져오기
export function getCachedAppData(key: string): any {
  try {
    const data = localStorage.getItem(`app_cache_${key}`)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error("Failed to get cached app data:", error)
    return null
  }
}

// 앱 설치 프롬프트 표시
export function showInstallPrompt(): Promise<boolean> {
  return new Promise((resolve) => {
    const deferredPrompt = (window as any).deferredPrompt

    if (!deferredPrompt) {
      resolve(false)
      return
    }

    // 설치 프롬프트 표시
    deferredPrompt.prompt()

    // 사용자 응답 대기
    deferredPrompt.userChoice.then((choiceResult: { outcome: string }) => {
      if (choiceResult.outcome === "accepted") {
        console.log("사용자가 앱 설치를 수락했습니다")
        resolve(true)
      } else {
        console.log("사용자가 앱 설치를 거부했습니다")
        resolve(false)
      }
      // deferredPrompt 초기화
      ;(window as any).deferredPrompt = null
    })
  })
}

// 오프라인 상태 변경 이벤트 리스너 등록
export function registerOfflineListener(callback: (isOffline: boolean) => void): () => void {
  if (typeof window === "undefined") return () => {}

  const handleOnline = () => callback(false)
  const handleOffline = () => callback(true)

  window.addEventListener("online", handleOnline)
  window.addEventListener("offline", handleOffline)

  // 초기 상태 전달
  callback(!navigator.onLine)

  // 클린업 함수 반환
  return () => {
    window.removeEventListener("online", handleOnline)
    window.removeEventListener("offline", handleOffline)
  }
}

// 서비스 워커 등록 함수
export function registerServiceWorker(): void {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/service-worker.js")
        .then((registration) => {
          console.log("ServiceWorker registration successful with scope: ", registration.scope)
        })
        .catch((err) => {
          console.log("ServiceWorker registration failed: ", err)
        })
    })
  }
}
