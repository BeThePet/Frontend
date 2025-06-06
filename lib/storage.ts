/**
 * 로컬 스토리지 유틸리티 함수
 *
 * 백엔드 연결 시 이 파일의 함수들을 API 호출로 대체해야 합니다.
 * 각 함수는 해당하는 API 엔드포인트로 변경되어야 합니다.
 */

// 순환 참조를 제거하는 함수
function removeCircularReferences(obj: any): any {
  const seen = new WeakSet()

  return JSON.stringify(obj, (key, value) => {
    // React 요소나 함수는 null로 대체
    if (key === "icon" || typeof value === "function") {
      return null
    }

    // 객체가 아니거나 null이면 그대로 반환
    if (typeof value !== "object" || value === null) {
      return value
    }

    // 이미 처리한 객체는 null로 대체 (순환 참조 방지)
    if (seen.has(value)) {
      return null
    }

    seen.add(value)
    return value
  })
}

/**
 * 데이터 저장 함수
 *
 * 백엔드 연결 시 다음과 같은 API 호출로 대체:
 * - POST /api/pets/:petId/data/:dataType
 *
 * @param key 저장할 데이터의 키
 * @param data 저장할 데이터
 */
export function saveData(key: string, data: any): boolean {
  if (typeof window !== "undefined") {
    try {
      const serializedData = removeCircularReferences(data)
      localStorage.setItem(key, serializedData)
      return true
    } catch (error) {
      console.error("Error saving data to localStorage:", error)
      return false
    }
  }
  return false
}

// 개발용 목데이터
export const MOCK_PET_INFO = {
  id: "pet-001",
  name: "멍멍이",
  breed: "말티즈",
  birthDate: "2020-01-01",
  gender: "female",
  weight: 3.5,
  imageUrl: "/images/pet-placeholder.png"
}

/**
 * 로컬 스토리지에서 데이터를 가져옵니다.
 * @param key 저장된 데이터의 키
 * @returns 저장된 데이터 또는 null
 */
export function getData<T>(key: string): T | null {
  try {
    // 개발 환경에서 petInfo 요청 시 목데이터 반환
    if (key === "petInfo") {
      return MOCK_PET_INFO as T
    }
    
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : null
  } catch (error) {
    console.error("로컬 스토리지에서 데이터를 가져오는데 실패했습니다:", error)
    return null
  }
}

/**
 * 로컬 스토리지에서 데이터를 삭제합니다.
 * @param key 삭제할 데이터의 키
 */
export function removeData(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error("로컬 스토리지에서 데이터를 삭제하는데 실패했습니다:", error)
  }
}

/**
 * 로컬 스토리지의 모든 데이터를 삭제합니다.
 */
export function clearAllData(): void {
  try {
    localStorage.clear()
  } catch (error) {
    console.error("로컬 스토리지를 초기화하는데 실패했습니다:", error)
  }
}

/**
 * 데이터 저장 함수 (saveData의 별칭)
 *
 * @param key 저장할 데이터의 키
 * @param data 저장할 데이터
 */
export function setData(key: string, data: any): boolean {
  return saveData(key, data)
}

/**
 * 데이터 존재 여부 확인 함수
 *
 * @param key 확인할 데이터의 키
 * @returns 데이터 존재 여부
 */
export function hasData(key: string): boolean {
  if (typeof window !== "undefined") {
    return localStorage.getItem(key) !== null
  }
  return false
}

/**
 * 로컬 스토리지 용량 확인 함수
 *
 * @returns 현재 사용 중인 로컬 스토리지 용량 (바이트)
 */
export function getStorageUsage(): number {
  if (typeof window !== "undefined") {
    let total = 0
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key) {
        const value = localStorage.getItem(key) || ""
        total += key.length + value.length
      }
    }
    return total * 2 // UTF-16 인코딩은 문자당 2바이트
  }
  return 0
}

/**
 * 로컬 스토리지 남은 용량 확인 함수
 *
 * @returns 남은 로컬 스토리지 용량 (바이트)
 */
export function getRemainingStorage(): number {
  // 대부분의 브라우저는 5MB 제한
  const estimatedLimit = 5 * 1024 * 1024
  const usage = getStorageUsage()
  return Math.max(0, estimatedLimit - usage)
}

/**
 * 데이터 백업 함수
 *
 * @returns 모든 데이터를 포함한 JSON 문자열
 */
export function exportAllData(): string {
  if (typeof window !== "undefined") {
    const data: Record<string, any> = {}
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key) {
        try {
          const value = localStorage.getItem(key)
          if (value) {
            data[key] = JSON.parse(value)
          }
        } catch (error) {
          console.error(`Error parsing data for key ${key}:`, error)
        }
      }
    }
    return JSON.stringify(data)
  }
  return "{}"
}

/**
 * 데이터 복원 함수
 *
 * @param jsonData 백업된 JSON 데이터
 * @returns 복원 성공 여부
 */
export function importAllData(jsonData: string): boolean {
  if (typeof window !== "undefined") {
    try {
      const data = JSON.parse(jsonData)
      Object.keys(data).forEach((key) => {
        saveData(key, data[key])
      })
      return true
    } catch (error) {
      console.error("Error importing data:", error)
      return false
    }
  }
  return false
}
