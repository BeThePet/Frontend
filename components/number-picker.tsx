"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronUp, ChevronDown } from "lucide-react"

interface NumberPickerProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  unit?: string
  precision?: number
}

export function NumberPicker({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  unit = "",
  precision = 1,
}: NumberPickerProps) {
  const [currentValue, setCurrentValue] = useState(value)
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const pickerRef = useRef<HTMLDivElement>(null)

  // 값 변경 시 부모 컴포넌트에 알림
  useEffect(() => {
    if (currentValue !== value) {
      onChange(currentValue)
    }
  }, [currentValue, onChange, value])

  // 외부에서 값이 변경되면 내부 상태 업데이트
  useEffect(() => {
    setCurrentValue(value)
  }, [value])

  // 숫자 배열 생성 (선택 가능한 값들)
  const generateNumbers = () => {
    const numbers = []
    for (let i = min; i <= max; i += step) {
      numbers.push(Number(i.toFixed(precision)))
    }
    return numbers
  }

  const numbers = generateNumbers()

  // 값 증가
  const increment = () => {
    if (currentValue + step <= max) {
      setCurrentValue(Number((currentValue + step).toFixed(precision)))
    }
  }

  // 값 감소
  const decrement = () => {
    if (currentValue - step >= min) {
      setCurrentValue(Number((currentValue - step).toFixed(precision)))
    }
  }

  // 피커 열기
  const openPicker = () => {
    setIsOpen(true)
  }

  // 피커 닫기
  const closePicker = () => {
    setIsOpen(false)
  }

  // 값 선택
  const selectValue = (val: number) => {
    setCurrentValue(val)
    closePicker()
  }

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        closePicker()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  return (
    <div className="relative" ref={containerRef}>
      <div className="flex items-center justify-center gap-2">
        <button
          type="button"
          className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          onClick={decrement}
          disabled={currentValue <= min}
        >
          <ChevronDown className="w-5 h-5 text-gray-600" />
        </button>

        <div
          className="flex items-center justify-center gap-1 bg-white border border-gray-200 rounded-lg px-3 py-2 min-w-[80px] cursor-pointer hover:border-pink-300 transition-colors"
          onClick={openPicker}
        >
          <span className="text-lg font-medium text-gray-800">
            {currentValue.toFixed(precision === 0 ? 0 : precision)}
          </span>
          {unit && <span className="text-sm text-gray-500">{unit}</span>}
        </div>

        <button
          type="button"
          className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          onClick={increment}
          disabled={currentValue >= max}
        >
          <ChevronUp className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={pickerRef}
            className="absolute z-50 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-[250px] overflow-auto w-full min-w-[120px] left-1/2 transform -translate-x-1/2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-1">
              {numbers.map((num) => (
                <div
                  key={num}
                  className={`px-3 py-2 rounded-md cursor-pointer transition-colors ${
                    num === currentValue ? "bg-pink-100 text-pink-600 font-medium" : "hover:bg-gray-100"
                  }`}
                  onClick={() => selectValue(num)}
                >
                  <div className="flex items-center justify-between">
                    <span>{num.toFixed(precision === 0 ? 0 : precision)}</span>
                    {unit && <span className="text-sm text-gray-500">{unit}</span>}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
