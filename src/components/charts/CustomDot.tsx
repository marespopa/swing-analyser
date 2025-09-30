import React from 'react'

interface CustomDotProps {
  cx?: number
  cy?: number
  payload?: any
}

const CustomDot: React.FC<CustomDotProps> = ({ cx, cy, payload }) => {
  if (!payload?.entryPoint || cx === undefined || cy === undefined) {
    return <circle cx={cx} cy={cy} r={0} fill="transparent" />
  }

  const color = payload.entryPoint.confidence === 'high' ? '#10B981' : 
               payload.entryPoint.confidence === 'medium' ? '#F59E0B' : '#EF4444'
  
  return (
    <circle
      cx={cx}
      cy={cy}
      r={6}
      fill={color}
      stroke="white"
      strokeWidth={2}
      className="drop-shadow-lg"
    />
  )
}

export default React.memo(CustomDot)
