"use client"

import dynamic from 'next/dynamic'

// 클라이언트 사이드에서만 로드되도록 동적 임포트
const NotFoundContent = dynamic(() => import('@/components/not-found/NotFoundContent'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-beige flex justify-center items-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500"></div>
    </div>
  )
})

export default function NotFound() {
  return <NotFoundContent />
} 