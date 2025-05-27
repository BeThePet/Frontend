"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home } from "lucide-react"

export default function NotFoundContent() {
  return (
    <div className="min-h-screen bg-beige flex flex-col items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">404</h1>
        <h2 className="text-xl text-gray-600 mb-6">페이지를 찾을 수 없습니다</h2>
        <p className="text-gray-500 mb-8">
          요청하신 페이지가 삭제되었거나 잘못된 경로입니다.
        </p>
        <Link href="/">
          <Button className="bg-pink-DEFAULT hover:bg-pink-dark text-white">
            <Home className="w-4 h-4 mr-2" />
            홈으로 돌아가기
          </Button>
        </Link>
      </div>
    </div>
  )
} 