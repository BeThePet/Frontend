import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"

export default function SignupPage() {
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
            <form className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="이메일을 입력해주세요"
                  className="rounded-lg border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nickname">닉네임</Label>
                <Input
                  id="nickname"
                  type="text"
                  placeholder="닉네임을 입력해주세요"
                  className="rounded-lg border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">비밀번호</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="비밀번호를 입력해주세요"
                  className="rounded-lg border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">비밀번호 확인</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="비밀번호를 다시 입력해주세요"
                  className="rounded-lg border-gray-300"
                />
              </div>

              <Button className="w-full h-12 rounded-full bg-[#FBD6E4] hover:bg-[#f5c0d5] text-gray-800 text-lg">
                회원가입
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
