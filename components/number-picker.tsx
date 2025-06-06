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
  value: initialValue,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  unit = "",
  precision = 1,
}: NumberPickerProps) {
  // initialValue가 number 타입이 아닐 경우 기본값 사용
  const [currentValue, setCurrentValue] = useState<number>(typeof initialValue === 'number' ? initialValue : 0)
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const lastReportedValue = useRef<number>(typeof initialValue === 'number' ? initialValue : 0)

  // 외부에서 값이 변경되면 내부 상태 업데이트 (초기값이나 props가 변경된 경우만)
  useEffect(() => {
    if (typeof initialValue === 'number' && initialValue !== currentValue) {
      setCurrentValue(initialValue)
      lastReportedValue.current = initialValue
    }
  }, [initialValue, currentValue])

  // 숫자 배열 생성 (선택 가능한 값들)
  const generateNumbers = () => {
    const numbers = []
    for (let i = min; i <= max; i += step) {
      numbers.push(Number(i.toFixed(precision)))
    }
    return numbers
  }

  const numbers = generateNumbers()

  // 값 변경 시 부모 컴포넌트에 알림 (값이 실제로 변경된 경우만)
  const reportValueChange = (newValue: number) => {
    if (newValue !== lastReportedValue.current) {
      lastReportedValue.current = newValue
      onChange(newValue)
    }
  }

  // 값 증가
  const increment = () => {
    const newValue = Number((currentValue + step).toFixed(precision))
    if (newValue <= max) {
      setCurrentValue(newValue)
      reportValueChange(newValue)
    }
  }

  // 값 감소
  const decrement = () => {
    const newValue = Number((currentValue - step).toFixed(precision))
    if (newValue >= min) {
      setCurrentValue(newValue)
      reportValueChange(newValue)
    }
  }

  // 드롭다운에서 값 선택
  const selectValue = (num: number) => {
    setCurrentValue(num)
    reportValueChange(num)
    closePicker()
  }

  // 드롭다운 열기
  const openPicker = () => {
    setIsOpen(true)
  }

  // 드롭다운 닫기
  const closePicker = () => {
    setIsOpen(false)
  }

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        closePicker()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // currentValue가 유효한 숫자인지 확인
  const displayValue = typeof currentValue === 'number' && !isNaN(currentValue) 
    ? currentValue.toFixed(precision === 0 ? 0 : precision)
    : '0'

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
            {displayValue}
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
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-[200px] overflow-y-auto"
          >
            {numbers.map((num) => (
              <button
                key={num}
                type="button"
                className={`w-full px-4 py-2 text-left hover:bg-pink-50 transition-colors ${
                  num === currentValue ? "bg-pink-100 text-pink-600" : "text-gray-700"
                }`}
                onClick={() => selectValue(num)}
              >
                {num.toFixed(precision === 0 ? 0 : precision)}
                {unit && <span className="ml-1 text-sm text-gray-500">{unit}</span>}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
