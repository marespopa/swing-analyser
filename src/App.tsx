import { useState, useEffect } from 'react';
import { Provider } from 'jotai';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import TabNavigation from './components/TabNavigation';
import LoadingSpinner from './components/LoadingSpinner';
import MarketOverview from './components/MarketOverview';
import TradeLog from './components/TradeLog';
import SetupWizard from './components/SetupWizard';
import Button from './components/Button';
import { useCoinData } from './hooks/useCoinData';
import { useAutoRefresh } from './hooks/useAutoRefresh';
import { CoinGeckoAPI } from './utils/api';
import { useSwingAnalysis } from './hooks/useSwingAnalysis';

// Separate component to use useLocation hook
const AppContent: React.FC = () => {
  const [showSetupWizard, setShowSetupWizard] = useState(() => {
    // Check if setup is complete
    const setupComplete = localStorage.getItem('swingAnalyserSetupComplete');
    return !setupComplete;
  });
  
  // Use custom hooks
  const {
    coins,
    setCoins,
    filteredCoins,
    loading,
    setLoading,
    error,
    searchTerm,
    setSearchTerm,
    sortBy,
    sortOrder,
    timeframe,
    setTimeframe,
    fetchTop100Coins,
    handleSort,
    toggleSortOrder,
    getMarketSentiment,
    getSentimentIcon
  } = useCoinData();

  const {
    setLastRefresh,
    autoRefreshEnabled,
    handleManualRefresh: handleRefresh,
    toggleAutoRefresh,
    getTimeSinceRefresh
  } = useAutoRefresh(async () => {
    await handleManualRefresh();
  });

  const api = CoinGeckoAPI.getInstance();
  const MAX_REQUESTS_PER_MINUTE = 30;
  const [rateLimitInfo, setRateLimitInfo] = useState(api.getRateLimitInfo());

  // Update rate limit info periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setRateLimitInfo(api.getRateLimitInfo());
    }, 500); // Update every 500ms for more responsive counter

    return () => clearInterval(interval);
  }, []);

  // Use swing analysis hook for individual coin analysis
  const {
    analyzeIndividualCoin,
    individualAnalysisLoading,
    individualAnalysisResult,
    setIndividualAnalysisResult
  } = useSwingAnalysis(coins as any);

  // Manual refresh function
  const handleManualRefresh = async () => {
    setLoading(true);
    setLastRefresh(new Date());

    try {
      const data = await fetchTop100Coins();
      setCoins(data);

      // No need to recalculate signals since we're using on-demand analysis
    } catch (error: any) {
      console.error('Error refreshing data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Show setup wizard if not completed
  if (showSetupWizard) {
    return <SetupWizard onComplete={() => setShowSetupWizard(false)} />;
  }

  if (loading) {
    return <LoadingSpinner message="Loading cryptocurrencies..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            variant="primary"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100">
      {/* Show Header and TabNavigation for all routes */}
      <Header
        loading={loading}
        coins={coins}
        getMarketSentiment={getMarketSentiment}
        getSentimentIcon={getSentimentIcon}
        onOpenSettings={() => setShowSetupWizard(true)}
      />
      <TabNavigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          {/* Market Overview Route */}
          <Route path="/market" element={
            <MarketOverview
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              timeframe={timeframe}
              setTimeframe={setTimeframe}
              sortBy={sortBy}
              sortOrder={sortOrder}
              handleSort={handleSort}
              toggleSortOrder={toggleSortOrder}
              filteredCoins={filteredCoins}
              coins={coins}
              loading={loading}

              handleManualRefresh={handleRefresh}
              autoRefreshEnabled={autoRefreshEnabled}
              toggleAutoRefresh={toggleAutoRefresh}
              getTimeSinceRefresh={getTimeSinceRefresh}
              rateLimitInfo={rateLimitInfo}
              MAX_REQUESTS_PER_MINUTE={MAX_REQUESTS_PER_MINUTE}
              analyzeIndividualCoin={analyzeIndividualCoin}
              individualAnalysisLoading={individualAnalysisLoading}
              individualAnalysisResult={individualAnalysisResult}
              setIndividualAnalysisResult={setIndividualAnalysisResult}
            />
          } />

          {/* Trade Log Route */}
          <Route path="/trades" element={<TradeLog />} />

          {/* Default redirect to market page */}
          <Route path="/" element={<Navigate to="/market" replace />} />
        </Routes>
      </main>

      {/* Footer with CoinGecko Credit */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-2 mb-2 sm:mb-0">
              <span>Powered by</span>
              <a 
                href="https://www.coingecko.com/en/api" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-medium transition-colors duration-200"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                CoinGecko API
              </a>
            </div>
            <div className="flex items-center gap-4">
              <span>High-quality crypto market data</span>
              <span>•</span>
              <span>Swing Trading Analysis</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

function App() {
  return (
    <Provider>
      <Router>
        <AppContent />
      </Router>
    </Provider>
  );
}

export default App; 