import { useState, useCallback } from 'react'
import type { ToggleState } from '../types'

const initialToggleState: ToggleState = {
  showBollingerBands: true,
  showEMA9: true,
  showEMA21: true,
  showSupport: false,
  showResistance: false
}

export const useChartToggles = () => {
  const [toggles, setToggles] = useState<ToggleState>(initialToggleState)

  const handleToggleChange = useCallback((key: keyof ToggleState, value: boolean | string) => {
    setToggles(prev => ({ ...prev, [key]: value }))
  }, [])

  const resetToggles = useCallback(() => {
    setToggles(initialToggleState)
  }, [])

  return {
    toggles,
    handleToggleChange,
    resetToggles
  }
}
