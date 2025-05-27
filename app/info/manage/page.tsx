"use client"

import dynamic from 'next/dynamic'

// 클라이언트 사이드에서만 로드되도록 동적 임포트
const ManageContent = dynamic(() => import('@/components/info/manage/ManageContent'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-beige flex justify-center items-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
    </div>
  )
})

export default function ManagePage() {
  return <ManageContent />
}
