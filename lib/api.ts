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

// POST /dog/ - 반려견 등록용
export interface DogCreateRequest {
  name: string
  birth_date: string
  age_group: "주니어" | "성견" | "시니어"
  weight: number
  breed_id: number | null
  gender: "남아" | "여아" | "중성화"
  medication?: string | null
  allergy_ids?: number[]    // 선택사항 (빈 배열 가능)
  disease_ids?: number[]    // 선택사항 (빈 배열 가능)
}

// PUT /dog/ - 반려견 수정용
export interface DogUpdateRequest {
  name?: string | null
  birth_date?: string | null
  age_group?: "주니어" | "성견" | "시니어" | null
  weight?: number | null
  breed_id?: number | null
  gender?: "남아" | "여아" | "중성화" | null
  medication?: string | null
  allergy_ids: number[]     // 필수 (빈 배열로 전체 제거 가능)
  disease_ids: number[]     // 필수 (빈 배열로 전체 제거 가능)
}

// 기존 DogRegistrationRequest는 호환성을 위해 DogCreateRequest로 변경
export type DogRegistrationRequest = DogCreateRequest

export interface DogRegistrationResponse {
  id: number
  name: string
  birth_date: string
  age_group: "주니어" | "성견" | "시니어"
  weight: number
  gender: "남아" | "여아" | "중성화"
  medication?: string | null
  profile_image_url?: string | null  // 프로필 이미지 URL
  breed_name: string
  allergy_names: string[]
  disease_names: string[]
}

// Food API Types
export interface FoodProduct {
  id: number
  csv_index?: number | null
  product_name: string | null
  brand: string | null
  price: number | null
  url: string | null
  ingredients: string | null
  calorie_content: string | null
  nutrition: {
    protein_pct: number | null
    fat_pct: number | null
    fiber_pct: number | null
    moisture_pct: number | null
    calcium_pct: number | null
    phosphorus_pct: number | null
    sodium_pct: number | null
    omega_6_pct: number | null
    omega_3_pct: number | null
  }
  meta: {
    is_matched: boolean
    can_recommend: boolean
    created_at: string
    updated_at: string
  }
}

export interface FoodProductSummary {
  id: number
  product_name: string
  brand: string
  price: number
  is_matched: boolean
}

export interface PaginationInfo {
  current_page: number
  per_page: number
  total_count: number
  total_pages: number
  has_next: boolean
  has_prev: boolean
}

export interface FoodProductListResponse {
  status: string
  products: FoodProductSummary[]
  pagination: PaginationInfo
}

export interface FoodProductDetailResponse {
  status: string
  product: FoodProduct
}

export interface FoodRecommendation {
  rank: number
  csv_index: number
  product_name: string
  brand: string
  price: number
  protein_pct: number | null
  fat_pct: number | null
  fiber_pct: number | null
  moisture_pct: number | null
  life_stage: string
  calorie_content: string
  ingredients: string
  url: string
  db_product_id: number | null
  product_url: string
  product_image: string | null
  is_matched: boolean
  match_method: string | null
}

export interface PetData {
  weight_kg: number
  age_months: number
  activity_level: string
  is_neutered: boolean
  life_stage: string
  breed_size: string
  allergies: string[]
}

export interface RealtimeData {
  weight_history: Array<{ date: string; weight_kg: number }>
  intake_history: Array<{ date: string; intake_g: number }>
  activity_history: Array<{ date: string; minutes: number }>
  water_history: Array<{ date: string; ml: number }>
}

export interface RecommendationRequest {
  pet_data: PetData
  diseases: string[]
  realtime_data: RealtimeData
}

export interface FoodRecommendationResponse {
  status: string
  dog_id: number
  dog_name: string
  recommendations: {
    recommendation_id: number
    request_conditions: RecommendationRequest
    recommendations: FoodRecommendation[]
    algorithm_version: string
    confidence_score: number
    total_count: number
  }
}

export interface LatestRecommendationResponse {
  status: string
  dog_id: number
  dog_name: string
  has_recommendation: boolean
  recommendation_id?: number
  last_recommended_at?: string
  confidence_score?: number
  total_recommendations?: number
  recommendations?: FoodRecommendation[]
  message?: string
}

// Emergency API functions
export const emergencyApi = {
  // Get emergency guides list
  getGuides: async (): Promise<EmergencyGuide[]> => {
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
    const response = await apiCallWithRetry(`/emergency/hospitals/specialist`, {
      method: 'GET',
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch specialist hospitals')
    }
    
    return response.json()
  },

  // Get hospital detail by ID
  getHospitalDetail: async (hospitalId: number): Promise<HospitalDetail | null> => {
    // 전체 병원 목록에서 ID로 찾기 (백엔드에 별도 엔드포인트가 없으므로)
    const hospitals = await emergencyApi.getAllHospitals()
    const hospital = hospitals.find(h => h.id === hospitalId)
    return hospital || null
  },

  // Create hospital
  createHospital: async (hospitalData: HospitalCreateRequest): Promise<HospitalDetail> => {
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
      console.log('🔐 로그인 API 호출 시작:', credentials.email)
      const response = await apiCall('/user/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      })
      
      console.log('🔐 로그인 API 응답:', {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText
      })
      
      if (response.ok) {
        const user = await response.json()
        console.log('✅ 로그인 성공')
        return { success: true, user }
      } else {
        let errorMessage = '로그인에 실패했습니다.'
        
        try {
          const errorData = await response.json()
          console.log('❌ 로그인 실패 응답:', errorData)
          
          // 다양한 에러 응답 형태 처리
          errorMessage = errorData.detail || 
                        errorData.message || 
                        errorData.error || 
                        `서버 오류 (${response.status})`
        } catch (parseError) {
          console.log('❌ 에러 응답 파싱 실패:', parseError)
          errorMessage = `로그인 실패 (상태: ${response.status})`
        }
        
        return { success: false, error: errorMessage }
      }
    } catch (error) {
      console.error('❌ 로그인 API 네트워크 오류:', error)
      return { success: false, error: '네트워크 연결에 문제가 있습니다. 다시 시도해주세요.' }
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
    

  }
}

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
  },

  // 반려견 등록
  registerDog: async (dogData: DogCreateRequest): Promise<DogRegistrationResponse> => {
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
  updateDog: async (dogData: DogUpdateRequest): Promise<DogRegistrationResponse> => {
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
  deleteDog: async (): Promise<void> => {
    // 실제 백엔드 연결 코드
    const response = await apiCallWithRetry(`/dog/`, {
      method: 'DELETE',
    })
    
    if (!response.ok) {
      throw new Error('Failed to delete dog')
    }
  },

  // 반려견 프로필 이미지 업로드 (첫 업로드)
  uploadDogImage: async (file: File): Promise<{ profile_image_url: string }> => {
    console.log('🖼️ 이미지 업로드 시작:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    })

    // 먼저 반려견 정보가 있는지 확인
    try {
      const dogInfo = await dogApi.getDogInfo()
      if (!dogInfo) {
        throw new Error('반려견 정보를 먼저 등록해주세요.')
      }
      console.log('✅ 반려견 정보 확인됨:', dogInfo.name)
    } catch (error) {
      console.warn('⚠️ 반려견 정보 확인 실패:', error)
      // 반려견 정보가 없어도 이미지 업로드는 시도해보기
    }

    const formData = new FormData()
    formData.append('file', file)
    
    // FormData 내용 로그
    console.log('📦 FormData 내용:')
    for (let [key, value] of formData.entries()) {
      console.log(`  ${key}:`, value instanceof File ? `[File: ${value.name}, ${value.size}bytes]` : value)
    }
    
    const response = await apiCallWithRetry('/dog-image/', {
      method: 'POST',
      body: formData,
      headers: {
        // Content-Type은 브라우저가 자동으로 multipart/form-data; boundary=... 설정
        // 명시적으로 설정하면 boundary가 누락될 수 있으므로 제거
      }
    })
    
    if (!response.ok) {
      console.error('❌ 이미지 업로드 실패:', {
        status: response.status,
        statusText: response.statusText
      })
      
      try {
        const errorData = await response.json()
        console.error('❌ 에러 응답 상세:', errorData)
        throw new Error(errorData.detail || `Upload failed: ${response.status} ${response.statusText}`)
      } catch (parseError) {
        console.error('❌ 에러 응답 파싱 실패:', parseError)
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`)
      }
    }
    
    const result = await response.json()
    console.log('✅ 이미지 업로드 성공:', result)
    return result
  },

  // 반려견 프로필 이미지 교체
  updateDogImage: async (file: File): Promise<{ profile_image_url: string }> => {
    console.log('🔄 이미지 수정 시작:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    })

    const formData = new FormData()
    formData.append('file', file)
    
    // FormData 내용 로그
    console.log('📦 FormData 내용:')
    for (let [key, value] of formData.entries()) {
      console.log(`  ${key}:`, value instanceof File ? `[File: ${value.name}, ${value.size}bytes]` : value)
    }
    
    const response = await apiCallWithRetry('/dog-image/', {
      method: 'PUT',
      body: formData,
      headers: {
        // multipart/form-data 헤더를 명시적으로 설정하지 않음 (브라우저가 boundary 포함해서 자동 설정)
        // 'Content-Type': 'multipart/form-data' // 이렇게 설정하면 boundary가 누락되어 오히려 문제가 됨
      }
    })
    
    if (!response.ok) {
      console.error('❌ 이미지 수정 실패:', {
        status: response.status,
        statusText: response.statusText
      })
      
      try {
        const errorData = await response.json()
        console.error('❌ 에러 응답 상세:', errorData)
        throw new Error(errorData.detail || `Update failed: ${response.status} ${response.statusText}`)
      } catch (parseError) {
        console.error('❌ 에러 응답 파싱 실패:', parseError)
        throw new Error(`Update failed: ${response.status} ${response.statusText}`)
      }
    }
    
    const result = await response.json()
    console.log('✅ 이미지 수정 성공:', result)
    return result
  },

  // 반려견 프로필 이미지 URL 조회
  getDogImageUrl: async (): Promise<{ profile_image_url: string | null }> => {
    const response = await apiCallWithRetry('/dog-image/', {
      method: 'GET',
    })
    
    if (!response.ok) {
      throw new Error('Failed to get dog image URL')
    }
    
    return response.json()
  },

  // 반려견 프로필 이미지 삭제
  deleteDogImage: async (): Promise<void> => {
    console.log('🗑️ 이미지 삭제 API 호출 시작')
    
    const response = await apiCallWithRetry('/dog-image/', {
      method: 'DELETE',
    })
    
    if (!response.ok) {
      console.error('❌ 이미지 삭제 실패:', {
        status: response.status,
        statusText: response.statusText
      })
      
      try {
        const errorData = await response.json()
        console.error('❌ 삭제 에러 응답 상세:', errorData)
        throw new Error(errorData.detail || `Delete failed: ${response.status} ${response.statusText}`)
      } catch (parseError) {
        console.error('❌ 삭제 에러 응답 파싱 실패:', parseError)
        throw new Error(`Delete failed: ${response.status} ${response.statusText}`)
      }
    }
    
    console.log('✅ 이미지 삭제 API 성공')
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

// API Base URL configuration - 환경변수로 관리
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
console.log('API_BASE_URL:', API_BASE_URL)

if (!API_BASE_URL) {
  console.error('⚠️ NEXT_PUBLIC_API_BASE_URL 환경변수가 설정되지 않았습니다!')
}

// 토큰 갱신 상태 관리
let isRefreshing = false
let refreshPromise: Promise<boolean> | null = null

// 선제적 토큰 갱신 (25분마다 실행 - 30분 만료 5분 전)
const startTokenRefreshTimer = () => {
  if (typeof window === 'undefined') return
  
  const REFRESH_INTERVAL = 25 * 60 * 1000 // 25분
  
  setInterval(async () => {
    try {
      console.log('선제적 토큰 갱신 시도...')
      const response = await fetch(`${API_BASE_URL}/user/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        console.log('선제적 토큰 갱신 성공')
      } else {
        console.log('선제적 토큰 갱신 실패, 다음 API 호출 시 재시도')
      }
    } catch (error) {
      console.error('선제적 토큰 갱신 오류:', error)
    }
  }, REFRESH_INTERVAL)
}

// 브라우저 환경에서만 타이머 시작
if (typeof window !== 'undefined') {
  startTokenRefreshTimer()
}

// Development mode toggle - set to false for production


// Helper function to get auth headers (쿠키 기반 인증으로 변경)
const getAuthHeaders = () => {
  return {
    'Content-Type': 'application/json'
  }
}

// Cookie-based fetch wrapper
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  console.log(`🔥 API 호출: ${API_BASE_URL}${endpoint}`, {
    method: options.method || 'GET',
    headers: options.headers,
    body: options.body instanceof FormData ? '[FormData]' : options.body,
    credentials: 'include'
  })
  
  // FormData인 경우 Content-Type을 설정하지 않음 (브라우저가 자동 설정)
  const isFormData = options.body instanceof FormData
  
  const headers: HeadersInit = isFormData 
    ? { 
        ...options.headers,
        // FormData일 때는 Content-Type 없음
      } 
    : {
        'Content-Type': 'application/json',
        ...options.headers,
      }
  
  // 쿠키 확인
  if (typeof window !== 'undefined') {
    console.log('🍪 현재 쿠키:', document.cookie)
  }
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    credentials: 'include', // 🔥 중요: 쿠키 자동 포함 (CORS 설정 필요)
    mode: 'cors', // CORS 모드 명시적 설정
    headers,
    ...options,
  })

  // 응답 로그
  console.log(`📡 API 응답: ${endpoint}`, {
    status: response.status,
    ok: response.ok,
    statusText: response.statusText,
    headers: Object.fromEntries(response.headers.entries())
  })

  // 에러 응답일 때 상세 정보 로그
  if (!response.ok) {
    try {
      const errorBody = await response.clone().text()
      console.error(`❌ API 에러 상세: ${endpoint}`, {
        status: response.status,
        statusText: response.statusText,
        body: errorBody,
        headers: Object.fromEntries(response.headers.entries())
      })
    } catch (e) {
      console.error(`❌ API 에러 (응답 파싱 실패): ${endpoint}`, {
        status: response.status,
        statusText: response.statusText
      })
    }
  }

  return response
}

// API call with automatic token refresh (중복 갱신 방지)
const apiCallWithRetry = async (endpoint: string, options: RequestInit = {}): Promise<Response> => {
  let response = await apiCall(endpoint, options)
  
  // 401 에러 시 토큰 갱신 시도
  if (response.status === 401) {
    console.log('Access token 만료, refresh token으로 갱신 시도...')
    
    // 이미 갱신 중이면 기존 Promise 기다리기 (중복 방지)
    if (isRefreshing) {
      console.log('이미 토큰 갱신 중... 기다리는 중')
      if (refreshPromise) {
        const success = await refreshPromise
        if (success) {
          // 갱신 성공, 원래 요청 재시도
          return apiCall(endpoint, options)
        } else {
          throw new Error('Token refresh failed')
        }
      }
    }
    
    // 새로운 갱신 시작
    isRefreshing = true
    refreshPromise = (async () => {
      try {
        const refreshResponse = await apiCall('/user/refresh', {
          method: 'POST',
        })
        
        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json()
          console.log('토큰 갱신 성공')
          return true
        } else {
          console.log('Refresh token도 만료됨, 로그인 필요')
          handleAuthenticationFailure()
          return false
        }
      } catch (error) {
        console.error('토큰 갱신 중 오류:', error)
        handleAuthenticationFailure()
        return false
      } finally {
        isRefreshing = false
        refreshPromise = null
      }
    })()
    
    const success = await refreshPromise
    if (success) {
      // 토큰 갱신 성공, 원래 요청 재시도
      response = await apiCall(endpoint, options)
    } else {
      throw new Error('Authentication failed')
    }
  }
  
  return response
}

// 인증 실패 시 처리 함수
const handleAuthenticationFailure = () => {
  if (typeof window !== 'undefined') {
    
    // 사용자에게 알림
    alert('로그인이 만료되었습니다. 다시 로그인해주세요.')
    
    // 로그인 페이지로 리다이렉트
    window.location.href = '/login'
  }
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