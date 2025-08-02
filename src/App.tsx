import { useState, useEffect } from 'react';
import { Provider } from 'jotai';
import Header from './components/Header';
import TabNavigation from './components/TabNavigation';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorBanner from './components/ErrorBanner';
import MarketOverview from './components/MarketOverview';
import ProcessingStatus from './components/ProcessingStatus';
import SwingStrategy from './components/SwingStrategy';
import AnalysisSummary from './components/AnalysisSummary';
import SwingAnalysisSummary from './components/SwingAnalysisSummary';
import SwingSignals from './components/SwingSignals';
import TradeLog from './components/TradeLog';
import Button from './components/Button';
import { useCoinData } from './hooks/useCoinData';
import { useAutoRefresh } from './hooks/useAutoRefresh';
import { CoinGeckoAPI } from './utils/api';
import { useSwingAnalysis } from './hooks/useSwingAnalysis';
import { getErrorMessage } from './utils/errorMessages';

function App() {
  const [activeTab, setActiveTab] = useState<'market' | 'swing' | 'trades'>('market');
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
    getMarketSentiment,
    getSentimentColor,
    getSentimentIcon
  } = useCoinData();

  const {
    setLastRefresh,
    autoRefreshEnabled,
    countdown,
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
  } = useSwingAnalysis(coins as any, activeTab);

  // Manual refresh function
  const handleManualRefresh = async () => {
    setLoading(true);
    setApiError(null);
    setLastRefresh(new Date());

    try {
      const data = await fetchTop100Coins();
      setCoins(data);

      // If on swing tab, recalculate signals
      if (activeTab === 'swing') {
        recalculateSignals(); // Recalculate swing signals with new data
      }
    } catch (error: any) {
      setApiError('network');
    } finally {
      setLoading(false);
    }
  };

  // Handle retry action
  const handleRetry = () => {
    setApiError(null);
    if (activeTab === 'swing') {
      // Recalculate swing signals
      // This would need to be implemented based on your swing analysis logic
    } else {
      window.location.reload();
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading top 100 cryptocurrencies..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <Header
          loading={loading}
          coins={coins}
          activeTab={activeTab}
          swingSignals={swingSignals}
          allAnalyzedCoins={allAnalyzedCoins}
          getMarketSentiment={getMarketSentiment}
          getSentimentColor={getSentimentColor}
          getSentimentIcon={getSentimentIcon}
        />

        <TabNavigation activeTab={activeTab} setActiveTab={(tab: string) => setActiveTab(tab as 'market' | 'swing' | 'trades')} />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'market' ? (
          <MarketOverview
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            timeframe={timeframe}
            setTimeframe={setTimeframe}
            sortBy={sortBy}
            sortOrder={sortOrder}
            handleSort={handleSort}
            filteredCoins={filteredCoins}
            coins={coins}
            loading={loading}
            emaLoading={emaLoading}
            handleManualRefresh={handleRefresh}
            autoRefreshEnabled={autoRefreshEnabled}
            toggleAutoRefresh={toggleAutoRefresh}
            getTimeSinceRefresh={getTimeSinceRefresh}
            countdown={countdown}
            rateLimitInfo={rateLimitInfo}
            MAX_REQUESTS_PER_MINUTE={MAX_REQUESTS_PER_MINUTE}
          />
        ) : activeTab === 'trades' ? (
          <TradeLog />
        ) : (
          <>
            {/* API Error Banner */}
            <ErrorBanner errorType={apiError} getErrorMessage={getErrorMessage} handleRetry={handleRetry} />

            {/* Swing Strategy Content */}
            <SwingStrategy
              emaLoading={emaLoading}
              swingSignals={swingSignals}
              allAnalyzedCoins={allAnalyzedCoins}
              loading={loading}
              onRefresh={handleRefresh}
              onRecalculateSignals={recalculateSignals}
              autoRefreshEnabled={autoRefreshEnabled}
              onToggleAutoRefresh={toggleAutoRefresh}
              getTimeSinceRefresh={getTimeSinceRefresh}
              countdown={countdown}
              rateLimitInfo={rateLimitInfo}
              MAX_REQUESTS_PER_MINUTE={MAX_REQUESTS_PER_MINUTE}
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

            {/* Swing Analysis Summary */}
            <SwingAnalysisSummary
              totalCoins={coins.length}
              analyzedCoins={allAnalyzedCoins}
              swingSignals={swingSignals}
              isVisible={!emaLoading && allAnalyzedCoins.length > 0}
            />

            {/* Swing Analysis Results */}
            <SwingSignals
              swingSignals={swingSignals}
              allAnalyzedCoins={allAnalyzedCoins}
              emaLoading={emaLoading}
            />
          </>
        )}
        </main>
      </div>
    </Provider>
  );
}

export default App; 