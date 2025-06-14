import { useState, useCallback, useRef } from 'react'
import { chatbotApi } from '@/lib/api'
import { 
  ChatRoom, 
  ChatRoomResponse, 
  ChatMessage, 
  ChatHistoryResponse, 
  FirstMessageResponse, 
  DogInfo,
  ChatState
} from '@/lib/types'

interface UseChatbotState {
  rooms: ChatRoomResponse[]  // 목록 조회시에는 last_message가 포함된 타입
  currentRoom: ChatRoom | null
  messages: ChatMessage[]
  dogInfo: DogInfo | null
  isLoading: boolean
  isSending: boolean
  error: string | null
  chatState: ChatState  // 대화 상태 추가
}

export function useChatbot() {
  const [state, setState] = useState<UseChatbotState>({
    rooms: [],
    currentRoom: null,
    messages: [],
    dogInfo: null,
    isLoading: false,
    isSending: false,
    error: null,
    chatState: 'initial',  // 초기 상태
  })

  const sendingRef = useRef(false) // 중복 요청 방지

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }))
  }, [])

  // 대화 상태 판단 함수
  const determineChatState = useCallback((assistantMessage: string): ChatState => {
    // AI 응답에 "추가 증상이나 상태가 있나요?" 문구가 있으면 추가 증상 대기 상태
    if (assistantMessage.includes('추가 증상이나 상태가 있나요?')) {
      return 'waiting_for_additional'
    }
    return 'initial'
  }, [])

  // 대화방 목록 조회
  const fetchRooms = useCallback(async () => {
    // 현재 상태를 내부에서 확인하여 의존성 제거
    let shouldFetch = false
    setState(prev => {
      if (prev.isLoading) {
        return prev // 이미 로딩 중이면 상태 변경하지 않음
      }
      shouldFetch = true
      return { ...prev, isLoading: true, error: null }
    })

    if (!shouldFetch) return
    
    try {
      const rooms: ChatRoomResponse[] = await chatbotApi.getRooms()
      setState(prev => ({ ...prev, rooms, isLoading: false }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : '대화방을 불러오는 중 오류가 발생했습니다.',
        isLoading: false
      }))
    }
  }, []) // 의존성 제거

  // 새 대화방 생성
  const createRoom = useCallback(async (title?: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      const newRoom: ChatRoom = await chatbotApi.createRoom(title)
      // 새 방은 last_message가 없으므로 ChatRoomResponse 형태로 변환
      const newRoomResponse: ChatRoomResponse = { ...newRoom }
      setState(prev => ({ 
        ...prev, 
        rooms: [newRoomResponse, ...prev.rooms],
        currentRoom: newRoom,
        isLoading: false
      }))
      return newRoom
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '대화방 생성 중 오류가 발생했습니다.'
      setState(prev => ({ ...prev, error: errorMessage, isLoading: false }))
      throw error
    }
  }, [])

  // 대화방 삭제
  const deleteRoom = useCallback(async (roomId: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      await chatbotApi.deleteRoom(roomId)
      setState(prev => ({
        ...prev,
        rooms: prev.rooms.filter(room => room.id !== roomId),
        currentRoom: prev.currentRoom?.id === roomId ? null : prev.currentRoom,
        messages: prev.currentRoom?.id === roomId ? [] : prev.messages,
        chatState: prev.currentRoom?.id === roomId ? 'initial' : prev.chatState,
        isLoading: false
      }))
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '대화방 삭제 중 오류가 발생했습니다.'
      setState(prev => ({ ...prev, error: errorMessage, isLoading: false }))
      throw error
    }
  }, [])

  // 대화방 선택 및 메시지 조회
  const selectRoom = useCallback(async (room: ChatRoom | ChatRoomResponse) => {
    // 현재 상태를 함수 내부에서 확인하여 의존성 제거
    setState(prev => {
      if (prev.currentRoom?.id === room.id) {
        return prev // 이미 같은 방이면 상태 변경하지 않음
      }
      
      // 로딩 시작
      return { ...prev, isLoading: true, error: null }
    })
    
    try {
      const chatHistory: ChatHistoryResponse = await chatbotApi.getMessages(room.id)
      
      // 마지막 AI 메시지를 기반으로 대화 상태 결정
      const lastAssistantMessage = chatHistory.messages
        .filter(msg => msg.role === 'assistant')
        .pop()
      
      const chatState = lastAssistantMessage 
        ? determineChatState(lastAssistantMessage.content)
        : 'initial'

      setState(prev => ({
        ...prev,
        currentRoom: room,
        messages: chatHistory.messages,
        dogInfo: chatHistory.dog_info,
        chatState,
        isLoading: false
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : '메시지를 불러오는 중 오류가 발생했습니다.',
        isLoading: false
      }))
    }
  }, [determineChatState]) // 의존성 대폭 축소

  // 사용자 메시지를 즉시 UI에 추가 (실시간 느낌)
  const addUserMessage = useCallback((content: string) => {
    const userMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      content,
      role: 'user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null
    }

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage]
    }))

    return userMessage.id
  }, [])

  // 임시 메시지를 실제 메시지로 교체
  const replaceMessage = useCallback((tempId: string, realMessage: ChatMessage) => {
    setState(prev => ({
      ...prev,
      messages: prev.messages.map(msg => 
        msg.id === tempId ? realMessage : msg
      )
    }))
  }, [])

  // AI 응답을 UI에 추가
  const addAssistantMessage = useCallback((message: ChatMessage) => {
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, message]
    }))
  }, [])

  // 첫 메시지 전송
  const sendFirstMessage = useCallback(async (roomId: string, content: string) => {
    if (sendingRef.current || !content.trim()) return

    setState(prev => ({ ...prev, isSending: true, error: null }))
    sendingRef.current = true

    // 사용자 메시지를 즉시 UI에 추가
    const tempMessageId = addUserMessage(content)
    
    try {
      const response: FirstMessageResponse = await chatbotApi.sendFirstMessage(roomId, content.trim())
      
      // 대화 상태 결정
      const newChatState = determineChatState(response.message.content)
      
      // 대화방 제목 업데이트 및 대화 상태 업데이트
      setState(prev => ({
        ...prev,
        currentRoom: prev.currentRoom ? {
          ...prev.currentRoom,
          title: response.title
        } : null,
        rooms: prev.rooms.map(room => 
          room.id === roomId ? { ...room, title: response.title } : room
        ),
        chatState: newChatState,
        isSending: false
      }))

      // AI 응답 추가
      addAssistantMessage(response.message)
      
    } catch (error) {
      // 오류 시 사용자 메시지 제거
      const errorMessage = error instanceof Error ? error.message : '메시지 전송 중 오류가 발생했습니다.'
      setState(prev => ({
        ...prev,
        messages: prev.messages.filter(msg => msg.id !== tempMessageId),
        error: errorMessage,
        isSending: false
      }))
      throw error
    } finally {
      sendingRef.current = false
    }
  }, [addUserMessage, addAssistantMessage, determineChatState])

  // 일반 메시지 전송
  const sendMessage = useCallback(async (roomId: string, content: string) => {
    if (sendingRef.current || !content.trim()) return

    setState(prev => ({ ...prev, isSending: true, error: null }))
    sendingRef.current = true

    // 사용자 메시지를 즉시 UI에 추가
    const tempMessageId = addUserMessage(content)
    
    try {
      const aiMessage: ChatMessage = await chatbotApi.sendMessage(roomId, content.trim())
      
      // 대화 상태 결정
      const newChatState = determineChatState(aiMessage.content)
      
      // 대화 상태 업데이트
      setState(prev => ({
        ...prev,
        chatState: newChatState,
        isSending: false
      }))
      
      // AI 응답 추가
      addAssistantMessage(aiMessage)
      
    } catch (error) {
      // 오류 시 사용자 메시지 제거
      const errorMessage = error instanceof Error ? error.message : '메시지 전송 중 오류가 발생했습니다.'
      setState(prev => ({
        ...prev,
        messages: prev.messages.filter(msg => msg.id !== tempMessageId),
        error: errorMessage,
        isSending: false
      }))
      throw error
    } finally {
      sendingRef.current = false
    }
  }, [addUserMessage, addAssistantMessage, determineChatState])

  // 새 대화 시작 헬퍼
  const startNewConversation = useCallback(async (initialMessage: string) => {
    try {
      const newRoom = await createRoom()
      await sendFirstMessage(newRoom.id, initialMessage)
      return newRoom
    } catch (error) {
      throw error
    }
  }, [createRoom, sendFirstMessage])

  return {
    // State
    rooms: state.rooms,
    currentRoom: state.currentRoom,
    messages: state.messages,
    dogInfo: state.dogInfo,
    isLoading: state.isLoading,
    isSending: state.isSending,
    error: state.error,
    chatState: state.chatState,

    // Actions
    fetchRooms,
    createRoom,
    deleteRoom,
    selectRoom,
    sendFirstMessage,
    sendMessage,
    startNewConversation,
    setError,
  }
} 