import React from 'react'
import { useNavigate } from 'react-router-dom'

const LegalTermsPage: React.FC = () => {
  const navigate = useNavigate()

  const handleBack = () => {
    navigate(-1)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleBack}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Legal Terms and Conditions
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Effective Date: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          <div className="prose prose-gray dark:prose-invert max-w-none">
            
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Introduction</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Welcome to Swing Analyzer, your dedicated platform for cryptocurrency technical analysis. By visiting our site and using our services, you agree to comply with the terms and conditions outlined in this document. These terms are important for both you and us, as they define our mutual responsibilities and provide essential information on how our services may be utilized.
            </p>

            <p className="text-gray-700 dark:text-gray-300 mb-6">
              <strong>Purpose of the Site:</strong> The mission of Swing Analyzer is to provide technical analysis and pattern detection on various cryptocurrencies. Our analyses aim to enlighten and inform our users about the current dynamics of the cryptocurrency market. It is important to note that Swing Analyzer does not provide direct investment advice or buy/sell recommendations. We encourage our users to conduct their own research ("Do Your Own Research" - DYOR) before making any investment decisions.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Important Disclaimer</h2>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 mb-6">
              <p className="text-yellow-800 dark:text-yellow-200 font-semibold mb-2">
                ⚠️ NOT FINANCIAL ADVICE
              </p>
              <p className="text-yellow-700 dark:text-yellow-300">
                The information and analyses provided by Swing Analyzer are intended for general information purposes only and should not be interpreted as investment advice. All content published on our site is for informational purposes only and should not in any case be interpreted as an encouragement to buy or sell digital assets. Investment decisions and transactions in the cryptocurrency markets involve high risks and should be made with full knowledge of the facts.
              </p>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Risk Warning</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              <strong>Responsible Investing:</strong> Investments in cryptocurrencies are characterized by significant volatility and a high risk of loss. We remind our users of the fundamental principle of responsible investment: never invest more than you can afford to lose. Before making any investment, we encourage you to carefully assess your financial situation, consider your risk tolerance level, and seek advice from independent financial advisors if necessary.
            </p>

            <p className="text-gray-700 dark:text-gray-300 mb-6">
              <strong>Market Risks:</strong> The cryptocurrency market is volatile and unpredictable. Past performance is not indicative of future results. Swing Analyzer assumes no responsibility for any capital or investment loss you may suffer due to market fluctuations.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Limitation of Liability</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Swing Analyzer strives to provide quality information and analyses concerning cryptocurrencies, but we do not guarantee the accuracy, relevance, reliability, or completeness of the information available on our site. The information provided is intended for general information purposes only and does not constitute investment or financial advice.
            </p>

            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Investment decisions are made at your own risk. Swing Analyzer and its developers will not be liable for any losses or damages of any kind resulting from the use of the information provided on the site, including but not limited to loss of income, profit, use, data, or direct, indirect, incidental, punitive, and consequential damages.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Data Sources</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              The technical analyses and price data presented on Swing Analyzer are based on information retrieved from various cryptocurrency data providers. Although Swing Analyzer strives to ensure the accuracy and updating of the information and analyses offered, we depend on external data sources. Consequently, Swing Analyzer cannot be held responsible for any possible failures, inaccuracies, or delays in the data provided by these sources.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Use Restrictions</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              All users of Swing Analyzer are required to adhere to the following restrictions when using our services:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-6 space-y-2">
              <li>The information and analyses provided are intended for general information purposes only and should not be interpreted as investment advice.</li>
              <li>Users are not allowed to redistribute, sell, rent, or sublicense Swing Analyzer's content without express permission.</li>
              <li>The use of our services for fraudulent, illegal, or unethical activities is strictly prohibited.</li>
              <li>Users must conduct their own research before making investment decisions.</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Intellectual Property</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              The content of Swing Analyzer, including but not limited to, texts, graphics, logos, icons, images, and software, is the property of Swing Analyzer and is protected by intellectual property laws. Users are allowed to display and use the site for personal use only. Any commercial use of the site's content without prior written permission is strictly prohibited.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Modification of Terms</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Swing Analyzer reserves the right to modify or update these Terms at any time without notice. Any changes made to the Terms will take effect immediately after their publication on our site. Your continued use of Swing Analyzer after the posting of modifications indicates your acceptance of these changes.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Contact</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              For any questions, inquiries, or need for assistance regarding our site or services, please contact us:
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              Email: support@swinganalyzer.com
            </p>

            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                By using Swing Analyzer, you acknowledge that you have read, understood, and agree to be bound by these terms and conditions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LegalTermsPage
