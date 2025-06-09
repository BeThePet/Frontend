"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"
import { userApi } from "@/lib/api"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      console.log("로그인 시도:", { email, password: "***" })
      const result = await userApi.login({ email, password })
      console.log("로그인 결과:", result)
      
      if (result.success) {
        console.log("로그인 성공, 대시보드로 이동")
        router.push("/dashboard")
      } else {
        console.log("로그인 실패:", result.error)
        // 백엔드에서 반환하는 구체적인 에러 메시지 표시
        setError(result.error || "로그인에 실패했습니다.")
      }
    } catch (error) {
      console.error("로그인 API 호출 실패:", error)
      setError("네트워크 오류가 발생했습니다. 다시 시도해주세요.")
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
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

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
