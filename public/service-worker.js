// 서비스 워커 버전
const CACHE_VERSION = "v1"
const CACHE_NAME = `meongmeong-care-${CACHE_VERSION}`

// 캐시할 파일 목록
const urlsToCache = ["/", "/dashboard", "/logo.png", "/logo.svg", "/mbti.png", "/placeholder.svg", "/globals.css"]

// 서비스 워커 설치 시 캐시 생성
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache")
      return cache.addAll(urlsToCache)
    }),
  )
})

// 서비스 워커 활성화 시 이전 캐시 삭제
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("Deleting old cache:", cacheName)
            return caches.delete(cacheName)
          }
        }),
      )
    }),
  )
})

// 네트워크 요청 가로채기
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches
      .match(event.request)
      .then((response) => {
        // 캐시에 있으면 캐시에서 반환
        if (response) {
          return response
        }

        // 캐시에 없으면 네트워크 요청
        return fetch(event.request).then((response) => {
          // 유효한 응답이 아니면 그냥 반환
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response
          }

          // 응답을 복제하여 캐시에 저장
          const responseToCache = response.clone()

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache)
          })

          return response
        })
      })
      .catch(() => {
        // 오프라인이고 HTML 페이지 요청인 경우 오프라인 페이지 제공
        if (event.request.headers.get("accept").includes("text/html")) {
          return caches.match("/")
        }
      }),
  )
})

// 푸시 알림 수신
self.addEventListener("push", (event) => {
  if (!event.data) return

  try {
    const data = event.data.json()

    const options = {
      body: data.body || "알림이 도착했습니다.",
      icon: "/logo.png",
      badge: "/logo.png",
      data: {
        url: data.url || "/",
      },
    }

    event.waitUntil(self.registration.showNotification(data.title || "멍멍케어", options))
  } catch (error) {
    console.error("Push notification error:", error)
  }
})

// 알림 클릭 처리
self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  const url = event.notification.data?.url || "/"

  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      // 이미 열린 창이 있으면 포커스
      for (const client of clientList) {
        if (client.url === url && "focus" in client) {
          return client.focus()
        }
      }

      // 열린 창이 없으면 새 창 열기
      if (clients.openWindow) {
        return clients.openWindow(url)
      }
    }),
  )
})
