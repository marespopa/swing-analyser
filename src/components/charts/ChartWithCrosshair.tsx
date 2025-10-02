import React, { useState, useCallback, useRef } from 'react'
import { ResponsiveContainer } from 'recharts'

interface ChartWithCrosshairProps {
  children: React.ReactNode
  height: number
  data: any[]
  onMouseMove?: (price: number | null) => void
}

const ChartWithCrosshair: React.FC<ChartWithCrosshairProps> = ({ 
  children, 
  height, 
  data,
  onMouseMove 
}) => {
  const [hoveredPrice, setHoveredPrice] = useState<number | null>(null)
  const [isHovering, setIsHovering] = useState(false)
  const [mouseY, setMouseY] = useState<number>(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (!data || data.length === 0 || !containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const y = event.clientY - rect.top
    
    // Account for chart margins (top: 5, bottom: 5, left: 20, right: 30)
    const topMargin = 5
    const bottomMargin = 5
    const chartHeight = rect.height - topMargin - bottomMargin
    const yInChart = y - topMargin
    
    // Clamp y position within chart bounds
    const yPercentage = Math.max(0, Math.min(1, yInChart / chartHeight))

    // Get the price range from the data
    const prices = data.map(d => d.price).filter(p => p !== null && !isNaN(p))
    if (prices.length === 0) return

    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)
    
    // Apply the same domain calculation as the chart: ['dataMin * 0.98', 'dataMax * 1.02']
    const chartMinPrice = minPrice * 0.98
    const chartMaxPrice = maxPrice * 1.02
    const priceRange = chartMaxPrice - chartMinPrice

    // Calculate the price at the mouse position
    // Note: Chart Y-axis is inverted (0 is at top, higher prices are at bottom)
    const priceAtMouse = chartMaxPrice - (yPercentage * priceRange)
    
    setHoveredPrice(priceAtMouse)
    setMouseY(y)
    setIsHovering(true)
    
    if (onMouseMove) {
      onMouseMove(priceAtMouse)
    }
  }, [data, onMouseMove])

  const handleMouseLeave = useCallback(() => {
    setHoveredPrice(null)
    setIsHovering(false)
    
    if (onMouseMove) {
      onMouseMove(null)
    }
  }, [onMouseMove])

  return (
    <div 
      ref={containerRef}
      className="relative"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <ResponsiveContainer width="100%" height={height}>
        {children as React.ReactElement}
      </ResponsiveContainer>
      
      {/* Custom Crosshair Line */}
      {isHovering && hoveredPrice && (
        <>
          {/* Horizontal line */}
          <div 
            className="absolute left-0 right-0 pointer-events-none z-10"
            style={{ 
              top: `${mouseY}px`,
              height: '1px',
              background: 'linear-gradient(to right, transparent 0%, #6B7280 20%, #6B7280 80%, transparent 100%)',
              opacity: 0.8
            }}
          />
        </>
      )}
    </div>
  )
}

export default React.memo(ChartWithCrosshair)
