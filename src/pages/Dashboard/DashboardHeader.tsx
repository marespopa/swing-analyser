import React from 'react'
import Button from '../../components/ui/Button'

interface DashboardHeaderProps {
  lastUpdated: Date
  onRefresh: () => void
  onResetPortfolio: () => void
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  lastUpdated,
  onRefresh,
  onResetPortfolio
}) => {
  return (
    <div className="bg-neo-surface dark:bg-neo-surface-dark border-neo border-neo-border shadow-neo-xl p-8 rounded-neo-xl mb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-neo font-black text-neo-text mb-2">
            PORTFOLIO DASHBOARD
          </h1>
          <div className="flex items-center gap-4 text-sm font-neo text-neo-text/80">
            <span>Last updated: {lastUpdated.toLocaleString()}</span>
          </div>
        </div>
        <div className="flex gap-4 mt-4 md:mt-0">
          <Button
            onClick={() => {
              console.log('Refresh button clicked at:', new Date().toLocaleString())
              onRefresh()
            }}
            variant="primary"
            size="lg"
          >
            REFRESH ANALYSIS
          </Button>
          <Button
            onClick={onResetPortfolio}
            variant="secondary"
            size="lg"
          >
            RESET PORTFOLIO
          </Button>
        </div>
      </div>
    </div>
  )
}

export default DashboardHeader 