import React from 'react'
import { useAtom } from 'jotai'
import Button from './ui/Button'
import { favouritesAtom, addToFavouritesAtom, removeFromFavouritesAtom } from '../store'

interface FavouriteButtonProps {
  coin: {
    id: string
    name: string
    symbol: string
    image?: string
  }
  size?: 'sm' | 'md' | 'lg'
  variant?: 'outline' | 'primary' | 'ghost'
  className?: string
}

const FavouriteButton: React.FC<FavouriteButtonProps> = ({ 
  coin, 
  size = 'sm', 
  variant = 'primary',
  className = ''
}) => {
  const [favourites] = useAtom(favouritesAtom)
  const [, addToFavourites] = useAtom(addToFavouritesAtom)
  const [, removeFromFavourites] = useAtom(removeFromFavouritesAtom)

  const isFavourite = favourites.some(fav => fav.id === coin.id)

  const handleToggleFavourite = () => {
    if (isFavourite) {
      removeFromFavourites(coin.id)
    } else {
      addToFavourites({
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol,
        image: coin.image
      })
    }
  }

  return (
    <Button
      onClick={handleToggleFavourite}
      variant={variant}
      size={size}
      className={`flex items-center gap-1 ${className}`}
    >
      {isFavourite ? (
        <>
          <span>★</span>
          Remove from Favourites
        </>
      ) : (
        <>
          <span>☆</span>
          Add to Favourites
        </>
      )}
    </Button>
  )
}

export default FavouriteButton
