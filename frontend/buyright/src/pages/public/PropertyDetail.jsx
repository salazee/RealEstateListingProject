
// src/pages/public/PropertyDetail.jsx
import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getHouse, addFavourite, removeFavourite, createInquiry, payInspectionFee, initializePayment } from '../../Utils/property';
import {
  HeartIcon,
  MapPinIcon,
  HomeIcon,
  Square3Stack3DIcon,
  EnvelopeIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { toast } from 'react-hot-toast';
import MortgageCalculator from '../../components/MortgageCalculator';

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [house, setHouse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [sendingInquiry, setSendingInquiry] = useState(false);
  const [bookingInspection, setBookingInspection] = useState(false);

  const user = (() => {
    try {
      const stored = localStorage.getItem('user');
      return stored && stored !== 'undefined' ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  })();

  const viewRecorded = useRef(false);

  // ✅ FIX: Proper useEffect with correct dependencies
  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const res = await getHouse(id);
        setHouse(res.data.getHouse);
        
        if (user) {
          const favIds = user.favourites?.map(f => f._id) || [];
          setIsFavorited(favIds.includes(id));
        }
      } catch (error) {
        console.error('Fetch property error:', error);
        toast.error('Failed to load property details');
        navigate('/allListing');
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id, navigate]); // ✅ Remove 'user' from dependencies

  // ✅ FIX: Separate useEffect for recording view ONCE
  useEffect(() => {
    const recordView = async () => {
      if (!viewRecorded.current && id) {
        try {
          await fetch(`/api/property/view/${id}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          viewRecorded.current = true;
        } catch (err) {
          console.error('Failed to record view:', err);
        }
      }
    };

    recordView();
  }, [id]); // ✅ Only runs when ID changes

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const toggleFavourite = async () => {
    if (!user) {
      toast.error('Please log in to save favorites');
      navigate('/login');
      return;
    }

    try {
      if (isFavorited) {
        await removeFavourite(id);
        toast.success('Removed from favorites');
        setIsFavorited(false);
      } else {
        await addFavourite(id);
        toast.success('Added to favorites');
        setIsFavorited(true);
      }

      const updatedFavs = isFavorited
        ? user.favourites?.filter(fav => fav._id !== id) || []
        : [...(user.favourites || []), house];
      
      const updatedUser = { ...user, favourites: updatedFavs };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (err) {
      console.error('Favorite action failed:', err);
      toast.error('Failed to update favorites');
    }
  };

  const handleSendInquiry = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error('Please log in to send an inquiry');
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
        propertyId: id,
        message: inquiryMessage,
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

  const handleBookInspection = async () => {
    if (!user) {
      toast.error('Please log in to book an inspection');
      navigate('/login');
      return;
    }

    if (!window.confirm('Book inspection for ₦3,000?')) return;

    setBookingInspection(true);
    try {
      const res = await payInspectionFee(id);
      const paymentId = res.data.paymentId;
      
      const initRes = await initializePayment(paymentId);
      window.location.href = initRes.data.authorization_url;
    } catch (err) {
      console.error('Inspection booking error:', err);
      toast.error(err.response?.data?.message || 'Failed to book inspection');
    } finally {
      setBookingInspection(false);
    }
  };

  const nextImage = () => {
    setCurrentImageIndex(prev =>
      prev === (house.images?.length || 1) - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex(prev =>
      prev === 0 ? (house.images?.length || 1) - 1 : prev - 1
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-t-blue-600 border-solid rounded-full animate-spin mb-2"></div>
          <p className="text-gray-600">Loading property...</p>
        </div>
      </div>
    );
  }

  if (!house) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">Property not found</h2>
          <button
            onClick={() => navigate('/allListing')}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Browse Properties
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      {/* Image Gallery */}
      <div className="relative mb-6">
        <div className="relative w-full h-96 rounded-lg overflow-hidden">
          <img
            src={house.images?.[currentImageIndex] || 'https://via.placeholder.com/800x400?text=No+Image'}
            alt={house.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/800x400?text=Image+Error';
            }}
          />

          {house.images?.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 text-gray-800 p-3 rounded-full hover:bg-white shadow-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 text-gray-800 p-3 rounded-full hover:bg-white shadow-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                {currentImageIndex + 1} / {house.images.length}
              </div>
            </>
          )}

          <button
            onClick={toggleFavourite}
            className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-lg hover:scale-110 transition"
          >
            {isFavorited ? (
              <HeartSolid className="w-6 h-6 text-red-500" />
            ) : (
              <HeartIcon className="w-6 h-6 text-gray-600" />
            )}
          </button>
        </div>

        {/* Thumbnail Gallery */}
        {house.images?.length > 1 && (
          <div className="flex gap-2 mt-4 overflow-x-auto">
            {house.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImageIndex(idx)}
                className={`flex-shrink-0 w-20 h-20 rounded overflow-hidden border-2 ${
                  idx === currentImageIndex ? 'border-blue-600' : 'border-gray-300'
                }`}
              >
                <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Property Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-bold mb-2">{house.name}</h1>

          <div className="flex items-center gap-2 text-gray-700 mb-4">
            <MapPinIcon className="w-5 h-5" />
            <span>{house.location}</span>
          </div>

          <div className="text-3xl font-bold text-blue-600 mb-4">
            {formatPrice(house.price)}
          </div>

          <div className="flex gap-6 mb-6 text-gray-700">
            {house.bedrooms && (
              <div className="flex items-center gap-2">
                <HomeIcon className="w-5 h-5" />
                <span>{house.bedrooms} Bed{house.bedrooms > 1 ? 's' : ''}</span>
              </div>
            )}
            {house.bathrooms && (
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{house.bathrooms} Bath{house.bathrooms > 1 ? 's' : ''}</span>
              </div>
            )}
            {house.squarefoot && (
              <div className="flex items-center gap-2">
                <Square3Stack3DIcon className="w-5 h-5" />
                <span>{house.squarefoot.toLocaleString()} sqft</span>
              </div>
            )}
          </div>

          <div className="border-t pt-4">
            <h2 className="text-xl font-semibold mb-2">Description</h2>
            <p className="text-gray-700 whitespace-pre-line">{house.description}</p>
          </div>

          {house.address && (
            <div className="mt-4 border-t pt-4">
              <h2 className="text-xl font-semibold mb-2">Address</h2>
              <p className="text-gray-700">{house.address}</p>
            </div>
          )}
        </div>

        {/* Contact Seller Card */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-red-5 border rounded-lg p-6 shadow-lg sticky top-4">
            <h3 className="text-xl font-semibold mb-4">Contact Seller</h3>
            
            {house.owner && (
              <div className="mb-4">
                <p className="text-gray-600 text-sm">Listed by</p>
                <p className="font-medium">{house.owner.name}</p>
                {house.owner.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                    <EnvelopeIcon className="w-4 h-4" />
                    <span>{house.owner.email}</span>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => setShowInquiryModal(true)}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium flex items-center justify-center gap-2 mb-3"
            >
              <EnvelopeIcon className="w-5 h-5" />
              Send Inquiry
            </button>

            <button
              onClick={handleBookInspection}
              disabled={bookingInspection}
              className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-medium flex items-center justify-center gap-2"
            >
              <CalendarDaysIcon className="w-5 h-5" />
              {bookingInspection ? 'Processing...' : 'Book Inspection (₦3,000)'}
            </button>

            <div className="mt-4 pt-4 border-t text-sm text-gray-500">
              <p>Views: {house.views || 0}</p>
              <p className="mt-1">Property ID: {house._id.slice(-8)}</p>
            </div>
          </div>

          {/* Mortgage Calculator */}
          <MortgageCalculator propertyPrice={house.price} />
        </div>
      </div>

      {/* Inquiry Modal */}
      {showInquiryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Send Inquiry</h3>
            <p className="text-gray-600 mb-4">
              Contact the seller about <strong>{house.name}</strong>
            </p>

            <form onSubmit={handleSendInquiry}>
              <textarea
                value={inquiryMessage}
                onChange={(e) => setInquiryMessage(e.target.value)}
                placeholder="I'm interested in this property..."
                className="w-full p-3 border rounded-lg min-h-[120px] focus:ring-2 focus:ring-red-500 focus:outline-none"
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
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
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
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  {sendingInquiry ? 'Sending...' : 'Send'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}