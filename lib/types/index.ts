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