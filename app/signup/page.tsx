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

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [nickname, setNickname] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.")
      setIsLoading(false)
      return
    }

    try {
      await userApi.signup({ email, nickname, password })
      alert("회원가입이 완료되었습니다. 로그인해주세요.")
      router.push("/login")
    } catch (error) {
      console.error("회원가입 실패:", error)
      setError("회원가입 중 오류가 발생했습니다. 다시 시도해주세요.")
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
        <h1 className="text-xl font-bold text-gray-800 ml-4">회원가입</h1>
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
                <Label htmlFor="nickname">닉네임</Label>
                <Input
                  id="nickname"
                  type="text"
                  placeholder="닉네임을 입력해주세요"
                  className="rounded-lg border-gray-300"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
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

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">비밀번호 확인</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="비밀번호를 다시 입력해주세요"
                  className="rounded-lg border-gray-300"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <Button 
                type="submit"
                className="w-full h-12 rounded-full bg-[#FBD6E4] hover:bg-[#f5c0d5] text-gray-800 text-lg"
                disabled={isLoading}
              >
                {isLoading ? "가입 중..." : "회원가입"}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <Link href="/login" className="text-sm text-gray-600 hover:underline">
                이미 계정이 있으신가요? 로그인
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
