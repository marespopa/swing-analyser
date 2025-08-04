import React, { useState } from 'react'

interface Tab {
  id: string
  label: string
  content: React.ReactNode
}

interface TabsProps {
  tabs: Tab[]
  defaultTab?: string
  className?: string
}

const Tabs: React.FC<TabsProps> = ({ tabs, defaultTab, className = '' }) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id || '')
  
  const activeContent = tabs.find(tab => tab.id === activeTab)?.content
  
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Tab Headers */}
      <div className="flex border-b-neo border-neo-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              font-neo font-bold px-6 py-3 border-r-neo border-neo-border last:border-r-0
              transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neo-accent
              ${activeTab === tab.id 
                ? 'bg-neo-accent text-white border-neo-accent shadow-neo-hover' 
                : 'bg-neo-surface dark:bg-neo-surface-dark text-neo-text hover:bg-neo-background dark:hover:bg-neo-background-dark hover-lift'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Tab Content */}
      <div className="bg-neo-surface dark:bg-neo-surface-dark border-neo border-neo-border shadow-neo p-6">
        {activeContent}
      </div>
    </div>
  )
}

export default Tabs 