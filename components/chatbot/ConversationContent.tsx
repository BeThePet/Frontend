"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Send, MapPin, Bot, User, Clock } from "lucide-react"
import { useChatbot } from "@/hooks/useChatbot"
import { Loading } from "@/components/ui/loading"
import { ChatMessage } from "@/lib/types"

export default function ConversationContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const roomId = searchParams.get('roomId')

  const {
    currentRoom,
    messages,
    dogInfo,
    isLoading,
    isSending,
    error,
    chatState,
    selectRoom,
    sendMessage,
    sendFirstMessage,
    setError
  } = useChatbot()

  const [inputMessage, setInputMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // 메시지 목록 자동 스크롤
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // roomId가 변경되거나 초기 로드 시 대화방 선택
  useEffect(() => {
    if (roomId && currentRoom?.id !== roomId) {
      // 임시 방 객체를 생성하여 selectRoom 호출
      const tempRoom = {
        id: roomId,
        user_id: 0,
        title: "",
        created_at: "",
        updated_at: "",
        deleted_at: null
      }
      selectRoom(tempRoom)
    }
  }, [roomId, currentRoom?.id, selectRoom])

  // roomId가 없으면 메인 페이지로 리다이렉트
  useEffect(() => {
    if (!roomId) {
      router.push('/chatbot')
    }
  }, [roomId, router])

  const handleSendMessage = async () => {
    if (!roomId || !inputMessage.trim() || isSending) return

    const messageContent = inputMessage.trim()
    setInputMessage("")

    try {
      if (messages.length === 0) {
        // 첫 메시지인 경우
        await sendFirstMessage(roomId, messageContent)
      } else {
        // 일반 메시지인 경우
        await sendMessage(roomId, messageContent)
      }
      
      // 입력창에 포커스 유지
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    } catch (error) {
      // 에러 발생 시 입력값 복원
      setInputMessage(messageContent)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!roomId) {
    return <Loading />
  }

  if (isLoading && !currentRoom) {
    return (
      <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center">
        <Loading />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFF8F0] flex flex-col">
      {/* 헤더 */}
      <div className="bg-[#FBD6E4] p-4 flex items-center shadow-sm">
        <Link href="/chatbot" className="text-gray-800 hover:text-gray-600">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div className="ml-4 flex-1">
          <h1 className="text-lg font-bold text-gray-800">
            {currentRoom?.title || "멍멍 상담사와의 대화"}
          </h1>
          {dogInfo && (
            <p className="text-sm text-gray-600">
              {dogInfo.name} ({dogInfo.breed}, {dogInfo.age})
            </p>
          )}
        </div>
        {isSending && (
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="w-4 h-4 mr-1 animate-pulse" />
            답변 중...
          </div>
        )}
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setError(null)}
            className="ml-2 text-red-700 hover:text-red-800"
          >
            ✕
          </Button>
        </div>
      )}

      {/* 메시지 영역 */}
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <Bot className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">안녕하세요! 멍멍 상담사입니다</p>
            <p className="text-sm text-gray-400">반려견의 증상이나 궁금한 점을 말씀해주세요</p>
          </div>
        ) : (
          <div className="space-y-4 max-w-4xl mx-auto">
            {messages.map((message, index) => (
              <MessageBubble
                key={message.id}
                message={message}
                isConsecutive={
                  index > 0 && 
                  messages[index - 1].role === message.role &&
                  new Date(message.created_at).getTime() - new Date(messages[index - 1].created_at).getTime() < 60000
                }
              />
            ))}
            
            {/* 로딩 상태 표시 */}
            {isSending && (
              <div className="flex justify-start">
                <div className="flex items-center bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
                  <Bot className="w-5 h-5 text-[#FBD6E4] mr-2" />
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* 입력 영역 */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto">
          {/* 대화 상태 안내 메시지 */}
          {chatState === 'waiting_for_additional' && (
            <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                💡 <strong>추가 증상이나 상태를 알려주세요!</strong>
              </p>
              <p className="text-xs text-blue-600 mt-1">
                더 정확한 진단을 위해 추가 증상이나 행동 변화를 설명해주세요. 없으시면 '없음'이라고 입력해주세요.
              </p>
            </div>
          )}
          
          <div className="relative">
            <Input
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                chatState === 'waiting_for_additional'
                  ? "추가 증상을 설명해주세요 (없으면 '없음'이라고 입력)"
                  : messages.length === 0 
                    ? "증상을 자세히 설명해주세요" 
                    : "추가 정보나 질문을 입력하세요"
              }
              className="pr-12 rounded-full border-gray-300 py-3"
              disabled={isSending}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isSending}
              size="icon"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-full bg-[#FBD6E4] hover:bg-[#f5c0d5] disabled:opacity-50"
            >
              <Send className="w-4 h-4 text-gray-800" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function MessageBubble({ 
  message, 
  isConsecutive 
}: { 
  message: ChatMessage
  isConsecutive: boolean 
}) {
  const isUser = message.role === 'user'
  
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }

  // 동물병원 찾기 함수
  const handleFindHospital = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          // 현재 위치 기반 구글 지도 검색
          window.open(`https://www.google.com/maps/search/동물병원/@${latitude},${longitude},15z`, '_blank')
        },
        (error) => {
          console.log('위치 정보를 가져올 수 없습니다:', error)
          // 위치 정보가 없을 때 기본 검색
          window.open('https://www.google.com/maps/search/동물병원+near+me', '_blank')
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 300000 // 5분간 캐시
        }
      )
    } else {
      // Geolocation을 지원하지 않는 경우 기본 검색
      window.open('https://www.google.com/maps/search/동물병원+near+me', '_blank')
    }
  }

  const parseAIMessage = (content: string) => {
    // AI 메시지의 마크다운 스타일 파싱
    const lines = content.split('\n')
    const parsed = []
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      
      if (line.startsWith('**') && line.endsWith('**')) {
        // 볼드 텍스트
        parsed.push({
          type: 'heading',
          content: line.slice(2, -2)
        })
      } else if (line.startsWith('- ')) {
        // 리스트 아이템
        parsed.push({
          type: 'list',
          content: line.slice(2)
        })
      } else if (line.startsWith('🔍') || line.startsWith('💬') || line.startsWith('💡')) {
        // 이모지로 시작하는 섹션
        parsed.push({
          type: 'section',
          content: line
        })
      } else if (line.trim()) {
        // 일반 텍스트
        parsed.push({
          type: 'text',
          content: line
        })
      }
    }
    
    return parsed
  }
  
  const parsedContent = isUser ? null : parseAIMessage(message.content)

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[80%] ${isUser ? "order-2" : "order-1"}`}>
        {/* 아바타 및 시간 */}
        {!isConsecutive && (
          <div className={`flex items-center mb-1 ${isUser ? "justify-end" : "justify-start"}`}>
            {!isUser && <Bot className="w-4 h-4 text-[#FBD6E4] mr-2" />}
            <span className="text-xs text-gray-500">
              {formatTimestamp(message.created_at)}
            </span>
            {isUser && <User className="w-4 h-4 text-gray-500 ml-2" />}
          </div>
        )}
        
        {/* 메시지 버블 */}
        <div
          className={`rounded-2xl p-4 shadow-sm ${
            isUser 
              ? "bg-[#FBD6E4] text-gray-800" 
              : "bg-white border border-gray-200 text-gray-700"
          } ${isConsecutive ? "mt-1" : ""}`}
        >
          {isUser ? (
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="space-y-2">
              {parsedContent?.map((item, index) => (
                <div key={index}>
                  {item.type === 'heading' && (
                    <h4 className="font-semibold text-gray-800 text-sm">{item.content}</h4>
                  )}
                  {item.type === 'section' && (
                    <p className="font-medium text-gray-800 text-sm">{item.content}</p>
                  )}
                  {item.type === 'list' && (
                    <p className="text-sm text-gray-600 ml-4">• {item.content}</p>
                  )}
                  {item.type === 'text' && (
                    <p className="text-sm text-gray-600">{item.content}</p>
                  )}
                </div>
              )) || (
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              )}
              
              {/* 병원 찾기 버튼 (특정 키워드가 포함된 경우) */}
              {(message.content.includes('수의사') || 
                message.content.includes('병원') || 
                message.content.includes('권장사항') ||
                message.content.includes('상담')) && (
                <Button
                  variant="outline"
                  onClick={handleFindHospital}
                  className="w-full mt-3 rounded-lg border-[#D6ECFA] text-gray-700 flex items-center justify-center gap-2 text-sm hover:bg-blue-50 transition-colors"
                >
                  <MapPin className="w-4 h-4" />
                  <span>가까운 동물병원 찾기</span>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 