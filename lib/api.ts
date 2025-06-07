// Emergency API functions

// Mock data for development
const mockEmergencyGuides = [
  {
    "id": "poisoning",
    "title": "중독",
    "severity": "high",
    "symptoms": [
      "구토",
      "설사",
      "과도한 침 흘림",
      "경련",
      "의식 저하"
    ],
    "first_aid": [
      "먹은 독성 물질을 확인하세요.",
      "구토를 유도하지 마세요 (수의사의 지시가 없는 한).",
      "활성탄을 가지고 있다면 수의사와 상담 후 투여하세요.",
      "즉시 동물병원으로 이동하세요."
    ],
    "notes": "중독 물질과 섭취 시간을 기록해두면 치료에 도움이 됩니다."
  },
  {
    "id": "seizure",
    "title": "발작",
    "severity": "high",
    "symptoms": [
      "몸의 경직",
      "의식 상실",
      "다리를 젓는 움직임",
      "침 흘림",
      "배변/배뇨 실수"
    ],
    "first_aid": [
      "반려견의 주변에서 위험한 물건을 치우세요.",
      "반려견을 만지거나 입에 손을 넣지 마세요.",
      "발작 시간을 기록하세요.",
      "발작이 1분 이상 지속되거나 연속으로 발생하면 즉시 병원으로 이동하세요."
    ],
    "notes": "발작 전후 행동을 기록해두면 진단에 도움이 됩니다."
  },
  {
    "id": "choking",
    "title": "질식",
    "severity": "high",
    "symptoms": [
      "호흡 곤란",
      "과도한 기침",
      "입술이나 잇몸이 파랗게 변함",
      "공황 상태"
    ],
    "first_aid": [
      "반려견의 입을 열고 이물질이 보이면 조심스럽게 제거하세요.",
      "하임리히 방법: 작은 개는 등을 위로 향하게 들고, 큰 개는 뒤에서 복부를 감싸고 위쪽으로 밀어올리세요.",
      "이물질이 제거되지 않으면 즉시 병원으로 이동하세요."
    ],
    "notes": "질식은 생명을 위협하는 응급 상황입니다. 신속하게 대처하세요."
  },
  {
    "id": "heatstroke",
    "title": "열사병",
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
      "시원한 장소로 이동시키세요.",
      "미지근한 물로 몸을 적셔주세요 (차가운 물은 피하세요).",
      "선풍기로 바람을 쐬어주세요.",
      "물을 조금씩 마시게 하세요.",
      "체온이 정상으로 돌아오더라도 반드시 병원에 방문하세요."
    ],
    "notes": "여름철 차 안에 반려견을 절대 두지 마세요. 온도는 빠르게 상승합니다."
  },
  {
    "id": "bleeding",
    "title": "출혈",
    "severity": "medium",
    "symptoms": [
      "지속적인 출혈",
      "혈액이 묻은 털",
      "창백한 잇몸",
      "약한 맥박",
      "무기력"
    ],
    "first_aid": [
      "깨끗한 천이나 거즈로 상처를 압박하세요.",
      "출혈이 심하면 지혈대를 사용하세요 (최대 15분).",
      "반려견을 따뜻하게 유지하고 움직임을 최소화하세요.",
      "즉시 병원으로 이동하세요."
    ],
    "notes": "출혈량이 많으면 쇼크 상태가 될 수 있으니 주의하세요."
  },
  {
    "id": "fracture",
    "title": "골절",
    "severity": "medium",
    "symptoms": [
      "다리를 절음",
      "부기",
      "비정상적인 각도",
      "만졌을 때 통증",
      "움직이지 않으려 함"
    ],
    "first_aid": [
      "반려견을 진정시키고 움직임을 최소화하세요.",
      "개방성 골절(뼈가 피부를 뚫고 나온 경우)은 깨끗한 천으로 덮으세요.",
      "부목을 대지 마세요 (잘못하면 더 악화될 수 있습니다).",
      "담요나 수건으로 조심스럽게 감싸서 병원으로 이동하세요."
    ],
    "notes": "골절이 의심되면 반려견을 들어올릴 때 부상 부위를 지지해주세요."
  }
]

// Mock hospital data - separated by type for new endpoints
const mockAllHospitals = [
  {
    "id": 1,
    "name": "24시 동물메디컬센터",
    "phone": "02-1234-5678",
    "address": "서울시 강남구 테헤란로 123",
    "type": "응급 병원",
    "is_emergency": true,
    "hours": "24시간",
    "notes": "응급 수술 가능",
    "specialties": ["응급 처치", "중환자실"]
  },
  {
    "id": 2,
    "name": "우리동네 동물병원",
    "phone": "02-9876-5432",
    "address": "서울시 서초구 서초대로 456",
    "type": "일반 병원",
    "is_emergency": false,
    "hours": "평일 09:00-18:00, 토요일 09:00-13:00",
    "notes": "정기 검진 및 예방 접종",
    "specialties": ["일반 진료", "예방 접종"]
  },
  {
    "id": 3,
    "name": "특수동물 전문센터",
    "phone": "02-5555-1234",
    "address": "서울시 용산구 이태원로 789",
    "type": "전문 병원",
    "is_emergency": false,
    "hours": "평일 10:00-19:00",
    "notes": "특수동물 및 야생동물 전문",
    "specialties": ["특수동물", "야생동물", "이국적 동물"]
  },
  {
    "id": 4,
    "name": "응급 동물병원 365",
    "phone": "02-7777-8888",
    "address": "서울시 마포구 월드컵로 111",
    "type": "응급 병원",
    "is_emergency": true,
    "hours": "24시간 운영",
    "notes": "365일 24시간 응급진료",
    "specialties": ["응급 처치", "응급 수술", "중환자실"]
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

// API functions (currently using mock data)
export const emergencyApi = {
  // Get emergency guides list
  getGuides: async (): Promise<EmergencyGuide[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    return mockEmergencyGuides
  },

  // Get emergency guide detail by ID
  getGuideDetail: async (guideId: string): Promise<EmergencyGuide | null> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    const guide = mockEmergencyGuides.find(g => g.id === guideId)
    return guide || null
  },

  // Get emergency hospitals summary (only is_emergency: true)
  getEmergencyHospitalsSummary: async (): Promise<HospitalSummary[]> => {
    await new Promise(resolve => setTimeout(resolve, 400))
    const emergencyHospitals = mockAllHospitals.filter(h => h.is_emergency === true)
    return emergencyHospitals.map(h => ({
      id: h.id,
      name: h.name,
      phone: h.phone
    }))
  },

  // Get all hospitals
  getAllHospitals: async (): Promise<HospitalDetail[]> => {
    await new Promise(resolve => setTimeout(resolve, 400))
    return [...mockAllHospitals]
  },

  // Get regular hospitals
  getRegularHospitals: async (): Promise<HospitalDetail[]> => {
    await new Promise(resolve => setTimeout(resolve, 400))
    return mockAllHospitals.filter(h => h.type === "일반 병원")
  },

  // Get emergency hospitals  
  getEmergencyHospitals: async (): Promise<HospitalDetail[]> => {
    await new Promise(resolve => setTimeout(resolve, 400))
    return mockAllHospitals.filter(h => h.type === "응급 병원")
  },

  // Get specialist hospitals
  getSpecialistHospitals: async (): Promise<HospitalDetail[]> => {
    await new Promise(resolve => setTimeout(resolve, 400))
    return mockAllHospitals.filter(h => h.type === "전문 병원")
  },

  // Get hospital detail by ID
  getHospitalDetail: async (hospitalId: number): Promise<HospitalDetail | null> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    const hospital = mockAllHospitals.find(h => h.id === hospitalId)
    return hospital || null
  },

  // Create hospital
  createHospital: async (hospitalData: HospitalCreateRequest): Promise<HospitalDetail> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    const newHospital: HospitalDetail = {
      ...hospitalData,
      id: Date.now() // Mock ID generation
    }
    mockAllHospitals.push(newHospital)
    return newHospital
  },

  // Update hospital
  updateHospital: async (hospitalId: number, hospitalData: HospitalCreateRequest): Promise<HospitalDetail> => {
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
  },

  // Delete hospital
  deleteHospital: async (hospitalId: number): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    const index = mockAllHospitals.findIndex(h => h.id === hospitalId)
    if (index !== -1) {
      mockAllHospitals.splice(index, 1)
    }
  }
}

// Medication API functions
export const medicationApi = {
  // Get all medications
  getMedications: async (): Promise<MedicationResponse[]> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return [...mockMedications]
  },

  // Create medication (POST only for creation)
  createMedication: async (medicationData: MedicationRequest): Promise<MedicationResponse> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 종료일이 없거나 null이면 필드 제거
    const requestData: any = { ...medicationData }
    if (!requestData.end_date || requestData.end_date === null) {
      delete requestData.end_date
    }
    
    const newMedication: MedicationResponse = {
      ...requestData,
      id: Date.now(), // Mock ID generation
      end_date: requestData.end_date || undefined
    }
    mockMedications.push(newMedication)
    return newMedication
  },

  // Update medication (PUT for updates)
  updateMedication: async (medicationId: number, medicationData: MedicationRequest): Promise<MedicationResponse> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    const index = mockMedications.findIndex(m => m.id === medicationId)
    if (index === -1) {
      throw new Error('Medication not found')
    }
    
    // 종료일이 없거나 null이면 필드 제거
    const requestData: any = { ...medicationData }
    if (!requestData.end_date || requestData.end_date === null) {
      delete requestData.end_date
    }
    
    const updatedMedication: MedicationResponse = {
      ...requestData,
      id: medicationId,
      end_date: requestData.end_date || undefined
    }
    
    mockMedications[index] = updatedMedication
    return updatedMedication
  },

  // Delete medication
  deleteMedication: async (medicationId: number): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    const index = mockMedications.findIndex(m => m.id === medicationId)
    if (index !== -1) {
      mockMedications.splice(index, 1)
    }
  }
}

// User API functions
export const userApi = {
  // Get current user info (GET /user/me/)
  getCurrentUser: async (): Promise<{ email: string; nickname: string }> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // Mock: 로컬스토리지에서 유저 정보 가져오기
    const user = localStorage.getItem("user")
    if (user) {
      const userInfo = JSON.parse(user)
      return {
        email: userInfo.email,
        nickname: userInfo.name
      }
    }
    
    // 실제 백엔드 연결 시 사용할 코드
    // const response = await fetch('/user/me/', {
    //   method: 'GET',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${localStorage.getItem('token')}`
    //   },
    // })
    
    // if (!response.ok) {
    //   throw new Error('Failed to fetch user info')
    // }
    
    // return response.json()
    
    throw new Error('User not found')
  },

  // Logout (POST /user/logout/)
  logout: async (): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // Mock: 로컬스토리지 토큰 제거
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    
    // 실제 백엔드 연결 시 사용할 코드
    // const response = await fetch('/user/logout/', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${localStorage.getItem('token')}`
    //   },
    // })
    
    // if (response.status !== 204) {
    //   throw new Error('Failed to logout')
    // }
    
    console.log('로그아웃 완료')
  }
}

// MBTI API functions
export const mbtiApi = {
  // Save MBTI result (POST)
  saveMbtiResult: async (mbtiData: MbtiRequest): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // 실제 백엔드 연결 시 사용할 코드
    // const response = await fetch('/mbti/', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(mbtiData),
    // })
    
    // if (response.status !== 204) {
    //   throw new Error('Failed to save MBTI result')
    // }
    
    // Mock: 콘솔에 저장된 결과 출력
    console.log('MBTI 결과 저장됨:', mbtiData)
  },

  // Get latest MBTI result (GET)
  getLatestMbtiResult: async (): Promise<MbtiResponse | null> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // 실제 백엔드 연결 시 사용할 코드
    // const response = await fetch('/mbti/', {
    //   method: 'GET',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    // })
    
    // if (!response.ok) {
    //   if (response.status === 404) {
    //     return null // 아직 MBTI 결과가 없음
    //   }
    //   throw new Error('Failed to fetch MBTI result')
    // }
    
    // return response.json()
    
    // Mock: 테스트용 데이터 반환
    return {
      mbti_type: "ENFP",
      created_at: new Date().toISOString()
    }
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
      { id: 5, name: "칠면조" },
      { id: 6, name: "오리고기" },
      { id: 7, name: "토끼고기" },
      { id: 8, name: "사슴고기" },
      { id: 9, name: "캥거루고기" },
      { id: 10, name: "메추라기" }
    ]
  },
  {
    category: "해산물",
    items: [
      { id: 11, name: "연어" },
      { id: 12, name: "참치" },
      { id: 13, name: "흰살생선" },
      { id: 14, name: "조개류" },
      { id: 15, name: "새우" },
      { id: 16, name: "게" },
      { id: 17, name: "오징어" },
      { id: 18, name: "멸치" },
      { id: 19, name: "고등어" },
      { id: 20, name: "정어리" }
    ]
  },
  {
    category: "곡물",
    items: [
      { id: 21, name: "밀" },
      { id: 22, name: "옥수수" },
      { id: 23, name: "대두" },
      { id: 24, name: "쌀" },
      { id: 25, name: "보리" },
      { id: 26, name: "귀리" },
      { id: 27, name: "호밀" },
      { id: 28, name: "퀴노아" },
      { id: 29, name: "기장" },
      { id: 30, name: "메밀" }
    ]
  },
  {
    category: "유제품",
    items: [
      { id: 31, name: "우유" },
      { id: 32, name: "치즈" },
      { id: 33, name: "요거트" },
      { id: 34, name: "버터" },
      { id: 35, name: "크림" },
      { id: 36, name: "아이스크림" },
      { id: 37, name: "유청" },
      { id: 38, name: "카제인" }
    ]
  },
  {
    category: "견과류 및 씨앗",
    items: [
      { id: 39, name: "땅콩" },
      { id: 40, name: "아몬드" },
      { id: 41, name: "호두" },
      { id: 42, name: "캐슈넛" },
      { id: 43, name: "피스타치오" },
      { id: 44, name: "아마씨" },
      { id: 45, name: "참깨" },
      { id: 46, name: "해바라기씨" },
      { id: 47, name: "호박씨" }
    ]
  },
  {
    category: "과일 및 채소",
    items: [
      { id: 48, name: "사과" },
      { id: 49, name: "바나나" },
      { id: 50, name: "당근" },
      { id: 51, name: "감자" },
      { id: 52, name: "토마토" },
      { id: 53, name: "아보카도" },
      { id: 54, name: "브로콜리" },
      { id: 55, name: "시금치" },
      { id: 56, name: "완두콩" },
      { id: 57, name: "고구마" }
    ]
  },
  {
    category: "첨가물",
    items: [
      { id: 58, name: "인공색소" },
      { id: 59, name: "인공향료" },
      { id: 60, name: "방부제" },
      { id: 61, name: "BHA/BHT" },
      { id: 62, name: "프로필렌 글리콜" },
      { id: 63, name: "에톡시퀸" },
      { id: 64, name: "MSG" },
      { id: 65, name: "아황산염" },
      { id: 66, name: "질산염" }
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
      { id: 43, name: "간질" },
      { id: 44, name: "전정기관 질환" },
      { id: 45, name: "수막염" },
      { id: 46, name: "뇌염" },
      { id: 47, name: "자가면역 질환" },
      { id: 48, name: "루푸스" },
      { id: 49, name: "중증근무력증" },
      { id: 50, name: "갑상선 기능저하증" },
      { id: 51, name: "갑상선 기능항진증" },
      { id: 52, name: "쿠싱병" },
      { id: 53, name: "애디슨병" }
    ]
  },
  {
    category: "눈 및 귀 질환",
    items: [
      { id: 54, name: "백내장" },
      { id: 55, name: "녹내장" },
      { id: 56, name: "결막염" },
      { id: 57, name: "진행성 망막위축" },
      { id: 58, name: "체리아이" },
      { id: 59, name: "귀 감염" },
      { id: 60, name: "귀진드기" },
      { id: 61, name: "청각 장애" },
      { id: 62, name: "외이염" }
    ]
  },
  {
    category: "비뇨기 및 생식기 질환",
    items: [
      { id: 63, name: "요로 감염" },
      { id: 64, name: "신장 질환" },
      { id: 65, name: "방광 결석" },
      { id: 66, name: "요실금" },
      { id: 67, name: "전립선 문제" },
      { id: 68, name: "자궁축농증" },
      { id: 69, name: "유선 종양" },
      { id: 70, name: "고환 종양" },
      { id: 71, name: "잠복고환" }
    ]
  },
  {
    category: "기타 질환",
    items: [
      { id: 72, name: "당뇨병" },
      { id: 73, name: "비만" },
      { id: 74, name: "암" },
      { id: 75, name: "빈혈" },
      { id: 76, name: "치과 질환" },
      { id: 77, name: "기생충" },
      { id: 78, name: "라임병" },
      { id: 79, name: "파보바이러스" },
      { id: 80, name: "디스템퍼" },
      { id: 81, name: "렙토스피라증" }
    ]
  }
]

// 저장된 반려견 정보 (Mock)
let savedDogInfo: DogRegistrationResponse | null = null

// 반려견 등록 API 함수들
export const dogApi = {
  // 품종 리스트 조회
  getBreeds: async (): Promise<BreedOption[]> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return [...mockBreeds]
  },

  // 알레르기 리스트 조회
  getAllergies: async (): Promise<AllergyCategory[]> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return [...mockAllergies]
  },

  // 질병 리스트 조회
  getDiseases: async (): Promise<DiseaseCategory[]> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return [...mockDiseases]
  },

  // 반려견 등록
  registerDog: async (dogData: DogRegistrationRequest): Promise<DogRegistrationResponse> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 품종 이름 찾기
    const breed = mockBreeds.find(b => b.id === dogData.breed_id)
    const breedName = breed ? breed.name : "알 수 없음"
    
    // 알레르기 이름들 찾기
    const allergyNames: string[] = []
    if (dogData.allergy_ids) {
      dogData.allergy_ids.forEach((id: number) => {
        mockAllergies.forEach(category => {
          const allergyItem = category.items.find(item => item.id === id)
          if (allergyItem) {
            allergyNames.push(allergyItem.name)
          }
        })
      })
    }
    
    // 질병 이름들 찾기
    const diseaseNames: string[] = []
    if (dogData.disease_ids) {
      dogData.disease_ids.forEach((id: number) => {
        mockDiseases.forEach(category => {
          const diseaseItem = category.items.find(item => item.id === id)
          if (diseaseItem) {
            diseaseNames.push(diseaseItem.name)
          }
        })
      })
    }
    
    const registeredDog: DogRegistrationResponse = {
      id: Date.now(), // Mock ID generation
      name: dogData.name,
      birth_date: dogData.birth_date,
      age_group: dogData.age_group,
      weight: dogData.weight,
      gender: dogData.gender,
      medication: dogData.medication || null,
      breed_name: breedName,
      allergy_names: allergyNames,
      disease_names: diseaseNames
    }
    
    // Mock에서 저장
    savedDogInfo = registeredDog
    return registeredDog
  },

  // 반려견 정보 조회
  getDogInfo: async (): Promise<DogRegistrationResponse | null> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return savedDogInfo
  },

  // 반려견 정보 업데이트
  updateDog: async (dogId: number, dogData: DogRegistrationRequest): Promise<DogRegistrationResponse> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    if (!savedDogInfo || savedDogInfo.id !== dogId) {
      throw new Error('Dog not found')
    }
    
    // 품종 이름 찾기
    const breed = mockBreeds.find(b => b.id === dogData.breed_id)
    const breedName = breed ? breed.name : "알 수 없음"
    
    // 알레르기 이름들 찾기
    const allergyNames: string[] = []
    if (dogData.allergy_ids) {
      dogData.allergy_ids.forEach((id: number) => {
        mockAllergies.forEach(category => {
          const allergyItem = category.items.find(item => item.id === id)
          if (allergyItem) {
            allergyNames.push(allergyItem.name)
          }
        })
      })
    }
    
    // 질병 이름들 찾기
    const diseaseNames: string[] = []
    if (dogData.disease_ids) {
      dogData.disease_ids.forEach((id: number) => {
        mockDiseases.forEach(category => {
          const diseaseItem = category.items.find(item => item.id === id)
          if (diseaseItem) {
            diseaseNames.push(diseaseItem.name)
          }
        })
      })
    }
    
    const updatedDog: DogRegistrationResponse = {
      id: dogId,
      name: dogData.name,
      birth_date: dogData.birth_date,
      age_group: dogData.age_group,
      weight: dogData.weight,
      gender: dogData.gender,
      medication: dogData.medication || null,
      breed_name: breedName,
      allergy_names: allergyNames,
      disease_names: diseaseNames
    }
    
    savedDogInfo = updatedDog
    return updatedDog
  },

  // 반려견 정보 삭제
  deleteDog: async (dogId: number): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    if (savedDogInfo && savedDogInfo.id === dogId) {
      savedDogInfo = null
    }
  }
}