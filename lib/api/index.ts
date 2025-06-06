import { ApiResponse } from '../types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || ''

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json()
  
  if (!response.ok) {
    throw new ApiError(response.status, data.error || '알 수 없는 오류가 발생했습니다.')
  }
  
  return data
}

export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })
    
    return handleResponse<ApiResponse<T>>(response)
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError(500, '서버와의 통신 중 오류가 발생했습니다.')
  }
}

// Food 관련 API 함수들
export const foodApi = {
  getFood: (slug: string) => fetchApi(`/api/foods/${slug}`),
  getFoodList: () => fetchApi('/api/foods'),
  searchFoods: (query: string) => fetchApi(`/api/foods/search?q=${query}`),
}

// Health Record 관련 API 함수들
export const healthRecordApi = {
  getRecords: (petId: string) => fetchApi(`/api/health-records/${petId}`),
  createRecord: (data: Partial<HealthRecord>) => 
    fetchApi('/api/health-records', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateRecord: (id: string, data: Partial<HealthRecord>) =>
    fetchApi(`/api/health-records/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
}

// User 관련 API 함수들
export const userApi = {
  getCurrentUser: () => fetchApi('/api/user'),
  updateUser: (data: Partial<User>) =>
    fetchApi('/api/user', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
}

// Pet 관련 API 함수들
export const petApi = {
  getPet: (id: string) => fetchApi(`/api/pets/${id}`),
  updatePet: (id: string, data: Partial<Pet>) =>
    fetchApi(`/api/pets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
}

// Health Check 관련 API 함수들
export const healthCheckApi = {
  getDailyCheck: (petId: string, date: string) => 
    fetchApi(`/api/health/${petId}/daily?date=${date}`),
  
  createDailyCheck: (petId: string, data: HealthCheckFormData) => 
    fetchApi(`/api/health/${petId}/daily`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  getHealthHistory: (petId: string, startDate: string, endDate: string) =>
    fetchApi(`/api/health/${petId}/history?startDate=${startDate}&endDate=${endDate}`),
}

// Walk Record 관련 API 함수들
export const walkApi = {
  createWalk: (petId: string, data: WalkFormData) => 
    fetchApi(`/api/health/walks`, {
      method: 'POST',
      body: JSON.stringify({
        petId,
        ...data,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().split(' ')[0].slice(0, 5)
      }),
    }),
} 