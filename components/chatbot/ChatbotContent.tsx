"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useChatbot } from "@/hooks/useChatbot"
import { Loading } from "@/components/ui/loading"
import { Plus, MessageCircle, Trash2, Send } from "lucide-react"
import { ChatRoomResponse } from "@/lib/types"

export default function ChatbotContent() {
  const router = useRouter()
  const {
    rooms,
    isLoading,
    isSending,
    error,
    fetchRooms,
    deleteRoom,
    startNewConversation,
    setError
  } = useChatbot()

  const [newMessageInput, setNewMessageInput] = useState("")
  const [showNewChatInput, setShowNewChatInput] = useState(false)

  useEffect(() => {
    fetchRooms()
  }, [fetchRooms])

  const handleRoomSelect = (room: ChatRoomResponse) => {
    // 대화방 ID를 쿼리 파라미터로 전달하여 대화 페이지로 이동
    router.push(`/chatbot/conversation?roomId=${room.id}`)
  }

  const handleDeleteRoom = async (e: React.MouseEvent, roomId: string) => {
    e.stopPropagation() // 카드 클릭 이벤트 방지
    
    if (confirm('이 대화방을 삭제하시겠습니까?')) {
      try {
        await deleteRoom(roomId)
      } catch (error) {
        // 에러는 hook에서 처리됨
      }
    }
  }

  const handleStartNewConversation = async () => {
    if (!newMessageInput.trim() || isSending) return

    try {
      const room = await startNewConversation(newMessageInput.trim())
      setNewMessageInput("")
      setShowNewChatInput(false)
      router.push(`/chatbot/conversation?roomId=${room.id}`)
    } catch (error) {
      // 에러는 hook에서 처리됨
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleStartNewConversation()
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return date.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit'
      })
    } else if (diffDays === 1) {
      return '어제'
    } else if (diffDays < 7) {
      return `${diffDays}일 전`
    } else {
      return date.toLocaleDateString('ko-KR', {
        month: 'long',
        day: 'numeric'
      })
    }
  }

  if (isLoading && rooms.length === 0) {
    return <Loading />
  }

  return (
    <div className="min-h-screen bg-[#FFF8F0] p-4">
      {/* 헤더 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">멍멍 상담사</h1>
        <p className="text-gray-600">반려견의 건강과 관련된 상담을 도와드립니다.</p>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
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

      {/* 새 대화 시작 */}
      <Card className="mb-6 border-[#FFE5B4] bg-gradient-to-r from-[#FFF8F0] to-[#FFEBCC]">
        <CardContent className="p-4">
          {!showNewChatInput ? (
            <Button
              onClick={() => setShowNewChatInput(true)}
              className="w-full bg-[#FBD6E4] text-gray-800 hover:bg-[#f5c0d5] border-0"
              disabled={isSending}
            >
              <Plus className="w-4 h-4 mr-2" />
              새로운 상담 시작하기
            </Button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-700 font-medium">어떤 것이 궁금하신가요?</p>
              <div className="relative">
                <Input
                  value={newMessageInput}
                  onChange={(e) => setNewMessageInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="예: 우리 강아지가 계속 기침을 해요"
                  className="pr-12 rounded-lg border-gray-300"
                  disabled={isSending}
                  autoFocus
                />
                <Button
                  onClick={handleStartNewConversation}
                  disabled={!newMessageInput.trim() || isSending}
                  size="icon"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-lg bg-[#FBD6E4] hover:bg-[#f5c0d5]"
                >
                  {isSending ? (
                    <div className="w-3 h-3 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 text-gray-800" />
                  )}
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowNewChatInput(false)
                    setNewMessageInput("")
                  }}
                  disabled={isSending}
                  className="text-gray-600"
                >
                  취소
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 대화방 목록 */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">이전 상담 기록</h2>
        
        {rooms.length === 0 ? (
          <Card className="border-gray-200">
            <CardContent className="p-8 text-center">
              <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">아직 상담 기록이 없습니다</p>
              <p className="text-sm text-gray-400">위에서 새로운 상담을 시작해보세요!</p>
            </CardContent>
          </Card>
        ) : (
          rooms.map((room) => (
            <Card
              key={room.id}
              className="border-gray-200 hover:border-[#FBD6E4] hover:shadow-md transition-all duration-200 cursor-pointer"
              onClick={() => handleRoomSelect(room)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-800 truncate mb-1">
                      {room.title || "새로운 상담"}
                    </h3>
                    {room.last_message && (
                      <p className="text-sm text-gray-600 mb-2 overflow-hidden" style={{ 
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}>
                        {room.last_message}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      {formatDate(room.updated_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => handleDeleteRoom(e, room.id)}
                      className="w-8 h-8 text-gray-400 hover:text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* 로딩 상태 */}
      {isLoading && rooms.length > 0 && (
        <div className="text-center py-4">
          <div className="w-6 h-6 border-2 border-[#FBD6E4] border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      )}
    </div>
  )
} 