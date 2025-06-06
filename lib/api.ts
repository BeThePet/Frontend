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