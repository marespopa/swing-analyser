export interface PortfolioStrategy {
  name: string
  description: string
  allocations: {
    bitcoin: number
    ethereum: number
    altcoins: number
    stablecoins: number
    speculative: number
  }
  characteristics: string[]
  suitableFor: string[]
  risks: string[]
  benefits: string[]
}

export interface PortfolioEducation {
  strategies: PortfolioStrategy[]
  principles: string[]
  tips: string[]
}

export class PortfolioEducationService {
  static getPortfolioStrategies(): PortfolioEducation {
    return {
      strategies: [
        {
          name: 'Conservative',
          description: 'A conservative portfolio prioritizes stability and capital preservation, consisting mostly of large-cap cryptocurrencies and stablecoins.',
          allocations: {
            bitcoin: 50,
            ethereum: 30,
            altcoins: 0,
            stablecoins: 20,
            speculative: 0
          },
          characteristics: [
            'Focus on established cryptocurrencies',
            'High allocation to Bitcoin and Ethereum',
            'Includes stablecoins for stability',
            'Minimal exposure to altcoins'
          ],
          suitableFor: [
            'Investors seeking capital preservation',
            'Those with low risk tolerance',
            'Long-term holders',
            'Retirement planning'
          ],
          risks: [
            'Lower growth potential',
            'May underperform in bull markets',
            'Still subject to crypto market volatility'
          ],
          benefits: [
            'Reduced volatility',
            'Capital preservation',
            'Liquidity through stablecoins',
            'Established track record'
          ]
        },
        {
          name: 'Balanced',
          description: 'A balanced portfolio combines established assets with modest allocation to altcoins for higher growth potential, balancing risk and reward.',
          allocations: {
            bitcoin: 45,
            ethereum: 25,
            altcoins: 15,
            stablecoins: 15,
            speculative: 0
          },
          characteristics: [
            'Moderate exposure to established cryptocurrencies',
            'Diversified altcoin allocation',
            'Balanced risk-reward profile',
            'Includes stablecoins for liquidity'
          ],
          suitableFor: [
            'Investors seeking moderate growth',
            'Those with balanced risk tolerance',
            'Medium-term investment horizons',
            'Diversification-focused investors'
          ],
          risks: [
            'Moderate volatility',
            'Altcoin exposure increases risk',
            'Market timing challenges'
          ],
          benefits: [
            'Growth potential from altcoins',
            'Stability from established assets',
            'Diversification benefits',
            'Liquidity management'
          ]
        },
        {
          name: 'Aggressive',
          description: 'An aggressive portfolio seeks maximum returns with willingness for higher volatility and risk, involving significant allocations to altcoins and speculative investments.',
          allocations: {
            bitcoin: 35,
            ethereum: 20,
            altcoins: 25,
            stablecoins: 5,
            speculative: 15
          },
          characteristics: [
            'Higher allocation to altcoins',
            'Includes speculative assets',
            'No stablecoin allocation',
            'Maximum growth potential',
            'Focused on 5-7 coins for maximum impact'
          ],
          suitableFor: [
            'Investors seeking maximum returns',
            'Those with high risk tolerance',
            'Short to medium-term horizons',
            'Active traders'
          ],
          risks: [
            'High volatility',
            'Potential for significant losses',
            'Liquidity challenges',
            'Market timing critical'
          ],
          benefits: [
            'Maximum growth potential',
            'Exposure to emerging projects',
            'Higher returns in bull markets',
            'Active trading opportunities'
          ]
        },
        {
          name: 'Degen',
          description: 'Ultra-aggressive strategy targeting 100%+ returns in short timeframes. Focuses on trending mid-caps and high-conviction microcaps with strong narratives. EXTREMELY HIGH RISK.',
          allocations: {
            bitcoin: 0,
            ethereum: 0,
            altcoins: 45,
            stablecoins: 5,
            speculative: 50
          },
          characteristics: [
            '45% trending mid-caps for momentum',
            '50% speculative microcaps for moonshots',
            '5% stablecoins for quick re-entry',
            'Ultra-high risk, ultra-high reward',
            'Requires constant monitoring and rotation',
            'Targets 100%+ returns in 1 month'
          ],
          suitableFor: [
            'Experienced degen traders only',
            'Those comfortable losing entire capital',
            'Short-term momentum trading',
            'High-conviction narrative plays'
          ],
          risks: [
            'EXTREMELY HIGH RISK - can lose 50%+ quickly',
            'Requires hourly monitoring',
            'High gas fees from frequent trading',
            'Potential for complete capital loss',
            'Not suitable for any essential funds'
          ],
          benefits: [
            'Maximum growth potential (100%+ targets)',
            'Early exposure to trending narratives',
            'Can outperform all other strategies in bull markets',
            'Active trading opportunities'
          ]
        }
      ],
      principles: [
        'Diversification: Mix between large-caps (stability), mid-caps (growth), small-caps (high risk/high reward), and stablecoins (stability, liquidity)',
        'Periodic Rebalancing: Adjust percentages as the market or your risk tolerance changes',
        'Research: Choose projects with strong fundamentals, real use cases, transparent teams, and active communities',
        'Limit Exposure: Avoid over-concentration in a single sector or asset',
        'Risk Management: Never invest more than you can afford to lose',
        'Long-term Perspective: Focus on fundamental value rather than short-term price movements'
      ],
      tips: [
        'Start with a conservative approach and gradually increase risk as you gain experience',
        'Regularly review and rebalance your portfolio to maintain target allocations',
        'Consider dollar-cost averaging to reduce timing risk',
        'Keep some funds in stablecoins for buying opportunities during market dips',
        'Stay informed about market trends and regulatory developments',
        'Don\'t chase hype - focus on projects with solid fundamentals',
        'Consider tax implications of your trading strategy',
        'Use stop-loss orders to limit potential losses in volatile markets',
        'For maximum impact, keep your portfolio to 5-7 coins - each position should be large enough to move the needle',
        'With smaller amounts, focus on quality over quantity - fewer, larger positions often outperform many small ones'
      ]
    }
  }

  static getStrategyByName(name: string): PortfolioStrategy | undefined {
    const strategies = this.getPortfolioStrategies().strategies
    return strategies.find(strategy => strategy.name.toLowerCase() === name.toLowerCase())
  }

  static getRiskProfileComparison(): {
    conservative: PortfolioStrategy
    balanced: PortfolioStrategy
    aggressive: PortfolioStrategy
    degen: PortfolioStrategy
  } {
    const strategies = this.getPortfolioStrategies().strategies
    return {
      conservative: strategies[0],
      balanced: strategies[1],
      aggressive: strategies[2],
      degen: strategies[3]
    }
  }
} 