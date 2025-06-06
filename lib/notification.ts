/**
 * 알림 관련 유틸리티 함수
 *
 * 브라우저의 Notification API를 사용하여 로컬 알림을 구현합니다.
 * 백엔드 연결 시 푸시 알림으로 대체할 수 있습니다.
 */

// 알림 권한 요청
export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) {
    console.log("이 브라우저는 알림을 지원하지 않습니다.")
    return false
  }

  if (Notification.permission === "granted") {
    return true
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission()
    return permission === "granted"
  }

  return false
}

// 즉시 알림 표시
export function showNotification(title: string, options?: NotificationOptions): void {
  if (!("Notification" in window)) {
    console.log("이 브라우저는 알림을 지원하지 않습니다.")
    return
  }

  if (Notification.permission === "granted") {
    try {
      const notification = new Notification(title, {
        icon: "/logo.png",
        badge: "/logo.png",
        ...options,
      })

      // 알림 클릭 이벤트
      notification.onclick = () => {
        window.focus()
        notification.close()
      }
    } catch (error) {
      console.error("알림 표시 중 오류가 발생했습니다:", error)
    }
  }
}

// 예약 알림 설정 (로컬 스토리지 + setTimeout)
export function scheduleNotification(id: string, title: string, body: string, scheduledTime: Date, url?: string): void {
  const now = new Date()
  const delay = scheduledTime.getTime() - now.getTime()

  if (delay <= 0) {
    console.log("과거 시간에는 알림을 예약할 수 없습니다.")
    return
  }

  // 기존 동일한 ID의 알림이 있으면 먼저 취소
  cancelNotification(id)

  // 알림 데이터 저장
  const notifications = getScheduledNotifications()
  // 중복 제거를 위해 같은 ID가 있으면 제거
  const filteredNotifications = notifications.filter(n => n.id !== id)
  
  filteredNotifications.push({
    id,
    title,
    body,
    scheduledTime: scheduledTime.toISOString(),
    url,
    isActive: true,
  })

  saveScheduledNotifications(filteredNotifications)

  // 현재 세션에서 타이머 설정
  setTimeout(() => {
    showNotification(title, {
      body,
      data: { url },
    })

    // 알림 상태 업데이트
    markNotificationAsTriggered(id)
  }, delay)
}

// 예약된 알림 취소
export function cancelNotification(id: string): void {
  const notifications = getScheduledNotifications()
  const updatedNotifications = notifications.map((notification) =>
    notification.id === id ? { ...notification, isActive: false } : notification,
  )

  saveScheduledNotifications(updatedNotifications)
}

// 모든 예약된 알림 초기화 (앱 시작 시 호출)
export function initializeNotifications(): void {
  const notifications = getScheduledNotifications()
  const now = new Date()

  notifications.forEach((notification) => {
    if (!notification.isActive) return

    const scheduledTime = new Date(notification.scheduledTime)
    const delay = scheduledTime.getTime() - now.getTime()

    if (delay <= 0) {
      // 이미 지난 알림은 트리거된 것으로 표시
      markNotificationAsTriggered(notification.id)
    } else {
      // 아직 오지 않은 알림은 다시 스케줄링
      setTimeout(() => {
        showNotification(notification.title, {
          body: notification.body,
          data: { url: notification.url },
        })

        markNotificationAsTriggered(notification.id)
      }, delay)
    }
  })
}

// 알림이 트리거되었음을 표시
function markNotificationAsTriggered(id: string): void {
  const notifications = getScheduledNotifications()
  const updatedNotifications = notifications.map((notification) =>
    notification.id === id ? { ...notification, isActive: false, triggered: true } : notification,
  )

  saveScheduledNotifications(updatedNotifications)
}

// 예약된 알림 목록 가져오기
export function getScheduledNotifications(): Array<{
  id: string
  title: string
  body: string
  scheduledTime: string
  url?: string
  isActive: boolean
  triggered?: boolean
}> {
  if (typeof window === "undefined") return []

  try {
    const data = localStorage.getItem("scheduledNotifications")
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error("알림 데이터를 불러오는 중 오류가 발생했습니다:", error)
    return []
  }
}

// 예약된 알림 목록 저장
function saveScheduledNotifications(
  notifications: Array<{
    id: string
    title: string
    body: string
    scheduledTime: string
    url?: string
    isActive: boolean
    triggered?: boolean
  }>,
): void {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem("scheduledNotifications", JSON.stringify(notifications))
  } catch (error) {
    console.error("알림 데이터를 저장하는 중 오류가 발생했습니다:", error)
  }
}
