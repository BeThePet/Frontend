import { useState, useEffect } from 'react'
import { ApiError } from '@/lib/api'
import { ApiResponse } from '@/lib/types'

interface UseApiState<T> {
  data: T | null
  error: string | null
  isLoading: boolean
}

interface UseApiOptions {
  immediate?: boolean
}

export function useApi<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  options: UseApiOptions = { immediate: true }
) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    error: null,
    isLoading: false,
  })

  const execute = async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      const response = await apiCall()
      setState({
        data: response.data,
        error: null,
        isLoading: false,
      })
      return response.data
    } catch (error) {
      const errorMessage = error instanceof ApiError
        ? error.message
        : '알 수 없는 오류가 발생했습니다.'
      
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }))
      throw error
    }
  }

  useEffect(() => {
    if (options.immediate) {
      execute()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return {
    ...state,
    execute,
  }
} 