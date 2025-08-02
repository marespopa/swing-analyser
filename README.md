# Swing Trading Cryptocurrency Analyzer

A comprehensive React application for analyzing cryptocurrency swing trading opportunities using technical indicators and real-time market data.

## Features

- **Real-time Market Data**: Top cryptocurrencies with live price updates
- **Technical Analysis**: 50/200 EMA crossovers, RSI, MACD, Bollinger Bands
- **Swing Trading Signals**: Advanced scoring system with quality indicators
- **Short-term Predictions**: 4-hour and 1-day price momentum analysis
- **Rate Limiting**: Smart API management with 30 requests/minute limit
- **Auto-refresh**: 5-minute automatic data updates
- **Responsive Design**: Works on desktop and mobile devices

## Environment Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure API Key
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Get your CoinGecko API key from [CoinGecko API Pricing](https://www.coingecko.com/en/api/pricing)

3. Update `.env` with your API key:
   ```
   VITE_COINGECKO_API_KEY=your_actual_api_key_here
   ```

### 3. Start Development Server
```bash
npm run dev
```

## API Configuration

The application uses the CoinGecko API with the following features:
- **Rate Limit**: 30 requests per minute
- **Data Sources**: Market data, historical prices, technical indicators
- **Authentication**: API key required for enhanced rate limits

## Technical Indicators

- **EMA Crossovers**: 50/200 Exponential Moving Average analysis
- **RSI**: Relative Strength Index for momentum
- **MACD**: Moving Average Convergence Divergence
- **Bollinger Bands**: Volatility and price channel analysis
- **Support/Resistance**: Key price level identification
- **Volume Analysis**: Trading volume momentum

## Development

This project uses:
- **React 18** with Vite for fast development
- **Tailwind CSS** for styling
- **CoinGecko API** for market data
- **Custom algorithms** for technical analysis

## Security

- API keys are stored in `.env` files (not committed to git)
- Rate limiting prevents API abuse
- Error handling for network issues
