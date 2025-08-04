import { useState } from 'react'
import { atom, useAtom } from 'jotai'
import { Button, Input, Tabs, Dropdown, LoadingOverlay } from '../components/ui'

// Example atoms for form state
const formDataAtom = atom({
  name: '',
  email: '',
  category: '',
  message: ''
})

function ComponentsPage() {
  const [formData, setFormData] = useAtom(formDataAtom)
  const [inputError, setInputError] = useState('')
  const [showLoading, setShowLoading] = useState(false)
  const [loadingVariant, setLoadingVariant] = useState<'default' | 'minimal' | 'fullscreen'>('default')
  
  const dropdownOptions = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'support', label: 'Technical Support' },
    { value: 'feedback', label: 'Feedback' },
    { value: 'bug', label: 'Bug Report' }
  ]

  const handleShowLoading = (variant: 'default' | 'minimal' | 'fullscreen') => {
    setLoadingVariant(variant)
    setShowLoading(true)
    setTimeout(() => setShowLoading(false), 3000)
  }
  
  const tabs = [
    {
      id: 'buttons',
      label: 'BUTTONS',
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="font-neo font-black text-xl mb-4 border-b-neo border-neo-border pb-2 text-neo-text">
              BUTTON VARIANTS
            </h3>
            <div className="flex flex-wrap gap-4">
              <Button variant="primary">PRIMARY</Button>
              <Button variant="secondary">SECONDARY</Button>
              <Button variant="accent">ACCENT</Button>
              <Button variant="outline">OUTLINE</Button>
              <Button variant="ghost">GHOST</Button>
              <Button variant="yellow">YELLOW</Button>
              <Button variant="purple">PURPLE</Button>
              <Button variant="lavender">LAVENDER</Button>
              <Button variant="teal">TEAL</Button>
            </div>
          </div>
          
          <div>
            <h3 className="font-neo font-black text-xl mb-4 border-b-neo border-neo-border pb-2 text-neo-text">
              BUTTON SIZES
            </h3>
            <div className="flex flex-wrap items-center gap-4">
              <Button size="sm">SMALL</Button>
              <Button size="md">MEDIUM</Button>
              <Button size="lg">LARGE</Button>
            </div>
          </div>
          
          <div>
            <h3 className="font-neo font-black text-xl mb-4 border-b-neo border-neo-border pb-2 text-neo-text">
              DISABLED STATE
            </h3>
            <div className="flex flex-wrap gap-4">
              <Button disabled>DISABLED</Button>
              <Button variant="outline" disabled>DISABLED OUTLINE</Button>
              <Button variant="ghost" disabled>DISABLED GHOST</Button>
            </div>
            <p className="font-neo text-sm text-gray-600 dark:text-gray-400 mt-2">
              Disabled buttons have reduced opacity and cannot be interacted with.
            </p>
          </div>
          
          <div>
            <h3 className="font-neo font-black text-xl mb-4 border-b-neo border-neo-border pb-2 text-neo-text">
              HOVER EFFECTS
            </h3>
            <div className="flex flex-wrap gap-4">
              <Button variant="outline">HOVER ME (OUTLINE)</Button>
              <Button variant="ghost">HOVER ME (GHOST)</Button>
              <Button variant="lavender">HOVER ME (LAVENDER)</Button>
            </div>
            <p className="font-neo text-sm text-gray-600 dark:text-gray-400 mt-2">
              Buttons have press-down hover effects with shadow changes.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'loading',
      label: 'LOADING',
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="font-neo font-black text-xl mb-4 border-b-neo border-neo-border pb-2 text-neo-text">
              LOADING OVERLAY VARIANTS
            </h3>
            <div className="flex flex-wrap gap-4">
              <Button 
                variant="primary" 
                onClick={() => handleShowLoading('default')}
              >
                SHOW DEFAULT
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => handleShowLoading('minimal')}
              >
                SHOW MINIMAL
              </Button>
              <Button 
                variant="accent" 
                onClick={() => handleShowLoading('fullscreen')}
              >
                SHOW FULLSCREEN
              </Button>
            </div>
            <p className="font-neo text-sm text-gray-600 dark:text-gray-400 mt-2">
              Click any button to see the loading overlay for 3 seconds. Each variant has different styling and behavior.
            </p>
          </div>
          
          <div>
            <h3 className="font-neo font-black text-xl mb-4 border-b-neo border-neo-border pb-2 text-neo-text">
              LOADING FEATURES
            </h3>
            <div className="bg-neo-surface dark:bg-neo-surface-dark p-4 border-neo border-neo-border shadow-neo">
              <ul className="font-neo text-neo-text space-y-2">
                <li>• <strong>Default:</strong> Card-style overlay with backdrop blur</li>
                <li>• <strong>Minimal:</strong> Lighter backdrop with smaller card</li>
                <li>• <strong>Fullscreen:</strong> Full background with progress bar</li>
                <li>• <strong>Animations:</strong> Spinning rings, bouncing dots, and pulsing effects</li>
                <li>• <strong>Dark Mode:</strong> Fully compatible with theme switching</li>
                <li>• <strong>Customizable:</strong> Custom messages and styling options</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'inputs',
      label: 'INPUTS',
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="font-neo font-black text-xl mb-4 border-b-neo border-neo-border pb-2 text-neo-text">
              INPUT VARIANTS
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input 
                label="DEFAULT INPUT" 
                placeholder="Enter text here..."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <Input 
                label="FILLED INPUT" 
                variant="filled"
                placeholder="Filled variant..."
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <Input 
                label="OUTLINE INPUT" 
                variant="outline"
                placeholder="Outline variant..."
              />
              <Input 
                label="ERROR INPUT" 
                placeholder="This has an error"
                error={inputError}
                value={inputError}
                onChange={(e) => setInputError(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <h3 className="font-neo font-black text-xl mb-4 border-b-neo border-neo-border pb-2 text-neo-text">
              INPUT SIZES
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input inputSize="sm" placeholder="Small input..." />
              <Input inputSize="md" placeholder="Medium input..." />
              <Input inputSize="lg" placeholder="Large input..." />
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'dropdowns',
      label: 'DROPDOWNS',
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="font-neo font-black text-xl mb-4 border-b-neo border-neo-border pb-2 text-neo-text">
              DROPDOWN EXAMPLES
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Dropdown
                label="SELECT CATEGORY"
                options={dropdownOptions}
                value={formData.category}
                onChange={(value) => setFormData({ ...formData, category: value })}
                placeholder="Choose a category..."
              />
              <Dropdown
                label="DISABLED DROPDOWN"
                options={dropdownOptions}
                disabled
                placeholder="This is disabled"
              />
            </div>
          </div>
          
          <div>
            <h3 className="font-neo font-black text-xl mb-4 border-b-neo border-neo-border pb-2 text-neo-text">
              SELECTED VALUE
            </h3>
            <div className="bg-neo-surface dark:bg-neo-surface-dark p-4 border-neo border-neo-border shadow-neo">
              <p className="font-neo text-neo-text">
                Selected category: <strong>{formData.category || 'None'}</strong>
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'form',
      label: 'FORM EXAMPLE',
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="font-neo font-black text-xl mb-4 border-b-neo border-neo-border pb-2 text-neo-text">
              CONTACT FORM
            </h3>
            <div className="space-y-4">
              <Input 
                label="NAME" 
                placeholder="Your name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <Input 
                label="EMAIL" 
                type="email"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <Dropdown
                label="CATEGORY"
                options={dropdownOptions}
                value={formData.category}
                onChange={(value) => setFormData({ ...formData, category: value })}
                placeholder="Select category..."
              />
              <div>
                <label className="block font-neo font-bold text-neo-text text-sm mb-2">
                  MESSAGE
                </label>
                <textarea
                  className="w-full font-neo border-neo border-neo-border shadow-neo bg-white dark:bg-neo-surface-dark px-5 py-3 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neo-accent focus:border-neo-accent text-neo-text"
                  rows={4}
                  placeholder="Your message..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>
              <div className="flex gap-4">
                <Button variant="primary" size="lg">
                  SUBMIT FORM
                </Button>
                <Button variant="outline" size="lg">
                  RESET
                </Button>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-neo font-black text-xl mb-4 border-b-neo border-neo-border pb-2 text-neo-text">
              FORM DATA
            </h3>
            <div className="bg-neo-surface dark:bg-neo-surface-dark p-4 border-neo border-neo-border shadow-neo">
              <pre className="font-neo-mono text-sm text-neo-text">
                {JSON.stringify(formData, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )
    }
  ]
  
  return (
    <div className="max-w-6xl mx-auto">
      <Tabs tabs={tabs} defaultTab="buttons" />
      
      {/* Loading Overlay */}
      <LoadingOverlay 
        isVisible={showLoading}
        message={loadingVariant === 'fullscreen' ? 'Processing your request...' : 'Loading...'}
        variant={loadingVariant}
      />
    </div>
  )
}

export default ComponentsPage 