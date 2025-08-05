import React from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'

const DisclaimerPage: React.FC = () => {
  const navigate = useNavigate()

  const handleBackToApp = () => {
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-neo-surface dark:bg-neo-surface-dark">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-neo font-black text-neo-text mb-4">
            LEGAL DISCLAIMER & TERMS OF USE
          </h1>
          <p className="text-lg font-neo text-neo-text/80">
            Effective Date: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Content */}
        <div className="bg-neo-surface dark:bg-neo-surface-dark border-neo border-neo-border p-8 shadow-neo rounded-neo-lg space-y-8">
          
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-neo font-black text-neo-text mb-4">
              Introduction
            </h2>
            <div className="space-y-4 text-neo-text/80">
              <p>
                Welcome to Swing Analyser, your dedicated platform for cryptocurrency portfolio analysis and market sentiment evaluation. 
                By visiting our site and using our services, you agree to comply with the terms and conditions outlined in this document.
              </p>
              <p>
                <strong>Purpose of the Site:</strong> The mission of Swing Analyser is to provide portfolio allocation strategies, 
                market sentiment analysis, and educational content on various cryptocurrencies. Our analyses aim to enlighten and 
                inform our users about current market dynamics and portfolio management strategies.
              </p>
              <p className="font-bold text-neo-text">
                IMPORTANT: Swing Analyser does not provide direct investment advice or buy/sell recommendations. 
                We encourage our users to conduct their own research ("Do Your Own Research" - DYOR) before making any investment decisions.
              </p>
            </div>
          </section>

          {/* Key Terms */}
          <section>
            <h2 className="text-2xl font-neo font-black text-neo-text mb-4">
              Definition of Key Terms
            </h2>
            <div className="space-y-2 text-neo-text/80">
              <p><strong>"We", "Our", "Swing Analyser"</strong> refer to the Swing Analyser platform.</p>
              <p><strong>"User", "You"</strong> refers to any person who visits or uses the services offered by Swing Analyser.</p>
              <p><strong>"Services"</strong> includes access to our portfolio analysis, market sentiment tools, educational content, and any other features offered by Swing Analyser.</p>
            </div>
          </section>

          {/* Acceptance of Terms */}
          <section>
            <h2 className="text-2xl font-neo font-black text-neo-text mb-4">
              Acceptance of Terms
            </h2>
            <div className="space-y-4 text-neo-text/80">
              <p>
                By accessing Swing Analyser, browsing our site, or using our services in any way, you acknowledge having read, 
                understood, and agreed to be bound by these terms of use ("Terms"). These Terms constitute a legal agreement 
                between you and Swing Analyser.
              </p>
              <p>
                <strong>Modification of Terms:</strong> Swing Analyser reserves the right to modify or update these Terms at any time. 
                Your continued use of Swing Analyser after modifications indicates your acceptance of these changes.
              </p>
            </div>
          </section>

          {/* Services Description */}
          <section>
            <h2 className="text-2xl font-neo font-black text-neo-text mb-4">
              Services Description
            </h2>
            <div className="space-y-4 text-neo-text/80">
              <p>Swing Analyser provides users with a suite of services for cryptocurrency portfolio analysis:</p>
              
              <div className="space-y-3">
                <div>
                  <h3 className="font-neo font-bold text-neo-text mb-2">Portfolio Generation</h3>
                  <p>Automated portfolio allocation based on risk profiles (conservative, balanced, aggressive) using current market data.</p>
                </div>
                
                <div>
                  <h3 className="font-neo font-bold text-neo-text mb-2">Market Sentiment Analysis</h3>
                  <p>Real-time market sentiment evaluation including fear & greed index, volatility analysis, and market signals.</p>
                </div>
                
                <div>
                  <h3 className="font-neo font-bold text-neo-text mb-2">Dynamic Allocation</h3>
                  <p>Portfolio adjustments based on current market conditions and sentiment indicators.</p>
                </div>
                
                <div>
                  <h3 className="font-neo font-bold text-neo-text mb-2">Educational Content</h3>
                  <p>Portfolio strategy guides and cryptocurrency investment education materials.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Investment Disclaimer */}
          <section>
            <h2 className="text-2xl font-neo font-black text-neo-text mb-4">
              Investment Disclaimer
            </h2>
            <div className="space-y-4 text-neo-text/80">
              <p className="font-bold text-red-600 dark:text-red-400">
                NO INVESTMENT ADVICE: The information provided on Swing Analyser is for educational and informational purposes only. 
                It is not intended to be and should not be construed as investment advice, financial advice, trading advice, or any other type of advice.
              </p>
              
              <p>
                <strong>Not Financial Advice:</strong> Swing Analyser does not offer personalized investment advice or advice specific to an individual situation. 
                The content published on our site is for informational purposes only and should not be interpreted as an encouragement to buy or sell digital assets.
              </p>
              
              <p>
                <strong>High Risk Investment:</strong> Investment decisions and transactions in the cryptocurrency markets involve high risks and should be made with full knowledge of the facts. 
                Cryptocurrencies are characterized by significant volatility and a high risk of loss.
              </p>
              
              <p>
                <strong>Responsible Investing:</strong> We remind our users of the fundamental principle of responsible investment: 
                never invest more than you can afford to lose. Before making any investment, carefully assess your financial situation, 
                consider your risk tolerance level, and seek advice from independent financial advisors if necessary.
              </p>
            </div>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-neo font-black text-neo-text mb-4">
              Limitation of Liability
            </h2>
            <div className="space-y-4 text-neo-text/80">
              <p>
                <strong>General:</strong> Swing Analyser strives to provide quality information and analyses concerning cryptocurrencies, 
                but we do not guarantee the accuracy, relevance, reliability, or completeness of the information available on our site.
              </p>
              
              <p>
                <strong>Investment Decisions:</strong> Investment decisions are made at your own risk. Swing Analyser will not be liable for any losses 
                or damages of any kind resulting from the use of the information provided on the site.
              </p>
              
              <p>
                <strong>Market Risks:</strong> The cryptocurrency market is volatile and unpredictable. Past performance is not indicative of future results. 
                Swing Analyser assumes no responsibility for any capital or investment loss you may suffer due to market fluctuations.
              </p>
              
              <p>
                <strong>Data Sources:</strong> The financial analyses and price data presented on Swing Analyser are based on information retrieved 
                from CoinGecko API and other market data providers. While we strive to ensure accuracy, we depend on external data sources 
                and cannot be held responsible for any possible failures, inaccuracies, or delays in the data provided.
              </p>
            </div>
          </section>

          {/* Use Restrictions */}
          <section>
            <h2 className="text-2xl font-neo font-black text-neo-text mb-4">
              Use Restrictions
            </h2>
            <div className="space-y-4 text-neo-text/80">
              <p>All users of Swing Analyser are required to adhere to the following restrictions:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>The information and analyses provided are intended for general information purposes only and should not be interpreted as investment advice.</li>
                <li>Users are not allowed to redistribute, sell, rent, or sublicense Swing Analyser's content without express permission.</li>
                <li>The use of our services for fraudulent, illegal, or unethical activities is strictly prohibited.</li>
                <li>Users must conduct their own research before making investment decisions.</li>
                <li>Users should never invest more than they can afford to lose.</li>
              </ul>
            </div>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-2xl font-neo font-black text-neo-text mb-4">
              Intellectual Property
            </h2>
            <div className="space-y-4 text-neo-text/80">
              <p>
                The content of Swing Analyser, including texts, graphics, logos, and software, is the property of Swing Analyser 
                and is protected by intellectual property laws. Users are granted a limited, non-exclusive license to access and use 
                the site for personal, non-commercial use.
              </p>
            </div>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-neo font-black text-neo-text mb-4">
              Contact Information
            </h2>
            <div className="space-y-4 text-neo-text/80">
              <p>
                For any questions regarding these terms or our services, please contact us through the application's support channels.
              </p>
            </div>
          </section>

          {/* Back to App */}
          <div className="text-center pt-8 border-t border-neo-text/20">
            <Button
              onClick={handleBackToApp}
              variant="primary"
              size="lg"
            >
              Back to Application
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DisclaimerPage 