import { useState, useEffect } from 'react';
import { Provider } from 'jotai';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import TabNavigation from './components/TabNavigation';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorBanner from './components/ErrorBanner';
import MarketOverview from './components/MarketOverview';
import ProcessingStatus from './components/ProcessingStatus';
import SwingStrategy from './components/SwingStrategy';
import AnalysisSummary from './components/AnalysisSummary';
import SwingSignals from './components/SwingSignals';
import TradeLog from './components/TradeLog';
import Button from './components/Button';
import { useCoinData } from './hooks/useCoinData';
import { useAutoRefresh } from './hooks/useAutoRefresh';
import { CoinGeckoAPI } from './utils/api';
import { useSwingAnalysis } from './hooks/useSwingAnalysis';
import { getErrorMessage } from './utils/errorMessages';

function App() {
  const [apiError, setApiError] = useState<string | null>(null);

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

  // Use swing analysis hook
  const {
    emaLoading,
    setEmaLoading,
    swingSignals,
    allAnalyzedCoins,
    recalculateSignals,
    progress
  } = useSwingAnalysis(coins as any);

  // Manual refresh function
  const handleManualRefresh = async () => {
    setLoading(true);
    setApiError(null);
    setLastRefresh(new Date());

    try {
      const data = await fetchTop100Coins();
      setCoins(data);

      // Always recalculate signals since we're using routing
      recalculateSignals();
    } catch (error: any) {
      setApiError('network');
    } finally {
      setLoading(false);
    }
  };

  // Handle retry action
  const handleRetry = () => {
    setApiError(null);
    window.location.reload();
  };

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
    <Provider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100">
          <Header
            loading={loading}
            coins={coins}
            swingSignals={swingSignals}
            allAnalyzedCoins={allAnalyzedCoins}
            getMarketSentiment={getMarketSentiment}
            getSentimentIcon={getSentimentIcon}
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
                  emaLoading={emaLoading}
                  handleManualRefresh={handleRefresh}
                  autoRefreshEnabled={autoRefreshEnabled}
                  toggleAutoRefresh={toggleAutoRefresh}
                  getTimeSinceRefresh={getTimeSinceRefresh}
                  rateLimitInfo={rateLimitInfo}
                  MAX_REQUESTS_PER_MINUTE={MAX_REQUESTS_PER_MINUTE}
                />
              } />

              {/* Swing Strategy Route */}
              <Route path="/swing" element={
                <>
                  {/* API Error Banner */}
                  <ErrorBanner errorType={apiError} getErrorMessage={getErrorMessage} handleRetry={handleRetry} />

                  {/* Swing Strategy Content */}
                  <SwingStrategy
                    emaLoading={emaLoading}
                    swingSignals={swingSignals}
                    allAnalyzedCoins={allAnalyzedCoins}
                  />

                  {/* Enhanced Loading State with Progress */}
                  <ProcessingStatus
                    emaLoading={emaLoading}
                    onCancel={() => setEmaLoading(false)}
                    realProgress={progress}
                  />

                  {/* Analysis Summary */}
                  <AnalysisSummary
                    swingSignals={swingSignals}
                    allAnalyzedCoins={allAnalyzedCoins}
                  />

                  {/* Swing Analysis Results */}
                  <SwingSignals
                    swingSignals={swingSignals}
                    allAnalyzedCoins={allAnalyzedCoins}
                    emaLoading={emaLoading}
                  />
                </>
              } />

              {/* Trade Log Route */}
              <Route path="/trades" element={<TradeLog />} />

              {/* Default redirect to market */}
              <Route path="/" element={<Navigate to="/market" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </Provider>
  );
}

export default App; 