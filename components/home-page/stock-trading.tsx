"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface StockData {
  symbol: string
  id: string
  price: number
  percentChange: number // Note: We'll map from percentchange to percentChange
  marketCap: number // Note: We'll map from marketcap to marketCap
  logo: string | null
  name?: string // Adding optional name field
}

interface BubblePosition {
  x: number
  y: number
  vx: number
  vy: number
  initialX: number
  initialY: number
  size: number
  targetX?: number
  targetY?: number
  angle: number
  radius: number
  speed: number
}

export default function StockTrading() {
  const [stockData, setStockData] = useState<StockData[]>([])
  const [selectedStock, setSelectedStock] = useState<string | null>(null)
  const [bubblePositions, setBubblePositions] = useState<Record<string, BubblePosition>>({})
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })
  const [isInitialized, setIsInitialized] = useState(false)
  const animationRef = useRef<number>(0)
  const timeRef = useRef(0)
  const selectedStockData = stockData.find((c: { symbol: string | null }) => c.symbol === selectedStock)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("https://automation.immergreen.cc/webhook/stock-market")
        const apiResponse = await response.json()
        // console.log("data stock:", apiResponse)
        const transformedData = apiResponse.map((item: { symbol: any; id: any; price: any; percentchange: string; marketcap: any; logo: any }) => ({
          symbol: item.symbol,
          id: item.id,
          price: item.price,
          percentChange: Number.parseFloat(item.percentchange),
          marketCap: item.marketcap, 
          logo: item.logo,
        }))

        setStockData(transformedData)
      } catch (error) {
        console.error("Error fetching stock data:", error)
        setStockData([])
      }
    }

    fetchData()
  }, [])


  const initializeBubblePositions = useCallback(() => {
    if (!containerRef.current || stockData.length === 0) return

    const container = containerRef.current
    const rect = container.getBoundingClientRect()
    setContainerSize({ width: rect.width, height: rect.height })

    const positions: Record<string, BubblePosition> = {}
    const bubbleCount = stockData.length

    const aspectRatio = rect.width / rect.height
    const columns = Math.ceil(Math.sqrt(bubbleCount * aspectRatio))
    const rows = Math.ceil(bubbleCount / columns)

    const cellWidth = rect.width / columns
    const cellHeight = rect.height / rows

    stockData.forEach((stock: { percentChange: number; symbol: string | number }, index: number) => {
      const baseSize = Math.abs(stock.percentChange)
      const size = Math.max(80, Math.min(120, baseSize * 2 + 80))

      const col = index % columns
      const row = Math.floor(index / columns)

      const randomOffsetX = (Math.random() - 0.5) * (cellWidth * 0.3)
      const randomOffsetY = (Math.random() - 0.5) * (cellHeight * 0.3)

      const x = (col + 0.5) * cellWidth + randomOffsetX
      const y = (row + 0.5) * cellHeight + randomOffsetY + 60

      const speed = 0.5 + Math.random() * 1.5
      const angle = Math.random() * Math.PI * 2
      const vx = Math.cos(angle) * speed
      const vy = Math.sin(angle) * speed

      positions[stock.symbol] = {
        x,
        y,
        vx,
        vy,
        initialX: x,
        initialY: y,
        size,
        angle: Math.random() * Math.PI * 2,
        radius: Math.random() * 20 + 10,
        speed: (Math.random() * 0.0005 + 0.0002) * (Math.random() < 0.5 ? 1 : -1),
      }
    })

    setBubblePositions(positions)
    setIsInitialized(true)
  }, [stockData])

  const updateBubblePositions = useCallback(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const rect = container.getBoundingClientRect()
    const time = performance.now() * 0.001
    timeRef.current = time

    setBubblePositions((prev) => {
      const updated = { ...prev }
      const symbols = Object.keys(updated)

      symbols.forEach((symbol) => {
        const bubble = updated[symbol]

        bubble.x += bubble.vx
        bubble.y += bubble.vy

        if (bubble.x < bubble.size / 2) {
          bubble.x = bubble.size / 2
          bubble.vx = Math.abs(bubble.vx) * 0.8
        } else if (bubble.x > rect.width - bubble.size / 2) {
          bubble.x = rect.width - bubble.size / 2
          bubble.vx = -Math.abs(bubble.vx) * 0.8
        }

        if (bubble.y < bubble.size / 2 + 60) {
          bubble.y = bubble.size / 2 + 60
          bubble.vy = Math.abs(bubble.vy) * 0.8
        } else if (bubble.y > rect.height - bubble.size / 2) {
          bubble.y = rect.height - bubble.size / 2
          bubble.vy = -Math.abs(bubble.vy) * 0.8
        }

        if (Math.abs(bubble.vx) < 0.2) bubble.vx += (Math.random() - 0.5) * 0.4
        if (Math.abs(bubble.vy) < 0.2) bubble.vy += (Math.random() - 0.5) * 0.4

        const maxSpeed = 3
        const currentSpeed = Math.sqrt(bubble.vx * bubble.vx + bubble.vy * bubble.vy)
        if (currentSpeed > maxSpeed) {
          bubble.vx = (bubble.vx / currentSpeed) * maxSpeed
          bubble.vy = (bubble.vy / currentSpeed) * maxSpeed
        }
      })

      for (let i = 0; i < symbols.length; i++) {
        const bubbleA = updated[symbols[i]]

        for (let j = i + 1; j < symbols.length; j++) {
          const bubbleB = updated[symbols[j]]

          const dx = bubbleB.x - bubbleA.x
          const dy = bubbleB.y - bubbleA.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          const minDistance = (bubbleA.size + bubbleB.size) / 2

          if (distance < minDistance) {
            const angle = Math.atan2(dy, dx)

            const overlap = minDistance - distance

            const moveX = Math.cos(angle) * overlap * 0.5
            const moveY = Math.sin(angle) * overlap * 0.5

            bubbleA.x -= moveX
            bubbleA.y -= moveY
            bubbleB.x += moveX
            bubbleB.y += moveY

            const dotProductA = bubbleA.vx * Math.cos(angle) + bubbleA.vy * Math.sin(angle)
            const dotProductB = bubbleB.vx * Math.cos(angle) + bubbleB.vy * Math.sin(angle)

            const restitution = 0.8

            const v1 = dotProductA * (1 - restitution) + dotProductB * restitution
            const v2 = dotProductB * (1 - restitution) + dotProductA * restitution

            bubbleA.vx += (v1 - dotProductA) * Math.cos(angle)
            bubbleA.vy += (v1 - dotProductA) * Math.sin(angle)
            bubbleB.vx += (v2 - dotProductB) * Math.cos(angle)
            bubbleB.vy += (v2 - dotProductB) * Math.sin(angle)
          }
        }
      }

      return updated
    })

    animationRef.current = requestAnimationFrame(updateBubblePositions)
  }, [])

  // Improved resize handling
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return
      initializeBubblePositions()
    }

    const debouncedHandleResize = debounce(handleResize, 250)
    window.addEventListener("resize", debouncedHandleResize)
    return () => window.removeEventListener("resize", debouncedHandleResize)
  }, [initializeBubblePositions])

  useEffect(() => {
    if (stockData.length > 0) {
      initializeBubblePositions()
    }
  }, [initializeBubblePositions, stockData])

  useEffect(() => {
    if (isInitialized) {
      updateBubblePositions()
    }
    return () => cancelAnimationFrame(animationRef.current)
  }, [isInitialized, updateBubblePositions])

  const handleBubbleClick = useCallback(
    (symbol: string) => {
      if (selectedStock === symbol) {
        setSelectedStock(null)
      } else {
        setSelectedStock(symbol)
      }
    },
    [selectedStock],
  )

  // Enhanced bubble interaction
  const handleBubbleInteraction = useCallback((symbol: string) => {
    setBubblePositions((prev) => {
      const updated = { ...prev }
      const targetBubble = updated[symbol]
      if (!targetBubble) return prev

      Object.keys(updated).forEach((otherSymbol) => {
        if (otherSymbol === symbol) return
        const otherBubble = updated[otherSymbol]
        const dx = otherBubble.x - targetBubble.x
        const dy = otherBubble.y - targetBubble.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < 150) {
          const maxForce = 100
          const force = Math.min(maxForce, (maxForce * 2) / (distance + 1))
          const angle = Math.atan2(dy, dx)

          otherBubble.vx += Math.cos(angle) * force * 0.3
          otherBubble.vy += Math.sin(angle) * force * 0.3
        }
      })

      targetBubble.vx += (Math.random() - 0.5) * 8
      targetBubble.vy += (Math.random() - 0.5) * 8

      return updated
    })
  }, [])

  // Utility function for debouncing
  function debounce(func: Function, wait: number) {
    let timeout: NodeJS.Timeout
    return function executedFunction(...args: any[]) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  }

  const calculatePopupPosition = (bubble: BubblePosition) => {
    if (!containerRef.current) return { top: 0, left: 0 }

    const container = containerRef.current.getBoundingClientRect()
    const popupWidth = 280
    const popupHeight = 200

    let left = bubble.x + bubble.size + 10
    let top = bubble.y

    if (left + popupWidth > container.width) {
      left = bubble.x - popupWidth - 10
    }

    if (left < 0) {
      left = Math.max(0, bubble.x - popupWidth / 2)
    }

    if (top + popupHeight > container.height) {
      top = Math.max(60, container.height - popupHeight - 10)
    }

    return { top, left }
  }

  // Function to format currency
  const formatCurrency = (value: number) => {
    return value.toLocaleString()
  }

  return (
    <div className="w-full">
      <div
        ref={containerRef}
        className="relative mt-3 h-[calc(100vh-120px)] w-full overflow-hidden rounded-lg border dark:border-gray-700 shadow-xl rounded-sm"
      >
        <AnimatePresence>
          {isInitialized &&
            Object.keys(bubblePositions).map((symbol) => {
              const stock = stockData.find((c: { symbol: string }) => c.symbol === symbol)
              if (!stock) return null

              const position = bubblePositions[symbol]
              const isNegative = stock.percentChange < 0
              const gradientColors = isNegative
                ? ["rgba(239, 68, 68, 0.2)", "rgba(239, 68, 68, 0.1)"]
                : ["rgba(34, 197, 94, 0.2)", "rgba(34, 197, 94, 0.1)"]
              const borderColor = isNegative ? "rgb(239, 68, 68)" : "rgb(34, 197, 94)"

              return (
                <motion.div
                  key={stock.symbol}
                  className="absolute flex cursor-pointer flex-col items-center justify-center rounded-full backdrop-blur-sm"
                  style={{
                    x: position.x - position.size / 2,
                    y: position.y - position.size / 2,
                    width: position.size,
                    height: position.size,
                    background: `radial-gradient(circle at center, ${gradientColors[0]}, ${gradientColors[1]})`,
                    border: `2px solid ${borderColor}`,
                    boxShadow: `0 0 20px ${gradientColors[0]}`,
                    zIndex: selectedStock === stock.symbol ? 20 : 10,
                  }}
                  whileHover={{
                    scale: 1.1,
                    transition: { type: "spring", stiffness: 300, damping: 15 },
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleBubbleClick(stock.symbol)}
                  onHoverStart={() => handleBubbleInteraction(stock.symbol)}
                  onTap={() => handleBubbleInteraction(stock.symbol)}
                >
                  <div className="mb-1" style={{ height: position.size * 0.25, width: position.size * 0.25 }}>
                    {stock.logo && (
                      <img
                        src={stock.logo || "/placeholder.svg"}
                        alt={`${stock.symbol} logo`}
                        className="h-full w-full object-contain drop-shadow-lg"
                      />
                    )}
                  </div>
                  <div
                    className="text-gray-800 dark:text-gray-300 font-semibold drop-shadow-lg"
                    style={{ fontSize: position.size * 0.18 }}
                  >
                    {stock.symbol}
                  </div>
                  <div
                    className={`${isNegative ? "text-red-500" : "text-green-500"} font-medium drop-shadow-lg`}
                    style={{ fontSize: position.size * 0.15 }}
                  >
                    {stock.percentChange > 0 ? "+" : ""}
                    {stock.percentChange}%
                  </div>
                </motion.div>
              )
            })}

          {/* Hiển thị popup chi tiết riêng biệt */}
          {selectedStock && selectedStockData && (
            <AnimatePresence>
              <motion.div
                key={`popup-${selectedStock}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute z-50 w-64 rounded-sm bg-gray-50 dark:bg-gray-800 p-4 shadow-lg"
                style={{
                  left: calculatePopupPosition(bubblePositions[selectedStock]).left,
                  top: calculatePopupPosition(bubblePositions[selectedStock]).top,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mb-2 flex items-center gap-2">
                  <div className="h-8 w-8">
                    {selectedStockData.logo && (
                      <img
                        src={selectedStockData.logo || "/placeholder.svg"}
                        alt={`${selectedStock} logo`}
                        className="h-full w-full object-contain"
                      />
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-black dark:text-white">
                    {selectedStockData.name || selectedStock} ({selectedStock})
                  </h3>
                </div>
                <div className="mb-1 flex justify-between">
                  <span className="text-gray-400">Price:</span>
                  <span className="font-medium text-black dark:text-white">{formatCurrency(selectedStockData.price)} </span>
                </div>
                <div className="mb-1 flex justify-between">
                  <span className="text-gray-400">Percentage change:</span>
                  <span className={selectedStockData.percentChange < 0 ? "text-red-500" : "text-green-500"}>
                    {selectedStockData.percentChange > 0 ? "+" : ""}
                    {selectedStockData.percentChange}%
                  </span>
                </div>
                <div className="mb-1 flex justify-between">
                  <span className="text-gray-400">Market cap:</span>
                  <span className="font-medium  text-black dark:text-white">{formatCurrency(selectedStockData.marketCap)}</span>
                </div>
                <div className="mt-7 text-center">
                  <button
                    className="rounded-sm bg-green-600 px-5 py-1 text-sm font-medium text-white hover:bg-green-700"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedStock(null)
                    }}
                  >
                    Đóng
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

