
// src/pages/public/Listings.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getHouses } from '../../Utils/property';
import { toast } from 'react-hot-toast';
import PropertyCard from '../../components/ui/PropertyCard';

export default function Listings() {
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHouses = async () => {
      try {
        const res = await getHouses();
        setHouses(res.data.data|| []);
      } catch (error) {
        console.error('Failed to fetch listings;', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHouses();
  }, []);

  if (loading){
     return(
       <div className="p-6 text-center">
          <div className="inline-block w-8 h-8 border-4 border-t-blue-600 border-solid rounded-full animate-spin"></div>
        <p>Loading properties...</p>
        </div>
     );
    }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Available Properties</h1>
      {houses.length === 0 ? (
        <p className="text-center text-gray-500">No approved listings yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {houses.map((house) => (
           <PropertyCard key={house._id} house={house} />
       
          ))}
        </div>
      )}
    </div>
  );
}