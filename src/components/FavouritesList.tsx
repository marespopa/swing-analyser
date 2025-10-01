import React from 'react'
import { useAtom } from 'jotai'
import { favouritesAtom, removeFromFavouritesAtom } from '../store'

interface FavouritesListProps {
  onFavouriteSelect: (favourite: any) => void
  maxItems?: number
}

const FavouritesList: React.FC<FavouritesListProps> = ({ 
  onFavouriteSelect, 
  maxItems = 5
}) => {
  const [favourites] = useAtom(favouritesAtom)
  const [, removeFromFavourites] = useAtom(removeFromFavouritesAtom)

  const handleFavouriteClick = async (favourite: any) => {
    if (onFavouriteSelect) {
      // Use the provided callback (for form selection)
      onFavouriteSelect(favourite)
    }
  }

  if (favourites.length === 0) {
    return null
  }

  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        Favourites
      </h3>
      <div className="flex flex-wrap gap-2">
        {favourites.slice(0, maxItems).map((favourite) => (
          <button
            key={favourite.id}
            onClick={() => handleFavouriteClick(favourite)}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm cursor-pointer"
          >
            {favourite.image && (
              <img
                src={favourite.image}
                alt={favourite.name}
                className="w-4 h-4 rounded-full"
              />
            )}
            <span className="font-medium text-gray-800 dark:text-white">
              {favourite.name}
            </span>
            <span className="text-gray-500 dark:text-gray-400">
              ({favourite.symbol})
            </span>
            <span
              onClick={(e) => {
                e.stopPropagation()
                removeFromFavourites(favourite.id)
              }}
              className="text-gray-400 hover:text-red-500 transition-colors ml-1 cursor-pointer"
              title="Remove from favourites"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  e.stopPropagation()
                  removeFromFavourites(favourite.id)
                }
              }}
            >
              ×
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default FavouritesList
