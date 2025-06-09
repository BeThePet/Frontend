"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Camera, Upload, X, Edit, Trash2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface PhotoUploadProps {
  initialImage?: string
  onImageChange?: (file: File | null) => void
  className?: string
  size?: "sm" | "md" | "lg"
  uploadedImageUrl?: string
}

export default function PhotoUpload({ initialImage, onImageChange, className = "", size = "md", uploadedImageUrl }: PhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(initialImage || null)
  const [isLoading, setIsLoading] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // S3 업로드가 완료되면 업로드된 URL로 미리보기 업데이트
  useEffect(() => {
    if (uploadedImageUrl) {
      setPreview(uploadedImageUrl)
    }
  }, [uploadedImageUrl])

  const sizes = {
    sm: "w-20 h-20",
    md: "w-32 h-32",
    lg: "w-40 h-40",
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsLoading(true)

    // S3 업로드를 위해 미리보기는 로컬 URL로 생성
    const localPreviewUrl = URL.createObjectURL(file)
    setPreview(localPreviewUrl)
    
    // 부모 컴포넌트에서 실제 S3 업로드 처리
    if (onImageChange) onImageChange(file)
    
    setIsLoading(false)
    setShowImageModal(false) // 모달 닫기
  }

  const handleRemoveImage = () => {
    // 이미지 삭제 확인
    if (confirm('이미지를 삭제하시겠습니까?\n(백엔드에서도 완전히 삭제됩니다)')) {
      setPreview(null)
      if (fileInputRef.current) fileInputRef.current.value = ""
      if (onImageChange) onImageChange(null)
      setShowImageModal(false) // 모달 닫기
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const handleImageClick = () => {
    if (preview) {
      setShowImageModal(true)
    } else {
      triggerFileInput()
    }
  }

  return (
    <>
      <div className={`flex flex-col items-center ${className}`}>
        <motion.div
          whileTap={{ scale: 0.95 }}
          className={`relative ${sizes[size]} rounded-full overflow-hidden border-4 border-white bg-gray-100 shadow-md cursor-pointer`}
          onClick={handleImageClick}
        >
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full flex items-center justify-center bg-gray-100"
              >
                <div className="w-8 h-8 border-2 border-[#FBD6E4] border-t-transparent rounded-full animate-spin"></div>
              </motion.div>
            ) : preview ? (
              <motion.div
                key="preview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full"
              >
                <Image src={preview || "/placeholder.svg"} alt="Pet photo" fill className="object-cover" />
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full flex items-center justify-center bg-gray-100"
              >
                <Camera className="w-8 h-8 text-gray-400" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
          aria-label="Upload pet photo"
        />

        <AnimatePresence>
          {!isLoading && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <Button
                type="button"
                onClick={triggerFileInput}
                variant="outline"
                size="sm"
                className="mt-2 rounded-full border-[#D6ECFA] text-gray-700 flex items-center gap-1 shadow-sm"
              >
                <Upload className="w-4 h-4" />
                <span>사진 {preview ? "변경" : "추가"}</span>
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 이미지 조회 모달 */}
      <AnimatePresence>
        {showImageModal && preview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setShowImageModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative max-w-4xl max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 상단 버튼들 */}
              <div className="absolute top-4 left-4 z-10 flex gap-2">
                <Button
                  onClick={triggerFileInput}
                  size="sm"
                  className="bg-white/90 hover:bg-white text-gray-700 rounded-full shadow-lg flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  수정
                </Button>
                <Button
                  onClick={handleRemoveImage}
                  size="sm"
                  variant="destructive"
                  className="bg-red-500/90 hover:bg-red-600 text-white rounded-full shadow-lg flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  삭제
                </Button>
              </div>

              {/* 닫기 버튼 */}
              <Button
                onClick={() => setShowImageModal(false)}
                size="sm"
                variant="ghost"
                className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white text-gray-700 rounded-full shadow-lg"
              >
                <X className="w-4 h-4" />
              </Button>

              {/* 이미지 */}
              <div className="relative w-full h-[80vh] rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src={preview}
                  alt="Pet photo"
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
