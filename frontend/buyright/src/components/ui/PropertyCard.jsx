// src/components/ui/PropertyCard.jsx
import { useEffect, useState } from 'react';
import { getOptimizedImage } from '../../Utils/image';
import { Link, useNavigate } from 'react-router-dom';
import { 
  HeartIcon as HeartSolid,
  EnvelopeIcon,
  MapPinIcon,
  HomeIcon,
  Square3Stack3DIcon
} from '@heroicons/react/24/solid';
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline';
import { addFavourite, removeFavourite, getFavourites, createInquiry } from '../../Utils/property';
import { toast } from 'react-hot-toast';

export default function PropertyCard({ house, showFavorite = true, showInquiry = true }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [sendingInquiry, setSendingInquiry] = useState(false);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser && storedUser !== 'undefined') {
        setUser(JSON.parse(storedUser));
      }
    } catch (err) {
      console.error('Error parsing user:', err);
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    const checkFavoriteStatus = async () => {
      try {
        const res = await getFavourites();
        const favoriteIds = res.data.favourites.map(fav => fav._id);
        setIsFavorited(favoriteIds.includes(house._id));
      } catch (err) {
        console.error('Failed to fetch favourites', err);
      }
    };

    checkFavoriteStatus();
  }, [house._id, user]);

  useEffect(() => {
    console.log('PropertyParams received:', house);
  }, [house]);
  const handleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error('Please log in to save favorites');
      navigate('/login');
      return;
    }

    try {
      if (isFavorited) {
        await removeFavourite(house._id);
        toast.success('Removed from favorites');
        setIsFavorited(false);
      } else {
        await addFavourite(house._id);
        toast.success('Added to favorites');
        setIsFavorited(true);
      }

      const updatedFavs = isFavorited
        ? user.favourites?.filter(fav => fav._id !== house._id) || []
        : [...(user.favourites || []), house];
      
      const updatedUser = { ...user, favourites: updatedFavs };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (err) {
      console.error('Favorite error:', err);
      toast.error(err.response?.data?.message || 'Failed to update favorites');
    }
  };

  const handleSendInquiry = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error('Please log in to send inquiries');
      navigate('/login');
      return;
    }

    if (!inquiryMessage.trim()) {
      toast.error('Please write a message');
      return;
    }

    setSendingInquiry(true);
    try {
      await createInquiry({
        propertyId: house._id,
        message: inquiryMessage
      });
      
      toast.success('Inquiry sent successfully');
      setShowInquiryModal(false);
      setInquiryMessage('');
    } catch (err) {
      console.error('Inquiry error:', err);
      toast.error(err.response?.data?.message || 'Failed to send inquiry');
    } finally {
      setSendingInquiry(false);
    }
  };

  const nextImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex(prev =>
      prev === (house.images?.length || 1) - 1 ? 0 : prev + 1
    );
  };

  const prevImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex(prev =>
      prev === 0 ? (house.images?.length || 1) - 1 : prev - 1
    );
  };

  const formattedPrice = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(house.price);

  const propertyTypeLabel = {
    house: 'House',
    apartment: 'Apartment',
    condo: 'Condo',
  }[house.property] || 'Property';

  return (
    <>
      <div className="flex flex-col h-full bg-gray-100 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
        {/* Image Gallery */}
        <div className="relative">
          {house.images?.length ? (
            <div className="relative w-full h-48">
              <img
                src={getOptimizedImage(house.images[currentImageIndex],800)}
                alt={house.name}
                loading='lazy' // Lazy loading for better performance
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/300x200?text=Image+Error';
                }}
              />
              
              {/* Image Counter */}
              {house.images.length > 1 && (
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  {currentImageIndex + 1} / {house.images.length}
                </div>
              )}

              {/* Navigation Arrows */}
              {house.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 text-gray-800 p-2 rounded-full hover:bg-white shadow-lg"
                    aria-label="Previous image"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 text-gray-800 p-2 rounded-full hover:bg-white shadow-lg"
                    aria-label="Next image"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}

              {/* Favorite Button */}
              {showFavorite && (
                <button
                  onClick={handleFavorite}
                  className="absolute top-3 right-3 bg-white/80 p-1.5 rounded-full backdrop-blur-sm hover:scale-110 transition z-10"
                  aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
                >
                  {isFavorited ? (
                    <HeartSolid className="w-5 h-5 text-red-500" />
                  ) : (
                    <HeartOutline className="w-5 h-5 text-gray-700" />
                  )}
                </button>
              )}
            </div>
          ) : (
            <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500">
              <HomeIcon className="w-12 h-12 text-gray-400" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-grow">
          <div className="flex justify-between mb-2">
            <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-1 rounded">
              {propertyTypeLabel}
            </span>
            <span className="font-bold text-red-700">{formattedPrice}</span>
          </div>

          <h3 className="font-bold line-clamp-1 mb-1">{house.name}</h3>
          
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <MapPinIcon className="w-4 h-4 mr-1" />
            <span>{house.location}</span>
          </div>

          {/* Property Details */}
          <div className="flex items-center gap-3 text-sm text-gray-600 mb-2">
            {(house.bedrooms) && (
              <div className="flex items-center gap-1">
                <HomeIcon className="w-4 h-4" />
                <span>{house.bedrooms} bed{house.bedrooms > 1 ? 's' : ''}</span>
              </div>
            )}
            {(house.bathrooms) && (
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{house.bathrooms} bath{house.bathrooms > 1 ? 's' : ''}</span>
              </div>
            )}
            {(house.squarefoot) && (
              <div className="flex items-center gap-1">
                <Square3Stack3DIcon className="w-4 h-4" />
                <span>{house.squarefoot.toLocaleString()} sqft</span>
              </div>
            )}
          </div>

          <p className="text-sm text-gray-700 line-clamp-2 flex-grow">
            {house.description}
          </p>

          {/* Contact Details */}
          {house.owner?.name && (
            <div className="mt-2 pt-2 border-t">
              <p className="text-xs text-gray-500">Listed by</p>
              <p className="text-sm font-medium text-gray-700">{house.owner.name}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-3 space-y-2">
            <Link
              to={`/property/${house._id}`}
              className="block text-center bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition font-medium"
            >
              View Details
            </Link>

            {showInquiry && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!user) {
                    navigate('/login');
                    return;
                  }
                  setShowInquiryModal(true);
                }}
                className="w-full flex items-center justify-center gap-2 bg-red-600 text-white py-2 rounded hover:bg-red-700 transition font-medium"
              >
                <EnvelopeIcon className="w-4 h-4" />
                <span>Contact Seller</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Inquiry Modal */}
      {showInquiryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-2">Send Inquiry</h3>
            <p className="text-gray-600 mb-4">
              Contact seller about <strong>{house.name}</strong>
            </p>

            <form onSubmit={handleSendInquiry}>
              <textarea
                value={inquiryMessage}
                onChange={(e) => setInquiryMessage(e.target.value)}
                placeholder="I'm interested in this property..."
                className="w-full p-3 border rounded-lg min-h-[120px] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                disabled={sendingInquiry}
                required
              />

              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowInquiryModal(false);
                    setInquiryMessage('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  disabled={sendingInquiry}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingInquiry || !inquiryMessage.trim()}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium ${
                    sendingInquiry
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {sendingInquiry ? 'Sending...' : 'Send'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}