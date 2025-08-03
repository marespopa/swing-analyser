# Swing Trading Cryptocurrency Analyzer

A comprehensive React application for analyzing cryptocurrency swing trading opportunities using technical indicators and real-time market data.

## Features

- **Real-time Market Data**: Top cryptocurrencies with live price updates
- **Technical Analysis**: 50/200 EMA crossovers, RSI, MACD, Bollinger Bands
- **Swing Trading Signals**: Advanced scoring system with quality indicators
- **Actionable Recommendations**: Clear BUY/WAIT/MONITOR signals with reasoning
- **Entry & Exit Strategy**: Specific stop loss and take profit levels
- **Rate Limiting**: Smart API management with 30 requests/minute limit
- **Auto-refresh**: 5-minute automatic data updates
- **Responsive Design**: Works on desktop and mobile devices
- **UI Configuration**: Add CoinGecko API key directly in the app settings

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Configure API Key (Optional but Recommended)
1. Click the settings icon (⚙️) in the top-right corner
2. Enter your CoinGecko API key in the setup wizard
3. Get your API key from [CoinGecko API Pricing](https://www.coingecko.com/en/api/pricing)

**Note**: The app works without an API key using the free tier, but an API key provides:
- Higher rate limits (up to 50 calls/minute)
- Access to historical data
- Priority support
- More detailed market data

## API Configuration

The application uses the CoinGecko API with the following features:
- **Rate Limit**: 30 requests per minute (free tier) or 50 requests/minute (with API key)
- **Data Sources**: Market data, historical prices, technical indicators
- **Authentication**: API key stored securely in browser localStorage
- **Fallback**: Works with or without API key

## Trading Analysis Features

### Action Signals
- **BUY NOW**: Strong technical setup with positive momentum
- **WAIT**: Unfavorable conditions - wait for better setup
- **MONITOR**: Mixed signals - wait for clearer direction

### Entry & Exit Strategy
- **Entry Analysis**: Optimal timing and conditions for entry
- **Target/Stop Loss**: Specific price levels for risk management
- **Risk/Reward Ratio**: Clear 3:1 risk/reward targets
- **Support/Resistance**: Key price levels for decision making

### Technical Indicators
- **EMA Crossovers**: 50/200 Exponential Moving Average analysis
- **RSI**: Relative Strength Index for momentum
- **MACD**: Moving Average Convergence Divergence
- **Bollinger Bands**: Volatility and price channel analysis
- **Support/Resistance**: Key price level identification
- **Volume Analysis**: Trading volume momentum

## Development

This project uses:
- **React 18** with Vite for fast development
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **CoinGecko API** for market data
- **Custom algorithms** for technical analysis
- **Jotai** for state management

## Security

- API keys are stored securely in browser localStorage
- Rate limiting prevents API abuse
- Error handling for network issues
- No sensitive data sent to external servers

## Usage

1. **Market Overview**: View top cryptocurrencies with real-time data
2. **Individual Analysis**: Click on any coin to get detailed swing trading analysis
3. **Search & Filter**: Use the search bar to find specific coins
4. **Trade Log**: Track your trades and performance
5. **Settings**: Configure API key and preferences via the settings icon

## Contributing

Feel free to submit issues and enhancement requests!
