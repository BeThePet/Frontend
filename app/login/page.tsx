"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Mock 로그인 (테스트용)
    // 실제 구현에서는 백엔드 API 호출
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)) // 로딩 시뮬레이션
      
      // 테스트용 계정: test@example.com / password123
      if (email === "test@example.com" && password === "password123") {
        localStorage.setItem("token", "mock-jwt-token-123")
        localStorage.setItem("user", JSON.stringify({
          id: "user-001",
          email: "test@example.com",
          name: "테스터"
        }))
        router.push("/dashboard")
      } else {
        alert("테스트 계정을 사용해주세요:\n이메일: test@example.com\n비밀번호: password123")
      }
    } catch (error) {
      console.error("로그인 실패:", error)
      alert("로그인 중 오류가 발생했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FFF8F0] flex flex-col">
      <div className="bg-[#FBD6E4] p-4 flex items-center">
        <Link href="/" className="text-gray-800">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-bold text-gray-800 ml-4">로그인</h1>
      </div>

      <div className="flex-1 p-5 flex flex-col justify-center">
        <Card className="bg-white rounded-xl shadow-sm">
          <CardContent className="p-5">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="이메일을 입력해주세요"
                  className="rounded-lg border-gray-300"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">비밀번호</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="비밀번호를 입력해주세요"
                  className="rounded-lg border-gray-300"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button 
                type="submit"
                className="w-full h-12 rounded-full bg-[#FBD6E4] hover:bg-[#f5c0d5] text-gray-800 text-lg"
                disabled={isLoading}
              >
                {isLoading ? "로그인 중..." : "로그인"}
              </Button>
            </form>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700 font-medium">테스트 계정</p>
              <p className="text-xs text-blue-600">이메일: test@example.com</p>
              <p className="text-xs text-blue-600">비밀번호: password123</p>
            </div>

            <div className="mt-4 text-center">
              <Link href="/signup" className="text-sm text-gray-600 hover:underline">
                계정이 없으신가요? 회원가입
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
