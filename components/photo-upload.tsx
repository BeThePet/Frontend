"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Camera, Upload, X } from "lucide-react"
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
  }

  const handleRemoveImage = () => {
    setPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
    if (onImageChange) onImageChange(null)
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <motion.div
        whileTap={{ scale: 0.95 }}
        className={`relative ${sizes[size]} rounded-full overflow-hidden border-4 border-white bg-gray-100 shadow-md`}
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
              onClick={triggerFileInput}
            >
              <Image src={preview || "/placeholder.svg"} alt="Pet photo" fill className="object-cover" />
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemoveImage()
                }}
                className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
                aria-label="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full flex items-center justify-center bg-gray-100"
              onClick={triggerFileInput}
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
  )
}
