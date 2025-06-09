import { ApiResponse, HealthRecord, User, Pet, HealthCheckFormData, WalkFormData } from '../types/index'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.yoon.today'

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

// Food 관련 API 함수들 - 백엔드 API 명세서에 맞게 구현
export const foodApi = {
  // 사료 전체 조회 (페이지네이션)
  getProducts: async (params?: {
    page?: number
    limit?: number
    search?: string
  }) => {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.search) queryParams.append('search', params.search)
    
    const url = `/food/products${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch products')
    }
    
    return response.json()
  },

  // 사료 상세 조회
  getProductDetail: async (productId: number) => {
    const response = await fetch(`${API_BASE_URL}/food/products/${productId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('제품을 찾을 수 없습니다.')
      }
      throw new Error(`Failed to fetch product detail: ${response.status}`)
    }
    
    return response.json()
  },

  // 새로운 사료 추천 생성
  getNewRecommendation: async () => {
    const response = await fetch(`${API_BASE_URL}/food/recommend-current`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // 쿠키 기반 인증
    })
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('로그인이 필요합니다.')
      }
      if (response.status === 404) {
        throw new Error('반려견 정보를 찾을 수 없습니다.')
      }
      throw new Error('Failed to get recommendation')
    }
    
    return response.json()
  },

  // 최신 추천 기록 조회
  getLatestRecommendation: async () => {
    const response = await fetch(`${API_BASE_URL}/food/recommendations/latest`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // 쿠키 기반 인증
    })
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('로그인이 필요합니다.')
      }
      if (response.status === 404) {
        throw new Error('반려견 정보를 찾을 수 없습니다.')
      }
      throw new Error('Failed to get latest recommendation')
    }
    
    return response.json()
  },

  // 기존 호환성을 위한 함수들 (deprecated)
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

// Chatbot 관련 API 함수들
export const chatbotApi = {
  // 대화방 목록 조회
  getRooms: async () => {
    const response = await fetch(`${API_BASE_URL}/chatbot/rooms`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('로그인이 필요합니다.')
      }
      throw new Error('Failed to fetch chat rooms')
    }
    
    return response.json()
  },

  // 새 대화방 생성
  createRoom: async (title?: string) => {
    const response = await fetch(`${API_BASE_URL}/chatbot/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(title ? { title } : {}),
    })
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('로그인이 필요합니다.')
      }
      throw new Error('Failed to create chat room')
    }
    
    return response.json()
  },

  // 대화방 삭제
  deleteRoom: async (roomId: string) => {
    const response = await fetch(`${API_BASE_URL}/chatbot/rooms/${roomId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('로그인이 필요합니다.')
      }
      if (response.status === 404) {
        throw new Error('대화방을 찾을 수 없습니다.')
      }
      throw new Error('Failed to delete chat room')
    }
    
    return response.json()
  },

  // 대화 히스토리 조회
  getMessages: async (roomId: string) => {
    const response = await fetch(`${API_BASE_URL}/chatbot/rooms/${roomId}/messages`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('로그인이 필요합니다.')
      }
      if (response.status === 404) {
        throw new Error('대화방을 찾을 수 없습니다.')
      }
      throw new Error('Failed to fetch messages')
    }
    
    return response.json()
  },

  // 첫 메시지 전송 (대화 시작)
  sendFirstMessage: async (roomId: string, content: string) => {
    const response = await fetch(`${API_BASE_URL}/chatbot/rooms/${roomId}/messages/first`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ content }),
    })
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('로그인이 필요합니다.')
      }
      if (response.status === 404) {
        throw new Error('대화방을 찾을 수 없습니다.')
      }
      throw new Error('Failed to send first message')
    }
    
    return response.json()
  },

  // 일반 메시지 전송
  sendMessage: async (roomId: string, content: string) => {
    const response = await fetch(`${API_BASE_URL}/chatbot/rooms/${roomId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ content }),
    })
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('로그인이 필요합니다.')
      }
      if (response.status === 404) {
        throw new Error('대화방을 찾을 수 없습니다.')
      }
      throw new Error('Failed to send message')
    }
    
    return response.json()
  },

  // 챗봇 헬스체크
  healthCheck: async () => {
    const response = await fetch(`${API_BASE_URL}/chatbot/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error('Chatbot service is not healthy')
    }
    
    return response.json()
  },
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