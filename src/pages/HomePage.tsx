import { atom, useAtom } from 'jotai'
import axios from 'axios'
import { useState, useEffect } from 'react'

// Jotai atom for state management
const countAtom = atom(0)

function HomePage() {
  const [count, setCount] = useAtom(countAtom)
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  // Example API call with Axios
  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await axios.get('https://jsonplaceholder.typicode.com/posts/1')
      setData(response.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <>
      {/* Main Content */}
      <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Counter Section */}
        <section className="bg-neo-surface dark:bg-neo-surface-dark border-neo border-neo-border shadow-neo p-6">
          <h2 className="text-2xl font-neo font-black mb-4 border-b-neo border-neo-border pb-2 text-neo-text">
            COUNTER
          </h2>
          <div className="space-y-4">
            <p className="text-3xl font-neo font-bold text-center text-neo-text">
              {count}
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setCount(c => c - 1)}
                className="bg-neo-secondary text-white px-6 py-3 font-neo font-bold border-neo border-neo-border shadow-neo hover-press focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neo-secondary"
              >
                DECREASE
              </button>
              <button 
                onClick={() => setCount(c => c + 1)}
                className="bg-neo-accent text-white px-6 py-3 font-neo font-bold border-neo border-neo-border shadow-neo hover-press focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neo-accent"
              >
                INCREASE
              </button>
            </div>
          </div>
        </section>

        {/* API Data Section */}
        <section className="bg-neo-surface dark:bg-neo-surface-dark border-neo border-neo-border shadow-neo p-6">
          <h2 className="text-2xl font-neo font-black mb-4 border-b-neo border-neo-border pb-2 text-neo-text">
            API DATA
          </h2>
          <div className="space-y-4">
            {loading ? (
              <p className="font-neo text-neo-text">LOADING...</p>
            ) : data ? (
              <div className="prose prose-neo">
                <h3 className="text-xl font-neo font-black text-neo-text">{data.title}</h3>
                <p className="font-neo text-neo-text">{data.body}</p>
                <p className="text-sm font-neo text-gray-600 dark:text-gray-400">ID: {data.id}</p>
              </div>
            ) : (
              <p className="font-neo text-neo-text">NO DATA</p>
            )}
            <button 
              onClick={fetchData}
              className="bg-neo-primary text-white px-6 py-3 font-neo font-bold border-neo border-neo-border shadow-neo hover-press focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neo-primary"
            >
              REFRESH DATA
            </button>
          </div>
        </section>
      </main>

      {/* Typography Example */}
      <section className="mt-8 bg-neo-surface dark:bg-neo-surface-dark border-neo border-neo-border shadow-neo p-6">
        <h2 className="text-2xl font-neo font-black mb-4 border-b-neo border-neo-border pb-2 text-neo-text">
          TYPOGRAPHY EXAMPLE
        </h2>
        <div className="prose prose-neo">
          <h3 className="text-neo-text">This is a heading with neo-brutalism typography</h3>
          <p className="text-neo-text">
            This is a paragraph demonstrating the neo-brutalism design approach. 
            Notice the soft colors, rounded corners, and modern typography while maintaining bold, honest design principles.
          </p>
          <ul className="text-neo-text">
            <li>Soft, friendly color palette</li>
            <li>Rounded corners and shadows</li>
            <li>Modern typography (Inter font)</li>
            <li>Interactive hover effects</li>
            <li>Dark mode support</li>
            <li>React Router navigation</li>
          </ul>
          <blockquote className="text-neo-text">
            "Neo-brutalism combines the bold honesty of brutalism with modern design sensibilities, 
            creating interfaces that are both striking and approachable."
          </blockquote>
          <p className="text-neo-text">
            Code examples use <code>monospace fonts</code> with high contrast backgrounds 
            for maximum readability in both light and dark modes.
          </p>
        </div>
      </section>
    </>
  )
}

export default HomePage 