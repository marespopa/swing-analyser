import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import type { UserPreferences, Portfolio, SwingTradeOpportunity, PotentialCoin } from '../types'

// Default user preferences
const defaultPreferences: UserPreferences = {
  riskProfile: 'balanced',
  startingAmount: 1000,
  notifications: true,
  autoRebalance: false
}

// Atoms for state management
export const userPreferencesAtom = atomWithStorage<UserPreferences>('crypto-portfolio-preferences', defaultPreferences)

export const portfolioAtom = atomWithStorage<Portfolio | null>('crypto-portfolio', null)

export const swingTradeOpportunitiesAtom = atom<SwingTradeOpportunity[]>([])

export const potentialCoinsAtom = atom<PotentialCoin[]>([])

export const isLoadingAtom = atom<boolean>(false)

export const errorAtom = atom<string | null>(null)

export const apiKeyAtom = atomWithStorage<string>('coingecko-api-key', '')

// Computed atoms
export const appStateAtom = atom((get) => ({
  userPreferences: get(userPreferencesAtom),
  portfolio: get(portfolioAtom),
  swingTradeOpportunities: get(swingTradeOpportunitiesAtom),
  potentialCoins: get(potentialCoinsAtom),
  isLoading: get(isLoadingAtom),
  error: get(errorAtom)
}))

export const updateUserPreferencesAtom = atom(
  null,
  (get, set, preferences: Partial<UserPreferences>) => {
    const current = get(userPreferencesAtom)
    set(userPreferencesAtom, { ...current, ...preferences })
  }
)

export const setPortfolioAtom = atom(
  null,
  (_get, set, portfolio: Portfolio | null) => {
    set(portfolioAtom, portfolio)
  }
)

export const addSwingTradeOpportunityAtom = atom(
  null,
  (get, set, opportunity: SwingTradeOpportunity) => {
    const current = get(swingTradeOpportunitiesAtom)
    set(swingTradeOpportunitiesAtom, [opportunity, ...current])
  }
)

export const removeSwingTradeOpportunityAtom = atom(
  null,
  (get, set, opportunityId: string) => {
    const current = get(swingTradeOpportunitiesAtom)
    set(swingTradeOpportunitiesAtom, current.filter(o => o.id !== opportunityId))
  }
)

export const addPotentialCoinAtom = atom(
  null,
  (get, set, coin: PotentialCoin) => {
    const current = get(potentialCoinsAtom)
    set(potentialCoinsAtom, [coin, ...current])
  }
)

export const removePotentialCoinAtom = atom(
  null,
  (get, set, coinId: string) => {
    const current = get(potentialCoinsAtom)
    set(potentialCoinsAtom, current.filter(c => c.id !== coinId))
  }
)

export const setLoadingAtom = atom(
  null,
  (_get, set, loading: boolean) => {
    set(isLoadingAtom, loading)
  }
)

export const setErrorAtom = atom(
  null,
  (_get, set, error: string | null) => {
    set(errorAtom, error)
  }
) 