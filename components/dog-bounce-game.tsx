"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Trophy } from "lucide-react"
import { getData, saveData } from "@/lib/storage"

type LeaderboardEntry = {
  name: string
  score: number
  date: string
}

export default function DogBounceGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [score, setScore] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [playerName, setPlayerName] = useState("")
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const ballRef = useRef({ x: 150, y: 200, vx: 0, vy: -4 })
  const gameOverRef = useRef(false)

  // 리더보드 불러오기
  useEffect(() => {
    const savedLeaderboard = getData("dogBounceLeaderboard") || []
    setLeaderboard(savedLeaderboard)

    // 저장된 사용자 이름 불러오기
    const petInfo = getData("petInfo")
    if (petInfo?.name) {
      setPlayerName(`${petInfo.name}의 집사`)
    } else {
      setPlayerName("익명의 집사")
    }
  }, [])

  // 게임 로직
  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationFrameId: number

    const draw = () => {
      const ball = ballRef.current

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // 배경 그리기
      ctx.fillStyle = "#FFF8E1" // 따뜻한 베이지 색상으로 변경
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // 강아지 그리기
      ctx.font = "30px serif"
      ctx.textAlign = "center"
      ctx.fillText("🐶", ball.x, ball.y)

      // 물리 업데이트
      ball.vy += 0.25 // 중력
      ball.y += ball.vy

      // 바닥에 닿으면 게임 오버
      if (ball.y > canvas.height - 20 && !gameOverRef.current) {
        gameOverRef.current = true
        setIsRunning(false)
        saveScore()
      }

      // 천장에 닿으면 튕기기
      if (ball.y < 30) {
        ball.y = 30
        ball.vy = Math.abs(ball.vy) * 0.8
      }

      if (isRunning && !gameOverRef.current) {
        animationFrameId = requestAnimationFrame(draw)
      }
    }

    if (isRunning) {
      draw()
    }

    return () => cancelAnimationFrame(animationFrameId)
  }, [isRunning])

  // 점수 저장
  const saveScore = () => {
    if (score <= 0) return

    const newEntry: LeaderboardEntry = {
      name: playerName,
      score: score,
      date: new Date().toLocaleDateString(),
    }

    const updatedLeaderboard = [...leaderboard, newEntry].sort((a, b) => b.score - a.score).slice(0, 10) // 상위 10개만 유지

    setLeaderboard(updatedLeaderboard)
    saveData("dogBounceLeaderboard", updatedLeaderboard)
    setShowLeaderboard(true)
  }

  // 강아지 튕기기
  const handleBounce = () => {
    if (gameOverRef.current) return

    if (!isRunning) {
      setIsRunning(true)
      gameOverRef.current = false
    }

    const ball = ballRef.current
    ball.vy = -6
    setScore((prev) => prev + 1)
  }

  // 게임 재시작
  const resetGame = () => {
    setScore(0)
    ballRef.current = { x: 150, y: 200, vx: 0, vy: -4 }
    setIsRunning(false)
    gameOverRef.current = false
    setShowLeaderboard(false)
  }

  return (
    <Card className="w-full bg-white rounded-xl shadow-sm overflow-hidden">
      <CardContent className="flex flex-col items-center gap-4 p-6">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-yellow-800">🎮 Dog Bounce Game</h2>
          <Button
            variant="ghost"
            size="sm"
            className="text-yellow-600"
            onClick={() => setShowLeaderboard(!showLeaderboard)}
          >
            <Trophy className="h-4 w-4 mr-1" />
            순위
          </Button>
        </div>

        {!showLeaderboard ? (
          <>
            <p className="text-sm text-gray-600 text-center">강아지를 클릭해서 튕겨보세요! 바닥에 닿으면 게임 오버!</p>

            <div className="relative">
              <canvas
                ref={canvasRef}
                width={300}
                height={400}
                className="border rounded-lg shadow-md bg-beige cursor-pointer"
                onClick={handleBounce}
              />

              {!isRunning && score === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button onClick={handleBounce} className="bg-yellow-500 hover:bg-yellow-600">
                    게임 시작
                  </Button>
                </div>
              )}

              {gameOverRef.current && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 rounded-lg">
                  <div className="text-white text-2xl font-bold mb-4">게임 오버!</div>
                  <div className="text-white text-xl mb-4">점수: {score}</div>
                  <Button onClick={resetGame}>다시 시작</Button>
                </div>
              )}
            </div>

            <div className="text-lg font-bold text-yellow-700">현재 점수: {score}</div>
          </>
        ) : (
          <div className="w-full">
            <h3 className="text-lg font-bold mb-3 text-center">🏆 리더보드</h3>
            {leaderboard.length > 0 ? (
              <div className="space-y-2 max-h-[350px] overflow-y-auto">
                {leaderboard.map((entry, index) => (
                  <div
                    key={index}
                    className={`flex justify-between items-center p-3 rounded-lg ${
                      index < 3 ? "bg-yellow-50 border border-yellow-200" : "bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {index === 0 && <span className="text-xl">🥇</span>}
                      {index === 1 && <span className="text-xl">🥈</span>}
                      {index === 2 && <span className="text-xl">🥉</span>}
                      {index > 2 && <span className="w-6 text-center">{index + 1}</span>}
                      <span className="font-medium">{entry.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-yellow-700 font-bold">{entry.score}점</span>
                      <span className="text-xs text-gray-500">{entry.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">아직 기록이 없습니다. 첫 번째 도전자가 되어보세요!</div>
            )}
            <div className="flex justify-center mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowLeaderboard(false)
                  resetGame()
                }}
              >
                게임으로 돌아가기
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
