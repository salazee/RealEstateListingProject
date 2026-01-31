// src/pages/buyer/Favorites.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getFavourites, removeFavourite } from '@/utils/Property';
import PropertyCard from '@/components/ui/PropertyCard';
import { toast } from 'react-hot-toast';

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const res = await getFavourites();
      setFavorites(res.data.favourites || []);
    } catch (err) {
      toast.error('Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (houseId, houseName) => {
    if (!window.confirm(`Remove "${houseName}" from favorites?`)) return;
    
    try {
      await removeFavourite(houseId);
      setFavorites(favorites.filter(house => house._id !== houseId));
      toast.success('Removed from favorites');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove');
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Favorites</h1>
        <Link 
          to="/properties" 
          className="text-blue-600 hover:underline text-sm"
        >
          ← Browse Properties
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-t-blue-600 border-solid rounded-full animate-spin mb-2"></div>
          <p className="text-gray-600">Loading your favorites...</p>
        </div>
      ) : favorites.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">❤️</div>
          <h2 className="text-xl font-semibold text-gray-800">No favorites yet</h2>
          <p className="text-gray-600 mt-2 max-w-md mx-auto">
            Click the ❤️ icon on any property to save it here.
          </p>
          <button
            onClick={() => navigate('/allListing')}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Browse Properties
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((house) => (
            <div key={house._id} className="relative">
              <PropertyCard house={house} />
              <button
                onClick={() => handleRemoveFavorite(house._id, house.name)}
                className="absolute top-3 right-3 z-10 bg-white/80 p-1.5 rounded-full backdrop-blur-sm hover:bg-red-100"
                aria-label="Remove from favorites"
              >
                <span className="text-red-500 text-lg">×</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}