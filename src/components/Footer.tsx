import React from 'react'
import { Link } from 'react-router-dom'

const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Brand */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Swing Analyzer
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Advanced cryptocurrency technical analysis and pattern detection platform.
            </p>
          </div>

          {/* Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
              Legal
            </h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/legal-terms" 
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Disclaimer */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
              Important Notice
            </h4>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
              <p className="text-xs text-yellow-800 dark:text-yellow-200 font-medium mb-1">
                ⚠️ NOT FINANCIAL ADVICE
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300">
                This platform provides technical analysis for educational purposes only. 
                Not investment advice. Always DYOR (Do Your Own Research) before investing.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              © {new Date().getFullYear()} Swing Analyzer. All rights reserved.
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Cryptocurrency investments carry high risk. Never invest more than you can afford to lose.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
