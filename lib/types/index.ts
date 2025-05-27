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

export interface ApiResponse<T> {
  data: T
  error?: string
  message?: string
} 