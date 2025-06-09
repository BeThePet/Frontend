// app/report/weight-chart.tsx
// This is a placeholder.  A real implementation would likely use a charting library.

"use client"

import { useMemo } from "react"

interface WeightData {
  date: string
  weight: number
}

// 새로운 API 타입도 지원
interface WeightRecordData {
  weight_kg: number
  created_at: string
}

// API 응답 타입 추가
interface WeightRecordResponse {
  id: number
  weight_kg: number
  created_at?: string
}

interface WeightChartProps {
  weights: WeightData[] | WeightRecordData[] | WeightRecordResponse[]
}

export function WeightChart({ weights }: WeightChartProps) {
  const chartData = useMemo(() => {
    if (!weights || weights.length === 0) return []

    // API 데이터 타입 감지 및 정규화
    const normalizedWeights = weights.map(weight => {
      // WeightRecordResponse 형식인지 확인
      if ('weight_kg' in weight && 'id' in weight) {
        return {
          date: weight.created_at ? weight.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
          weight: weight.weight_kg
        }
      }
      // WeightRecordData 형식인지 확인
      else if ('weight_kg' in weight && 'created_at' in weight) {
        return {
          date: weight.created_at.split('T')[0], // ISO 날짜에서 날짜 부분만 추출
          weight: weight.weight_kg
        }
      }
      // 기존 형식
      return weight as WeightData
    })

    // 날짜순으로 정렬
    const sortedWeights = [...normalizedWeights].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    return sortedWeights
  }, [weights])

  const { minWeight, maxWeight, weightRange } = useMemo(() => {
    if (chartData.length === 0) return { minWeight: 0, maxWeight: 0, weightRange: 0 }

    const weights = chartData.map(d => d.weight)
    const min = Math.min(...weights)
    const max = Math.max(...weights)
    const range = max - min

    return {
      minWeight: Math.max(0, min - range * 0.1), // 10% 여백
      maxWeight: max + range * 0.1,
      weightRange: max - min + range * 0.2
    }
  }, [chartData])

  // 체중 변화 추세 계산
  const weightTrend = useMemo(() => {
    if (chartData.length < 2) return { trend: 'stable', change: 0 }
    
    const firstWeight = chartData[0].weight
    const lastWeight = chartData[chartData.length - 1].weight
    const change = lastWeight - firstWeight
    
    const trend = change > 0.2 ? 'up' : change < -0.2 ? 'down' : 'stable'
    
    return { trend, change }
  }, [chartData])

  if (chartData.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <div className="text-center">
          <p className="text-sm">체중 데이터가 없습니다</p>
          <p className="text-xs text-gray-400 mt-1">체중을 기록하여 변화 추이를 확인해보세요</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full w-full relative">
      {/* 체중 변화 요약 */}
      <div className="absolute top-2 right-2 text-xs text-gray-600 bg-white/80 px-2 py-1 rounded">
        {chartData.length > 1 && (
          <span className={`font-medium ${
            weightTrend.trend === 'up' ? 'text-red-500' : 
            weightTrend.trend === 'down' ? 'text-blue-500' : 
            'text-gray-500'
          }`}>
            {weightTrend.change > 0 ? '+' : ''}
            {weightTrend.change.toFixed(1)}kg
          </span>
        )}
      </div>

      <svg
        width="100%"
        height="100%"
        viewBox="0 0 400 200"
        className="overflow-visible"
      >
        {/* 배경 그리드 */}
        <defs>
          <pattern id="grid" width="40" height="20" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 20" fill="none" stroke="#f0f0f0" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Y축 레이블 */}
        {Array.from({ length: 6 }, (_, i) => {
          const weight = minWeight + (weightRange * i) / 5
          const y = 180 - (i * 36)
          return (
            <g key={i}>
              <line x1="0" y1={y} x2="400" y2={y} stroke="#e0e0e0" strokeWidth="1" />
              <text
                x="-5"
                y={y + 4}
                textAnchor="end"
                fontSize="10"
                fill="#666"
              >
                {weight.toFixed(1)}kg
              </text>
            </g>
          )
        })}

        {/* 차트 라인 */}
        {chartData.length > 1 && (
          <path
            d={chartData.map((point, index) => {
              const x = (index / (chartData.length - 1)) * 380 + 10
              const y = 180 - ((point.weight - minWeight) / weightRange) * 180
              return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
            }).join(' ')}
            fill="none"
            stroke="rgb(236, 72, 153)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* 데이터 포인트 */}
        {chartData.map((point, index) => {
          const x = (index / Math.max(chartData.length - 1, 1)) * 380 + 10
          const y = 180 - ((point.weight - minWeight) / (weightRange || 1)) * 180

          return (
            <g key={index}>
              <circle
                cx={x}
                cy={y}
                r="4"
                fill="rgb(236, 72, 153)"
                stroke="white"
                strokeWidth="2"
              />
              {/* 호버 시 표시할 값 */}
              <text
                x={x}
                y={y - 10}
                textAnchor="middle"
                fontSize="9"
                fill="#333"
                className="opacity-0 hover:opacity-100 transition-opacity"
              >
                {point.weight}kg
              </text>
              <text
                x={x}
                y={195}
                textAnchor="middle"
                fontSize="8"
                fill="#666"
              >
                {new Date(point.date).toLocaleDateString('ko-KR', { 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
