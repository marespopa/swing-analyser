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
    <div className={`space-y-6 ${className}`}>
      {/* Tab Headers */}
      <div className="flex bg-modern-surface rounded-lg p-1 border border-modern-border-light">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              font-medium px-6 py-3 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-modern-primary/20 cursor-pointer
              ${activeTab === tab.id 
                ? 'bg-modern-primary text-white shadow-lg' 
                : 'text-modern-secondary hover:text-modern-primary hover:bg-modern-surface'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Tab Content */}
      <div className="card p-6">
        {activeContent}
      </div>
    </div>
  )
}

export default Tabs 