import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

export interface FavouriteCoin {
  id: string
  name: string
  symbol: string
  image?: string
  addedAt: number
}

export const favouritesAtom = atomWithStorage<FavouriteCoin[]>('coin-favourites', [])

export const addToFavouritesAtom = atom(
  null,
  (get, set, coin: Omit<FavouriteCoin, 'addedAt'>) => {
    const favourites = get(favouritesAtom)
    const existingIndex = favourites.findIndex(fav => fav.id === coin.id)
    
    if (existingIndex === -1) {
      // Add new favourite
      const newFavourite: FavouriteCoin = {
        ...coin,
        addedAt: Date.now()
      }
      set(favouritesAtom, [newFavourite, ...favourites])
    } else {
      // Update existing favourite (move to top)
      const updatedFavourites = [...favourites]
      updatedFavourites[existingIndex] = {
        ...updatedFavourites[existingIndex],
        addedAt: Date.now()
      }
      // Move to top
      const [movedFavourite] = updatedFavourites.splice(existingIndex, 1)
      set(favouritesAtom, [movedFavourite, ...updatedFavourites])
    }
  }
)

export const removeFromFavouritesAtom = atom(
  null,
  (get, set, coinId: string) => {
    const favourites = get(favouritesAtom)
    set(favouritesAtom, favourites.filter(fav => fav.id !== coinId))
  }
)
