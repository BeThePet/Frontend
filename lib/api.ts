// Emergency API functions

// Emergency Guides Mock data - updated according to API specification
const mockEmergencyGuides = [
  {
    "id": "poisoning",
    "title": "중독 응급처치",
    "severity": "high",
    "symptoms": [
      "구토",
      "설사", 
      "경련",
      "의식잃음"
    ],
    "first_aid": [
      "즉시 동물병원 연락",
      "중독 물질 확인 및 제거",
      "구토 유도 금지",
      "물 급여 금지"
    ],
    "notes": "중독 의심 시 절대 구토를 유도하지 마세요. 즉시 응급실로 이송하세요."
  },
  {
    "id": "fracture",
    "title": "골절 응급처치",
    "severity": "medium",
    "symptoms": [
      "다리 절음",
      "통증 반응",
      "부종",
      "변형"
    ],
    "first_aid": [
      "움직임 최소화",
      "부목 고정",
      "즉시 병원 이송",
      "진통제 임의 투여 금지"
    ],
    "notes": "골절 부위를 건드리지 말고 안정된 상태로 병원에 이송하세요."
  },
  {
    "id": "heatstroke",
    "title": "열사병 응급처치",
    "severity": "high",
    "symptoms": [
      "과도한 헥헥거림",
      "짙은 붉은색 잇몸",
      "구토",
      "설사",
      "의식 저하",
      "비틀거림"
    ],
    "first_aid": [
      "시원한 장소로 이동",
      "미지근한 물로 몸 적시기",
      "선풍기로 바람 쐬기",
      "물을 조금씩 마시게 하기",
      "체온 정상화 후 반드시 병원 방문"
    ],
    "notes": "여름철 차 안에 반려견을 절대 두지 마세요. 온도는 빠르게 상승합니다."
  },
  {
    "id": "bleeding",
    "title": "출혈 응급처치",
    "severity": "medium",
    "symptoms": [
      "지속적인 출혈",
      "혈액이 묻은 털",
      "창백한 잇몸",
      "약한 맥박",
      "무기력"
    ],
    "first_aid": [
      "깨끗한 천으로 상처 압박",
      "심한 출혈 시 지혈대 사용",
      "체온 유지하며 움직임 최소화",
      "즉시 병원으로 이동"
    ],
    "notes": "출혈량이 많으면 쇼크 상태가 될 수 있으니 주의하세요."
  },
  {
    "id": "choking",
    "title": "질식 응급처치",
    "severity": "high",
    "symptoms": [
      "호흡 곤란",
      "과도한 기침",
      "입술이나 잇몸이 파랗게 변함",
      "공황 상태"
    ],
    "first_aid": [
      "입을 열고 이물질 제거 시도",
      "하임리히 방법 실시",
      "이물질 제거 안되면 즉시 병원",
      "기도 확보 우선"
    ],
    "notes": "질식은 생명을 위협하는 응급 상황입니다. 신속하게 대처하세요."
  },
  {
    "id": "seizure",
    "title": "발작 응급처치",
    "severity": "high",
    "symptoms": [
      "몸의 경직",
      "의식 상실",
      "다리를 젓는 움직임",
      "침 흘림",
      "배변/배뇨 실수"
    ],
    "first_aid": [
      "주변 위험 물건 제거",
      "반려견 만지지 않기",
      "발작 시간 기록",
      "1분 이상 지속 시 즉시 병원"
    ],
    "notes": "발작 전후 행동을 기록해두면 진단에 도움이 됩니다."
  }
]

// Mock hospital data - using Korean values as backend accepts Korean
const mockAllHospitals = [
  {
    "id": 1,
    "name": "24시 응급동물병원",
    "phone": "02-1234-5678",
    "address": "서울시 강남구 테헤란로 123",
    "type": "응급 병원",
    "is_emergency": true,
    "hours": "24시간 운영",
    "notes": "응급환자 우선 진료",
    "specialties": ["외과", "내과"]
  },
  {
    "id": 2,
    "name": "우리동물병원",
    "phone": "02-9876-5432",
    "address": "서울시 서초구 강남대로 456",
    "type": "일반 병원",
    "is_emergency": false,
    "hours": "09:00-21:00",
    "notes": "일반 진료",
    "specialties": ["일반 진료"]
  },
  {
    "id": 3,
    "name": "동물심장전문병원",
    "phone": "02-5555-6666",
    "address": "서울시 마포구 홍대로 789",
    "type": "전문 병원",
    "is_emergency": false,
    "hours": "09:00-18:00",
    "notes": "심장병 전문",
    "specialties": ["심장내과"]
  },
  {
    "id": 4,
    "name": "응급케어동물병원",
    "phone": "02-7777-8888",
    "address": "서울시 마포구 월드컵로 111",
    "type": "응급 병원",
    "is_emergency": true,
    "hours": "24시간 운영",
    "notes": "365일 24시간 응급진료",
    "specialties": ["외과", "응급 처치"]
  },
  {
    "id": 5,
    "name": "펫플러스동물병원",
    "phone": "02-3333-4444",
    "address": "서울시 송파구 올림픽로 100",
    "type": "일반 병원",
    "is_emergency": false,
    "hours": "09:00-20:00",
    "notes": "친절한 진료",
    "specialties": ["일반 진료", "치과"]
  }
]

// Types
export interface EmergencyGuide {
  id: string
  title: string
  severity: string
  symptoms: string[]
  first_aid: string[]
  notes: string
}

export interface HospitalSummary {
  id: number
  name: string
  phone: string
}

export interface HospitalDetail {
  id: number
  name: string
  phone: string
  address: string
  type: string
  is_emergency: boolean
  hours: string
  notes: string
  specialties: string[]
}

export interface HospitalCreateRequest {
  name: string
  phone: string
  address: string
  type: string
  is_emergency: boolean
  hours: string
  notes: string
  specialties: string[]
}

// Medication types
export interface MedicationRequest {
  name: string
  time: string
  weekdays: string
  dosage: string
  start_date: string
  end_date?: string | null
  memo?: string
  alarm_enabled: boolean
}

export interface MedicationResponse {
  id: number
  name: string
  time: string
  weekdays: string
  dosage: string
  start_date: string
  end_date?: string | null
  memo?: string
  alarm_enabled: boolean
}

// MBTI Types
export interface MbtiRequest {
  mbti_type: string
}

export interface MbtiResponse {
  mbti_type: string
  created_at: string
}

// 새로운 인증 관련 인터페이스들
export interface UserSignupRequest {
  email: string
  password: string
  nickname: string
}

export interface UserLoginRequest {
  email: string
  password: string
}

export interface UserResponse {
  id: number
  email: string
  nickname: string
  created_at: string
}

export interface TokenRefreshResponse {
  access_token: string
}

export interface LogoutResponse {
  msg: string
}

// 새로운 반려견 등록 관련 타입들 추가
export interface BreedOption {
  id: number
  name: string
}

export interface AllergyCategory {
  category: string
  items: {
    id: number
    name: string
  }[]
}

export interface DiseaseCategory {
  category: string
  items: {
    id: number
    name: string
  }[]
}

export interface DogRegistrationRequest {
  name: string
  birth_date: string
  age_group: "주니어" | "성견" | "시니어"
  weight: number
  breed_id: number | null
  gender: "남아" | "여아" | "중성화"
  medication?: string | null
  allergy_ids?: number[]
  disease_ids?: number[]
}

export interface DogRegistrationResponse {
  id: number
  name: string
  birth_date: string
  age_group: "주니어" | "성견" | "시니어"
  weight: number
  gender: "남아" | "여아" | "중성화"
  medication?: string | null
  breed_name: string
  allergy_names: string[]
  disease_names: string[]
}

// Mock medication data for development
const generateTestTime = () => {
  const now = new Date()
  now.setMinutes(now.getMinutes() + 1) // 현재 시간 + 1분
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:00`
}

const mockMedications: MedicationResponse[] = [
  {
    id: 1,
    name: "심장약",
    time: "08:00:00",
    weekdays: "월, 화, 수, 목, 금",
    dosage: "1정",
    start_date: "2024-01-01",
    end_date: "2024-12-31",
    memo: "아침 식사 후 복용",
    alarm_enabled: true
  },
  {
    id: 2,
    name: "관절영양제",
    time: "18:00:00",
    weekdays: "월",
    dosage: "2정",
    start_date: "2024-01-15",
    memo: "저녁 식사와 함께",
    alarm_enabled: true
  },
  {
    id: 3,
    name: "소화제",
    time: "12:00:00",
    weekdays: "월, 수, 금",
    dosage: "0.5정",
    start_date: "2024-02-01",
    end_date: "2024-03-01",
    memo: "점심 식사 전 30분",
    alarm_enabled: false
  },
  {
    id: 4,
    name: "테스트 알림약",
    time: generateTestTime(),
    weekdays: "월, 화, 수, 목, 금, 토, 일",
    dosage: "1정",
    start_date: new Date().toISOString().split('T')[0],
    memo: "알림 테스트용 (1분 후 알림)",
    alarm_enabled: true
  }
]

// Emergency API functions with backend connection
export const emergencyApi = {
  // Get emergency guides list
  getGuides: async (): Promise<EmergencyGuide[]> => {
    if (USE_MOCK_DATA) {
      // Mock 데이터 반환 (개발용)
      await new Promise(resolve => setTimeout(resolve, 500))
      return mockEmergencyGuides
    }

    // 실제 백엔드 연결 코드
    const response = await apiCallWithRetry('/emergency/guides', {
      method: 'GET',
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch emergency guides')
    }
    
    return response.json()
  },

  // Get emergency guide detail by ID
  getGuideDetail: async (guideId: string): Promise<EmergencyGuide | null> => {
    if (USE_MOCK_DATA) {
      // Mock 데이터 반환 (개발용)
      await new Promise(resolve => setTimeout(resolve, 300))
      const guide = mockEmergencyGuides.find(g => g.id === guideId)
      return guide || null
    }

    // 실제 백엔드 연결 코드
    const response = await apiCallWithRetry(`/emergency/guides/${guideId}`, {
      method: 'GET',
    })
    
    if (!response.ok) {
      if (response.status === 404) {
        return null // 가이드를 찾을 수 없음
      }
      throw new Error('Failed to fetch emergency guide detail')
    }
    
    return response.json()
  },

  // Get emergency hospitals summary (only is_emergency: true)
  getEmergencyHospitalsSummary: async (): Promise<HospitalSummary[]> => {
    if (USE_MOCK_DATA) {
      // Mock 데이터 반환 (개발용)
      await new Promise(resolve => setTimeout(resolve, 400))
      const emergencyHospitals = mockAllHospitals.filter(h => h.is_emergency === true)
      return emergencyHospitals.map(h => ({
        id: h.id,
        name: h.name,
        phone: h.phone
      }))
    }

    // 실제 백엔드 연결 코드
    const response = await apiCallWithRetry(`/emergency/hospitals/summary`, {
      method: 'GET',
      
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch emergency hospitals summary')
    }
    
    return response.json()
  },

  // Get all hospitals
  getAllHospitals: async (): Promise<HospitalDetail[]> => {
    if (USE_MOCK_DATA) {
      // Mock 데이터 반환 (개발용)
      await new Promise(resolve => setTimeout(resolve, 400))
      return [...mockAllHospitals]
    }

    // 실제 백엔드 연결 코드
    const response = await apiCallWithRetry('/emergency/hospitals/all', {
      method: 'GET',
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch all hospitals')
    }
    
    return response.json()
  },

    // Get regular hospitals
  getRegularHospitals: async (): Promise<HospitalDetail[]> => {
    if (USE_MOCK_DATA) {
      // Mock 데이터 반환 (개발용)
      await new Promise(resolve => setTimeout(resolve, 400))
      return mockAllHospitals.filter(h => h.type === "일반 병원")
    }

    // 실제 백엔드 연결 코드
    const response = await apiCallWithRetry('/emergency/hospitals/regular', {
      method: 'GET',
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch regular hospitals')
    }
    
    return response.json()
  },

  // Get emergency hospitals  
  getEmergencyHospitals: async (): Promise<HospitalDetail[]> => {
    if (USE_MOCK_DATA) {
      // Mock 데이터 반환 (개발용)
      await new Promise(resolve => setTimeout(resolve, 400))
      return mockAllHospitals.filter(h => h.type === "응급 병원")
    }

    // 실제 백엔드 연결 코드
    const response = await apiCallWithRetry('/emergency/hospitals/emergency', {
      method: 'GET',
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch emergency hospitals')
    }
    
    return response.json()
  },

  // Get specialist hospitals
  getSpecialistHospitals: async (): Promise<HospitalDetail[]> => {
    if (USE_MOCK_DATA) {
      // Mock 데이터 반환 (개발용)
      await new Promise(resolve => setTimeout(resolve, 400))
      return mockAllHospitals.filter(h => h.type === "전문 병원")
    }

    // 실제 백엔드 연결 코드
    const response = await apiCallWithRetry(`/emergency/hospitals/specialist`, {
      method: 'GET',
      
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch specialist hospitals')
    }
    
    return response.json()
  },

  // Get hospital detail by ID (not in API spec but useful for editing)
  getHospitalDetail: async (hospitalId: number): Promise<HospitalDetail | null> => {
    if (USE_MOCK_DATA) {
      // Mock 데이터 반환 (개발용)
      await new Promise(resolve => setTimeout(resolve, 300))
      const hospital = mockAllHospitals.find(h => h.id === hospitalId)
      return hospital || null
    }

    // 전체 병원 목록에서 ID로 찾기 (백엔드에 별도 엔드포인트가 없으므로)
    const hospitals = await emergencyApi.getAllHospitals()
    const hospital = hospitals.find(h => h.id === hospitalId)
    return hospital || null
  },

  // Create hospital
  createHospital: async (hospitalData: HospitalCreateRequest): Promise<HospitalDetail> => {
    if (USE_MOCK_DATA) {
      // Mock 데이터 처리 (개발용)
      await new Promise(resolve => setTimeout(resolve, 500))
      const newHospital: HospitalDetail = {
        ...hospitalData,
        id: Date.now() // Mock ID generation
      }
      mockAllHospitals.push(newHospital)
      return newHospital
    }

    // 실제 백엔드 연결 코드
    const response = await apiCallWithRetry(`/emergency/hospitals`, {
      method: 'POST',
      
      body: JSON.stringify(hospitalData),
    })
    
    if (!response.ok) {
      throw new Error('Failed to create hospital')
    }
    
    return response.json()
  },

  // Update hospital
  updateHospital: async (hospitalId: number, hospitalData: HospitalCreateRequest): Promise<HospitalDetail> => {
    if (USE_MOCK_DATA) {
      // Mock 데이터 처리 (개발용)
      await new Promise(resolve => setTimeout(resolve, 500))
      const index = mockAllHospitals.findIndex(h => h.id === hospitalId)
      if (index === -1) {
        throw new Error('Hospital not found')
      }
      
      const updatedHospital: HospitalDetail = {
        ...hospitalData,
        id: hospitalId
      }
      
      mockAllHospitals[index] = updatedHospital
      return updatedHospital
    }

    // 실제 백엔드 연결 코드
    const response = await apiCallWithRetry(`/emergency/hospitals/${hospitalId}`, {
      method: 'PUT',
      
      body: JSON.stringify(hospitalData),
    })
    
    if (!response.ok) {
      throw new Error('Failed to update hospital')
    }
    
    return response.json()
  },

  // Delete hospital
  deleteHospital: async (hospitalId: number): Promise<void> => {
    if (USE_MOCK_DATA) {
      // Mock 데이터 처리 (개발용)
      await new Promise(resolve => setTimeout(resolve, 300))
      const index = mockAllHospitals.findIndex(h => h.id === hospitalId)
      if (index !== -1) {
        mockAllHospitals.splice(index, 1)
      }
      return
    }

    // 실제 백엔드 연결 코드
    const response = await apiCallWithRetry(`/emergency/hospitals/${hospitalId}`, {
      method: 'DELETE',
      
    })
    
    if (!response.ok) {
      throw new Error('Failed to delete hospital')
    }
  }
}

// Medication API functions
export const medicationApi = {
  // Get all medications
  getMedications: async (): Promise<MedicationResponse[]> => {
    // 실제 백엔드 연결 코드
    const response = await apiCallWithRetry(`/medication/`, {
      method: 'GET',
      
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch medications')
    }
    
    return response.json()
    
    // Mock 데이터 반환 (개발용)
    // await new Promise(resolve => setTimeout(resolve, 300))
    // return [...mockMedications]
  },

  // Create medication (POST only for creation)
  createMedication: async (medicationData: MedicationRequest): Promise<MedicationResponse> => {
    // 실제 백엔드 연결 코드
    const response = await apiCallWithRetry(`/medication/`, {
      method: 'POST',
      
      body: JSON.stringify(medicationData),
    })
    
    if (!response.ok) {
      throw new Error('Failed to create medication')
    }
    
    return response.json()
    
    // Mock 데이터 처리 (개발용)
    // await new Promise(resolve => setTimeout(resolve, 500))
    // 
    // // 종료일이 없거나 null이면 필드 제거
    // const requestData: any = { ...medicationData }
    // if (!requestData.end_date || requestData.end_date === null) {
    //   delete requestData.end_date
    // }
    // 
    // const newMedication: MedicationResponse = {
    //   ...requestData,
    //   id: Date.now(), // Mock ID generation
    //   end_date: requestData.end_date || undefined
    // }
    // mockMedications.push(newMedication)
    // return newMedication
  },

  // Update medication (PUT for updates)
  updateMedication: async (medicationId: number, medicationData: MedicationRequest): Promise<MedicationResponse> => {
    // 실제 백엔드 연결 코드
    const response = await apiCallWithRetry(`/medication/${medicationId}`, {
      method: 'PUT',
      
      body: JSON.stringify(medicationData),
    })
    
    if (!response.ok) {
      throw new Error('Failed to update medication')
    }
    
    return response.json()
    
    // Mock 데이터 처리 (개발용)
    // await new Promise(resolve => setTimeout(resolve, 500))
    // const index = mockMedications.findIndex(m => m.id === medicationId)
    // if (index === -1) {
    //   throw new Error('Medication not found')
    // }
    // 
    // // 종료일이 없거나 null이면 필드 제거
    // const requestData: any = { ...medicationData }
    // if (!requestData.end_date || requestData.end_date === null) {
    //   delete requestData.end_date
    // }
    // 
    // const updatedMedication: MedicationResponse = {
    //   ...requestData,
    //   id: medicationId,
    //   end_date: requestData.end_date || undefined
    // }
    // 
    // mockMedications[index] = updatedMedication
    // return updatedMedication
  },

  // Delete medication
  deleteMedication: async (medicationId: number): Promise<void> => {
    // 실제 백엔드 연결 코드
    const response = await apiCallWithRetry(`/medication/${medicationId}`, {
      method: 'DELETE',
      
    })
    
    if (!response.ok) {
      throw new Error('Failed to delete medication')
    }
    
    // Mock (개발용)
    // await new Promise(resolve => setTimeout(resolve, 300))
    // const index = mockMedications.findIndex(m => m.id === medicationId)
    // if (index !== -1) {
    //   mockMedications.splice(index, 1)
    // }
  }
}

// User API functions - 새로운 쿠키 기반 인증 시스템
export const userApi = {
  // 회원가입 (POST /user/signup)
  signup: async (userData: UserSignupRequest): Promise<{ success: boolean; user?: UserResponse; error?: string }> => {
    try {
      const response = await apiCall('/user/signup', {
        method: 'POST',
        body: JSON.stringify(userData),
      })
      
      if (response.ok) {
        const user = await response.json()
        // 회원가입 성공 - 쿠키 자동 설정됨
        return { success: true, user }
      } else {
        const error = await response.json()
        return { success: false, error: error.detail }
      }
    } catch (error) {
      return { success: false, error: '네트워크 오류' }
    }
  },

  // 로그인 (POST /user/login)
  login: async (credentials: UserLoginRequest): Promise<{ success: boolean; user?: UserResponse; error?: string }> => {
    try {
      const response = await apiCall('/user/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      })
      
      if (response.ok) {
        const user = await response.json()
        // 로그인 성공 - 쿠키 자동 설정됨
        return { success: true, user }
      } else {
        const error = await response.json()
        return { success: false, error: error.detail }
      }
    } catch (error) {
      return { success: false, error: '네트워크 오류' }
    }
  },

  // 로그아웃 (POST /user/logout)
  logout: async (): Promise<void> => {
    try {
      const response = await apiCall('/user/logout', { 
        method: 'POST' 
      })
      
      if (response.ok) {
        // 로그아웃 성공 - 쿠키 자동 삭제됨
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
      } else {
        throw new Error('Failed to logout')
      }
    } catch (error) {
      console.error('로그아웃 오류:', error)
      throw error
    }
  },

  // 토큰 갱신 (POST /user/refresh)
  refreshToken: async (): Promise<TokenRefreshResponse | null> => {
    try {
      const response = await apiCall('/user/refresh', {
        method: 'POST',
      })
      
      if (response.ok) {
        return response.json()
      } else {
        return null // 토큰 갱신 실패
      }
    } catch (error) {
      console.error('토큰 갱신 오류:', error)
      return null
    }
  },

  // 내 정보 조회 (GET /user/me)
  getCurrentUser: async (): Promise<UserResponse> => {
    const response = await apiCallWithRetry('/user/me', {
      method: 'GET',
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch user info')
    }
    
    return response.json()
  }
}

// MBTI API functions
export const mbtiApi = {
  // Save MBTI result (POST)
  saveMbtiResult: async (mbtiData: MbtiRequest): Promise<void> => {
    // 실제 백엔드 연결 코드
    const response = await apiCallWithRetry(`/mbti/`, {
      method: 'POST',
      
      body: JSON.stringify(mbtiData),
    })
    
    if (response.status !== 204) {
      throw new Error('Failed to save MBTI result')
    }
    
    // Mock: 콘솔에 저장된 결과 출력 (개발용)
    // await new Promise(resolve => setTimeout(resolve, 300))
    // console.log('MBTI 결과 저장됨:', mbtiData)
  },

  // Get latest MBTI result (GET)
  getLatestMbtiResult: async (): Promise<MbtiResponse | null> => {
    // 실제 백엔드 연결 코드
    const response = await apiCallWithRetry(`/mbti/`, {
      method: 'GET',
      
    })
    
    if (!response.ok) {
      if (response.status === 404) {
        return null // 아직 MBTI 결과가 없음
      }
      throw new Error('Failed to fetch MBTI result')
    }
    
    return response.json()
    
    // Mock: 테스트용 데이터 반환 (개발용)
    // await new Promise(resolve => setTimeout(resolve, 300))
    // return {
    //   mbti_type: "ENFP",
    //   created_at: "2025-06-06T18:33:50.923180Z"
    // }
  }
}

// 반려견 등록 관련 Mock 데이터
const mockBreeds: BreedOption[] = [
  { id: 1, name: "말티즈" },
  { id: 2, name: "푸들" },
  { id: 3, name: "포메라니안" },
  { id: 4, name: "시츄" },
  { id: 5, name: "웰시코기" },
  { id: 6, name: "치와와" },
  { id: 7, name: "비숑프리제" },
  { id: 8, name: "요크셔테리어" },
  { id: 9, name: "프렌치불독" },
  { id: 10, name: "골든리트리버" },
  { id: 11, name: "보더콜리" },
  { id: 12, name: "비글" },
  { id: 13, name: "닥스훈트" },
  { id: 14, name: "시바이누" },
  { id: 15, name: "진돗개" },
  { id: 16, name: "믹스견" },
  { id: 17, name: "기타" }
]

const mockAllergies: AllergyCategory[] = [
  {
    category: "단백질 및 육류",
    items: [
      { id: 1, name: "닭고기" },
      { id: 2, name: "소고기" },
      { id: 3, name: "돼지고기" },
      { id: 4, name: "양고기" },
      { id: 5, name: "칠면조" }
    ]
  },
  {
    category: "해산물",
    items: [
      { id: 11, name: "연어" },
      { id: 12, name: "참치" },
      { id: 13, name: "흰살생선" },
      { id: 14, name: "조개류" },
      { id: 15, name: "새우" }
    ]
  },
  {
    category: "곡물",
    items: [
      { id: 21, name: "밀" },
      { id: 22, name: "옥수수" },
      { id: 23, name: "대두" },
      { id: 24, name: "쌀" },
      { id: 25, name: "보리" }
    ]
  },
  {
    category: "유제품",
    items: [
      { id: 31, name: "우유" },
      { id: 32, name: "치즈" },
      { id: 33, name: "요거트" }
    ]
  },
  {
    category: "견과류 및 씨앗",
    items: [
      { id: 41, name: "땅콩" },
      { id: 42, name: "아몬드" },
      { id: 43, name: "호두" }
    ]
  },
  {
    category: "과일 및 채소",
    items: [
      { id: 51, name: "사과" },
      { id: 52, name: "바나나" },
      { id: 53, name: "당근" }
    ]
  },
  {
    category: "첨가물",
    items: [
      { id: 61, name: "인공색소" },
      { id: 62, name: "인공향료" },
      { id: 63, name: "방부제" }
    ]
  }
]

const mockDiseases: DiseaseCategory[] = [
  {
    category: "소화기 질환",
    items: [
      { id: 1, name: "위염" },
      { id: 2, name: "췌장염" },
      { id: 3, name: "염증성 장질환" },
      { id: 4, name: "대장염" },
      { id: 5, name: "위 확장" },
      { id: 6, name: "위 염전" },
      { id: 7, name: "거대식도증" },
      { id: 8, name: "간 질환" },
      { id: 9, name: "담낭 질환" },
      { id: 10, name: "변비" },
      { id: 11, name: "설사" }
    ]
  },
  {
    category: "피부 질환",
    items: [
      { id: 12, name: "아토피 피부염" },
      { id: 13, name: "벼룩 알레르기" },
      { id: 14, name: "핫스팟" },
      { id: 15, name: "효모 감염" },
      { id: 16, name: "백선" },
      { id: 17, name: "개선충증" },
      { id: 18, name: "지루성 피부염" },
      { id: 19, name: "핥는 육아종" },
      { id: 20, name: "농피증" },
      { id: 21, name: "탈모" },
      { id: 22, name: "피부 종양" }
    ]
  },
  {
    category: "관절 및 뼈 질환",
    items: [
      { id: 23, name: "관절염" },
      { id: 24, name: "고관절 이형성증" },
      { id: 25, name: "십자인대 손상" },
      { id: 26, name: "골관절염" },
      { id: 27, name: "팔꿈치 이형성증" },
      { id: 28, name: "슬개골 탈구" },
      { id: 29, name: "골연골증" },
      { id: 30, name: "추간판 질환" },
      { id: 31, name: "워블러 증후군" },
      { id: 32, name: "비대성 골이영양증" }
    ]
  },
  {
    category: "심장 및 호흡기 질환",
    items: [
      { id: 33, name: "심장 잡음" },
      { id: 34, name: "울혈성 심부전" },
      { id: 35, name: "확장성 심근병증" },
      { id: 36, name: "승모판 질환" },
      { id: 37, name: "심장사상충" },
      { id: 38, name: "기관지염" },
      { id: 39, name: "폐렴" },
      { id: 40, name: "켄넬코프" },
      { id: 41, name: "기관 허탈" },
      { id: 42, name: "폐부종" }
    ]
  },
  {
    category: "신경 및 면역계 질환",
    items: [
      { id: 41, name: "간질" },
      { id: 42, name: "전정기관 질환" },
      { id: 43, name: "수막염" },
      { id: 44, name: "뇌염" }
    ]
  },
  {
    category: "눈 및 귀 질환",
    items: [
      { id: 51, name: "백내장" },
      { id: 52, name: "녹내장" },
      { id: 53, name: "결막염" },
      { id: 54, name: "진행성 망막위축" }
    ]
  },
  {
    category: "비뇨기 및 생식기 질환",
    items: [
      { id: 61, name: "요로 감염" },
      { id: 62, name: "신장 질환" },
      { id: 63, name: "방광 결석" },
      { id: 64, name: "요실금" }
    ]
  },
  {
    category: "기타 질환",
    items: [
      { id: 71, name: "당뇨병" },
      { id: 72, name: "비만" },
      { id: 73, name: "암" },
      { id: 74, name: "빈혈" }
    ]
  }
]

// 저장된 반려견 정보 (Mock)
let savedDogInfo: DogRegistrationResponse | null = null

// 반려견 등록 API 함수들
export const dogApi = {
  // 품종 리스트 조회
  getBreeds: async (): Promise<BreedOption[]> => {
    // 실제 백엔드 연결 코드
    const response = await apiCallWithRetry(`/option/breeds`, {
      method: 'GET',
      
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch breeds')
    }
    
    return response.json()
    
    // Mock 데이터 반환 (개발용)
    // await new Promise(resolve => setTimeout(resolve, 300))
    // return [...mockBreeds]
  },

  // 알레르기 리스트 조회
  getAllergies: async (): Promise<AllergyCategory[]> => {
    // 실제 백엔드 연결 코드
    const response = await apiCallWithRetry(`/option/allergies`, {
      method: 'GET',
      
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch allergies')
    }
    
    return response.json()
    
    // Mock 데이터 반환 (개발용)
    // await new Promise(resolve => setTimeout(resolve, 300))
    // return [...mockAllergies]
  },

  // 질병 리스트 조회
  getDiseases: async (): Promise<DiseaseCategory[]> => {
    // 실제 백엔드 연결 코드
    const response = await apiCallWithRetry(`/option/diseases`, {
      method: 'GET',
      
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch diseases')
    }
    
    return response.json()
    
    // Mock 데이터 반환 (개발용)
    // await new Promise(resolve => setTimeout(resolve, 300))
    // return [...mockDiseases]
  },

  // 반려견 등록
  registerDog: async (dogData: DogRegistrationRequest): Promise<DogRegistrationResponse> => {
    // 실제 백엔드 연결 코드
    const response = await apiCallWithRetry(`/dog/`, {
      method: 'POST',
      body: JSON.stringify(dogData),
    })
    
    if (!response.ok) {
      throw new Error('Failed to register dog')
    }
    
    return response.json()
  },

  // 반려견 정보 조회
  getDogInfo: async (): Promise<DogRegistrationResponse | null> => {
    // 실제 백엔드 연결 코드
    const response = await apiCallWithRetry(`/dog/`, {
      method: 'GET',
    })
    
    if (!response.ok) {
      if (response.status === 404) {
        return null // 아직 반려견 정보가 없음
      }
      throw new Error('Failed to fetch dog info')
    }
    
    return response.json()
  },

  // 반려견 정보 업데이트
  updateDog: async (dogId: number, dogData: DogRegistrationRequest): Promise<DogRegistrationResponse> => {
    // 실제 백엔드 연결 코드
    const response = await apiCallWithRetry(`/dog/`, {
      method: 'PUT',
      body: JSON.stringify(dogData),
    })
    
    if (!response.ok) {
      throw new Error('Failed to update dog')
    }
    
    return response.json()
  },

  // 반려견 정보 삭제
  deleteDog: async (dogId: number): Promise<void> => {
    // 실제 백엔드 연결 코드
    const response = await apiCallWithRetry(`/dog/`, {
      method: 'DELETE',
    })
    
    if (!response.ok) {
      throw new Error('Failed to delete dog')
    }
  }
}

// 건강 관련 API 타입 정의 - 백엔드 명세서에 맞춰 수정
export interface HealthCheckRequest {
  category: "식욕" | "활력" | "배변상태" | "수면" | "체온"
  status?: "정상" | "주의" | "이상" | null
  numeric_value?: number | null
  unit?: string | null
  memo?: string | null
}

export interface HealthCheckResponse {
  id: number
  category: string
  status: string | null
  numeric_value: number | null
  unit: string | null
  memo: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface WalkRecordRequest {
  distance_km: number
  duration_min: number
}

export interface WalkRecordResponse {
  id: number
  distance_km: number
  duration_min: number
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface FoodRecordRequest {
  time: string // HH:MM 형식
  brand?: string | null
  amount_g: number
}

export interface FoodRecordResponse {
  id: number
  time: string
  brand: string | null
  amount_g: number
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface WaterRecordRequest {
  amount_ml: number
}

export interface WaterRecordResponse {
  id: number
  amount_ml: number
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface WeightRecordRequest {
  weight_kg: number
}

export interface WeightRecordResponse {
  id: number
  weight_kg: number
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface WeeklyReportResponse {
  week_start: string
  week_end: string
  current_weight: number
  avg_walk_duration: number
  avg_walk_distance: number
  walk_count: number
  health_check_count: number
  water_count: number
  food_count: number
  total_water_ml: number
  total_food_g: number
}

// API Base URL configuration - 로컬 테스트용으로 변경
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost'
console.log('API_BASE_URL:', API_BASE_URL)

// Development mode toggle - set to false for production
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true'

// Helper function to get auth headers (쿠키 기반 인증으로 변경)
const getAuthHeaders = () => {
  return {
    'Content-Type': 'application/json'
  }
}

// Cookie-based fetch wrapper
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  console.log(`API 호출: ${API_BASE_URL}${endpoint}`)
  return fetch(`${API_BASE_URL}${endpoint}`, {
    credentials: 'include', // 🔥 중요: 쿠키 자동 포함
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })
}

// API call with automatic token refresh
const apiCallWithRetry = async (endpoint: string, options: RequestInit = {}): Promise<Response> => {
  let response = await apiCall(endpoint, options)
  
  // 401 에러 시 토큰 갱신 시도
  if (response.status === 401) {
    const refreshResponse = await apiCall('/user/refresh', {
      method: 'POST',
    })
    
    if (refreshResponse.ok) {
      // 토큰 갱신 성공, 원래 요청 재시도
      response = await apiCall(endpoint, options)
    } else {
      // 토큰 갱신 실패, 로그인 페이지로 리다이렉트
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
      throw new Error('Authentication failed')
    }
  }
  
  return response
}

// 새로운 건강 관리 API 함수들
export const healthApi = {
  // 건강 일일 체크
  createHealthCheck: async (data: HealthCheckRequest): Promise<HealthCheckResponse> => {
    // 실제 백엔드 연결 코드
    const response = await apiCallWithRetry(`/health/`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      throw new Error('Failed to create health check')
    }
    
    return response.json()
  },

  getHealthChecks: async (): Promise<HealthCheckResponse[]> => {
    // 실제 백엔드 연결 코드
    const response = await apiCallWithRetry(`/health/`, {
      method: 'GET',
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch health checks')
    }
    
    return response.json()
  },

  getTodayHealthChecks: async (): Promise<HealthCheckResponse[]> => {
    // 실제 백엔드 연결 코드 (오늘 건강체크 전용 엔드포인트)
    const response = await apiCallWithRetry(`/health/today`, {
      method: 'GET',
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch today health checks')
    }
    
    return response.json()
  },

  // 특정 건강체크 조회
  getHealthCheck: async (id: number): Promise<HealthCheckResponse> => {
    // 실제 백엔드 연결 코드
    const response = await apiCallWithRetry(`/health/${id}`, {
      method: 'GET',
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch health check')
    }
    
    return response.json()
  },

  updateHealthCheck: async (id: number, data: HealthCheckRequest): Promise<HealthCheckResponse> => {
    // 실제 백엔드 연결 코드
    const response = await apiCallWithRetry(`/health/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      throw new Error('Failed to update health check')
    }
    
    return response.json()
  },

  deleteHealthCheck: async (id: number): Promise<void> => {
    // 실제 백엔드 연결 코드
    const response = await apiCallWithRetry(`/health/${id}`, {
      method: 'DELETE',
    })
    
    if (!response.ok) {
      throw new Error('Failed to delete health check')
    }
  },

  // 산책 기록
  createWalkRecord: async (data: WalkRecordRequest): Promise<WalkRecordResponse> => {
    // 실제 백엔드 연결 코드
    const response = await apiCallWithRetry(`/health/walks`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      throw new Error('Failed to create walk record')
    }
    
    return response.json()
  },

  getWalkRecords: async (): Promise<WalkRecordResponse[]> => {
    // 실제 백엔드 연결 코드
    const response = await apiCallWithRetry(`/health/walks/list`, {
      method: 'GET',
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch walk records')
    }
    
    return response.json()
  },

  // 개별 산책 기록 조회
  getWalkRecord: async (id: number): Promise<WalkRecordResponse> => {
    // 실제 백엔드 연결 코드
    const response = await apiCallWithRetry(`/health/walks/${id}`, {
      method: 'GET',
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch walk record')
    }
    
    return response.json()
  },

  updateWalkRecord: async (id: number, data: WalkRecordRequest): Promise<WalkRecordResponse> => {
    // 실제 백엔드 연결 코드
    const response = await apiCallWithRetry(`/health/walks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      throw new Error('Failed to update walk record')
    }
    
    return response.json()
  },

  deleteWalkRecord: async (id: number): Promise<void> => {
    // 실제 백엔드 연결 코드
    const response = await apiCallWithRetry(`/health/walks/${id}`, {
      method: 'DELETE',
    })
    
    if (!response.ok) {
      throw new Error('Failed to delete walk record')
    }
  },

  // 사료 기록
  createFoodRecord: async (data: FoodRecordRequest): Promise<FoodRecordResponse> => {
    // 실제 백엔드 연결 코드
    const response = await apiCallWithRetry(`/health/foods`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      throw new Error('Failed to create food record')
    }
    
    return response.json()
  },

  getFoodRecords: async (): Promise<FoodRecordResponse[]> => {
    // 실제 백엔드 연결 코드
    const response = await apiCallWithRetry(`/health/foods/list`, {
      method: 'GET',
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch food records')
    }
    
    return response.json()
  },

  // 개별 사료 기록 조회
  getFoodRecord: async (id: number): Promise<FoodRecordResponse> => {
    // 실제 백엔드 연결 코드
    const response = await apiCallWithRetry(`/health/foods/${id}`, {
      method: 'GET',
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch food record')
    }
    
    return response.json()
  },

  updateFoodRecord: async (id: number, data: FoodRecordRequest): Promise<FoodRecordResponse> => {
    // 실제 백엔드 연결 코드
    const response = await apiCallWithRetry(`/health/foods/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      throw new Error('Failed to update food record')
    }
    
    return response.json()
  },

  deleteFoodRecord: async (id: number): Promise<void> => {
    // 실제 백엔드 연결 코드
    const response = await apiCallWithRetry(`/health/foods/${id}`, {
      method: 'DELETE',
    })
    
    if (!response.ok) {
      throw new Error('Failed to delete food record')
    }
  },

  // 물 섭취 기록
  createWaterRecord: async (data: WaterRecordRequest): Promise<WaterRecordResponse> => {
    // 실제 백엔드 연결 코드
    const response = await apiCallWithRetry(`/health/waters`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      throw new Error('Failed to create water record')
    }
    
    return response.json()
  },

  getWaterRecords: async (): Promise<WaterRecordResponse[]> => {
    // 실제 백엔드 연결 코드
    const response = await apiCallWithRetry(`/health/waters/list`, {
      method: 'GET',
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch water records')
    }
    
    return response.json()
  },

  // 개별 물 섭취 기록 조회
  getWaterRecord: async (id: number): Promise<WaterRecordResponse> => {
    // 실제 백엔드 연결 코드
    const response = await apiCallWithRetry(`/health/waters/${id}`, {
      method: 'GET',
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch water record')
    }
    
    return response.json()
  },

  updateWaterRecord: async (id: number, data: WaterRecordRequest): Promise<WaterRecordResponse> => {
    // 실제 백엔드 연결 코드
    const response = await apiCallWithRetry(`/health/waters/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      throw new Error('Failed to update water record')
    }
    
    return response.json()
  },

  deleteWaterRecord: async (id: number): Promise<void> => {
    // 실제 백엔드 연결 코드
    const response = await apiCallWithRetry(`/health/waters/${id}`, {
      method: 'DELETE',
    })
    
    if (!response.ok) {
      throw new Error('Failed to delete water record')
    }
  },

  // 체중 기록
  createWeightRecord: async (data: WeightRecordRequest): Promise<WeightRecordResponse> => {
    // 실제 백엔드 연결 코드
    const response = await apiCallWithRetry(`/health/weights`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      throw new Error('Failed to create weight record')
    }
    
    return response.json()
  },

  getWeightRecords: async (): Promise<WeightRecordResponse[]> => {
    // 실제 백엔드 연결 코드
    console.log('체중 기록 API 호출: /health/weights/list')
    const response = await apiCallWithRetry(`/health/weights/list`, {
      method: 'GET',
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch weight records')
    }
    
    return response.json()
  },

  // 개별 체중 기록 조회
  getWeightRecord: async (id: number): Promise<WeightRecordResponse> => {
    // 실제 백엔드 연결 코드
    const response = await apiCallWithRetry(`/health/weights/${id}`, {
      method: 'GET',
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch weight record')
    }
    
    return response.json()
  },

  updateWeightRecord: async (id: number, data: WeightRecordRequest): Promise<WeightRecordResponse> => {
    // 실제 백엔드 연결 코드
    const response = await apiCallWithRetry(`/health/weights/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      throw new Error('Failed to update weight record')
    }
    
    return response.json()
  },

  deleteWeightRecord: async (id: number): Promise<void> => {
    // 실제 백엔드 연결 코드
    const response = await apiCallWithRetry(`/health/weights/${id}`, {
      method: 'DELETE',
    })
    
    if (!response.ok) {
      throw new Error('Failed to delete weight record')
    }
  },

  // 주간 리포트
  getWeeklyReport: async (): Promise<WeeklyReportResponse> => {
    // 실제 백엔드 연결 코드
    console.log('주간 리포트 API 호출: /health/report/weekly/list')
    const response = await apiCallWithRetry(`/health/report/weekly/list`, {
      method: 'GET',
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch weekly report')
    }
    
    return response.json()
  }
}

// 백신 관리 API 타입 정의
export interface VaccineType {
  id: string
  name: string
  category: "필수" | "선택"
  description: string
  period: number
}

export interface VaccinationRequest {
  vaccine_id: string
  date: string
  hospital?: string
  memo?: string
}

export interface VaccinationResponse {
  id: number
  vaccine_id: string
  date: string
  hospital?: string
  memo?: string
}

// 리포트 API 타입 정의 (기존 유지)
export interface HealthInsightResponse {
  score: number
  status: string
  insights: string[]
}

export interface ActivityStatsResponse {
  walk_count: number
  total_walk_distance: number
  avg_walk_distance?: number
  feed_count: number
  water_count: number
  avg_food_amount?: number
  avg_water_intake?: number
  latest_weight?: number
  health_check_count: number
  health_check_abnormal_count: number
}

export interface HealthCheckDetailResponse {
  category: string
  status: string
  avg_numeric_value: number | null
  unit: string | null
  data_count: number
  abnormal_count: number
  trend: string
}

export interface ComprehensiveReportResponse {
  health_insight: HealthInsightResponse
  activity_stats: ActivityStatsResponse
  health_check_details: HealthCheckDetailResponse[]
}

export interface ReportSummaryResponse {
  period: string
  health_score: number
  health_status: string
  walk_count: number
  feed_count: number
  health_check_count: number
  abnormal_health_count: number
}

// 리포트 API 함수들
export const reportApi = {
  // 종합 건강 리포트
  getComprehensiveReport: async (period: 'week' | 'month' | 'all' = 'week'): Promise<ComprehensiveReportResponse> => {
    // 실제 백엔드 연결 코드 - URL 패턴 확인 필요
    console.log(`리포트 API 호출: /report/comprehensive?period=${period}`)
    const response = await apiCallWithRetry(`/report/comprehensive?period=${period}`, {
      method: 'GET',
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch comprehensive report')
    }
    
    return response.json()
  },

  // 건강 인사이트만 조회
  getHealthInsight: async (period: 'week' | 'month' | 'all' = 'week'): Promise<HealthInsightResponse> => {
    // 실제 백엔드 연결 코드
    console.log(`건강 인사이트 API 호출: /report/insight?period=${period}`)
    const response = await apiCallWithRetry(`/report/insight?period=${period}`, {
      method: 'GET',
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch health insight')
    }
    
    return response.json()
  },

  // 활동 통계만 조회
  getActivityStats: async (period: 'week' | 'month' | 'all' = 'week'): Promise<ActivityStatsResponse> => {
    // 실제 백엔드 연결 코드
    console.log(`활동 통계 API 호출: /report/activities?period=${period}`)
    const response = await apiCallWithRetry(`/report/activities?period=${period}`, {
      method: 'GET',
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch activity stats')
    }
    
    return response.json()
  },

  // 건강 체크 상세 분석
  getHealthDetails: async (period: 'week' | 'month' | 'all' = 'week'): Promise<HealthCheckDetailResponse[]> => {
    // 실제 백엔드 연결 코드
    console.log(`건강 상세 분석 API 호출: /report/health-details?period=${period}`)
    const response = await apiCallWithRetry(`/report/health-details?period=${period}`, {
      method: 'GET',
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch health details')
    }
    
    return response.json()
  },

  // 리포트 요약
  getReportSummary: async (period: 'week' | 'month' | 'all' = 'week'): Promise<ReportSummaryResponse> => {
    // 실제 백엔드 연결 코드
    console.log(`리포트 요약 API 호출: /report/summary?period=${period}`)
    const response = await apiCallWithRetry(`/report/summary?period=${period}`, {
      method: 'GET',
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch report summary')
    }
    
    return response.json()
  }
}

// 백신 관리 API 함수들
export const vaccineApi = {
  // 백신 타입 목록 조회
  getVaccineTypes: async (): Promise<VaccineType[]> => {
    // 실제 백엔드 연결 코드
    const response = await apiCallWithRetry(`/vaccine/types`, {
      method: 'GET',
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch vaccine types')
    }
    
    return response.json()
    
         // Mock 데이터 반환 (개발용)
     // await new Promise(resolve => setTimeout(resolve, 300))
     // return [
     //   {
     //     id: "dhppl",
     //     name: "DHPPL (종합백신)",
     //     category: "필수",
     //     description: "디스템퍼, 간염, 파보바이러스, 파라인플루엔자, 렙토스피라증",
     //     period: 365
     //   },
     //   {
     //     id: "rabies",
     //     name: "광견병 (Rabies)",
     //     category: "필수",
     //     description: "치명적인 바이러스성 질환 예방 (법적 의무)",
     //     period: 365
     //   },
     //   {
     //     id: "heartworm",
     //     name: "심장사상충 예방약",
     //     category: "필수",
     //     description: "모기를 통해 전염되는 기생충 예방",
     //     period: 30
     //   },
     //   {
     //     id: "kennel",
     //     name: "켄넬코프 (KC, Bordetella)",
     //     category: "선택",
     //     description: "전염성 기관지염 예방",
     //     period: 365
     //   },
     //   {
     //     id: "corona",
     //     name: "코로나 장염 백신",
     //     category: "선택",
     //     description: "개 코로나 바이러스 예방",
     //     period: 365
     //   },
     //   {
     //     id: "influenza",
     //     name: "인플루엔자 백신",
     //     category: "선택",
     //     description: "개 인플루엔자 예방",
     //     period: 365
     //   }
     // ]
  },

  // 백신 접종 기록 목록 조회
  getVaccinations: async (): Promise<VaccinationResponse[]> => {
    // 실제 백엔드 연결 코드
    const response = await apiCallWithRetry(`/vaccine/`, {
      method: 'GET',
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch vaccinations')
    }
    
    return response.json()
    
         // Mock 데이터 반환 (개발용)
     // await new Promise(resolve => setTimeout(resolve, 300))
     // return [
     //   {
     //     id: 1,
     //     vaccine_id: "dhppl",
     //     date: "2024-01-15",
     //     hospital: "우리동물병원",
     //     memo: "1차 접종 완료"
     //   },
     //   {
     //     id: 2,
     //     vaccine_id: "rabies",
     //     date: "2024-02-01",
     //     hospital: "우리동물병원",
     //     memo: "2차 접종 완료"
     //   },
     //   {
     //     id: 3,
     //     vaccine_id: "heartworm",
     //     date: "2024-02-15",
     //     hospital: "우리동물병원",
     //     memo: "심장사상충 예방약 투여"
     //   }
     // ]
  },

  // 백신 접종 기록 등록
  createVaccination: async (data: VaccinationRequest): Promise<VaccinationResponse> => {
    // 실제 백엔드 연결 코드
    const response = await apiCallWithRetry(`/vaccine/`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      throw new Error('Failed to create vaccination')
    }
    
    return response.json()
    
    // Mock 데이터 반환 (개발용)
    // await new Promise(resolve => setTimeout(resolve, 300))
    // return {
    //   id: Date.now(),
    //   vaccine_id: data.vaccine_id,
    //   date: data.date,
    //   hospital: data.hospital,
    //   memo: data.memo
    // }
  },

  // 백신 접종 기록 수정
  updateVaccination: async (vaccinationId: number, data: VaccinationRequest): Promise<VaccinationResponse> => {
    // 실제 백엔드 연결 코드
    const response = await apiCallWithRetry(`/vaccine/${vaccinationId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      throw new Error('Failed to update vaccination')
    }
    
    return response.json()
    
    // Mock 데이터 반환 (개발용)
    // await new Promise(resolve => setTimeout(resolve, 300))
    // return {
    //   id: vaccinationId,
    //   vaccine_id: data.vaccine_id,
    //   date: data.date,
    //   hospital: data.hospital,
    //   memo: data.memo
    // }
  },

  // 백신 접종 기록 삭제
  deleteVaccination: async (vaccinationId: number): Promise<void> => {
    // 실제 백엔드 연결 코드
    const response = await apiCallWithRetry(`/vaccine/${vaccinationId}`, {
      method: 'DELETE',
    })
    
    if (!response.ok) {
      throw new Error('Failed to delete vaccination')
    }
    
    // Mock (개발용)
    // await new Promise(resolve => setTimeout(resolve, 300))
  }
}