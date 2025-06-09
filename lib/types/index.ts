// 공통 타입 정의
export interface User {
  id: string
  name: string
  email: string
  petName?: string
  createdAt: string
  updatedAt: string
}

export interface Pet {
  id: string
  name: string
  breed: string
  birthDate: string
  weight: number
  allergies: string[]
  userId: string
}

export interface FoodData {
  id: string
  name: string
  image: string
  ingredients: Ingredient[]
  nutrition: NutritionInfo[]
  description: string
  price: string
  weight: string
  hasAllergy: boolean
  slug: string
}

export interface Ingredient {
  name: string
  isAllergen: boolean
}

export interface NutritionInfo {
  name: string
  value: string
}

export interface HealthRecord {
  id: string
  petId: string
  date: string
  weight: number
  symptoms: string[]
  notes: string
  createdAt: string
  updatedAt: string
}

export interface HealthCheck {
  id: string
  petId: string
  date: string
  items: HealthCheckItem[]
  createdAt: string
  updatedAt: string
}

export interface HealthCheckItem {
  checked: boolean
  value: string | number
  status?: "normal" | "warning" | "danger"
}

export interface HealthCheckFormData {
  items: {
    poop: HealthCheckItem
    pee: HealthCheckItem
    sleep: HealthCheckItem
    temperature: HealthCheckItem
    appetite: HealthCheckItem
    water: HealthCheckItem
    activity: HealthCheckItem
    mood: HealthCheckItem
    skin: HealthCheckItem
    eye: HealthCheckItem
    ear: HealthCheckItem
    nose: HealthCheckItem
    mouth: HealthCheckItem
    vomit: HealthCheckItem
    cough: HealthCheckItem
    medicine: HealthCheckItem
  }
  memo: string
}

export interface WalkRecord {
  id: string
  petId: string
  date: string
  time: string
  distance: number  // km
  duration: number  // minutes
  createdAt: string
  updatedAt: string
}

export interface WalkFormData {
  distance: number
  duration: number
}

export interface ApiResponse<T> {
  data: T
  error?: string
  message?: string
}

// Chatbot 관련 타입 정의
export interface ChatRoom {
  id: string
  user_id: number
  title: string
  created_at: string
  updated_at: string
  deleted_at: string | null
}

// 대화방 목록 조회시 사용되는 타입 (last_message 포함)
export interface ChatRoomResponse extends ChatRoom {
  last_message?: string
}

export interface ChatMessage {
  id: string
  content: string
  role: 'user' | 'assistant'
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface DogInfo {
  name: string
  breed: string
  age: number  // number로 변경
  weight: number
  gender: string
  diseases: string[]
  allergies: string[]
}

// 대화 히스토리 조회시 사용되는 타입
export interface ChatHistoryResponse {
  messages: ChatMessage[]
  dog_info: DogInfo | null  // null일 수 있음
}

// 기존 호환성을 위한 타입 (deprecated)
export interface ChatHistory {
  messages: ChatMessage[]
  dog_info: DogInfo
}

export interface FirstMessageResponse {
  message: ChatMessage
  title: string
}

export interface ChatbotHealth {
  status: string
  service: string
}

// 대화 상태 관리 타입
export type ChatState = 'initial' | 'waiting_for_additional'

// 대화방 생성 요청 타입
export interface ChatRoomCreateRequest {
  title?: string
}

// 메시지 생성 요청 타입
export interface ChatMessageCreateRequest {
  content: string
}

// 대화방 삭제 응답 타입
export interface ChatRoomDeleteResponse {
  message: string
  room_id: string
} 