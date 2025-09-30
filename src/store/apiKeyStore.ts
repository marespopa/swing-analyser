import { atomWithStorage } from 'jotai/utils'

export const apiKeyAtom = atomWithStorage<string>('coingecko-api-key', '')