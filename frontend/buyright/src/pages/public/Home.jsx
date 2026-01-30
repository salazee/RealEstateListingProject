


import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getHouses } from "../../Utils/Property";
import PropertyCard from "../../components/ui/PropertyCard";

export default function Home() {
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHouses = async () => {
      try {
        const res = await getHouses();
        setHouses(res.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHouses();
  }, []);

  if (loading) {
    return <div className="p-10 text-center text-lg">Loading properties...</div>;
  }

  return (
    <div className="w-full">
      <section className="relative h-[70vh] flex items-center justify-center">
        <img
          src="https://images.unsplash.com/photo-1605146769289-440113cc3d00"
          alt="House"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60"></div>

        <div className="relative z-10 text-center px-4 max-w-3xl">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Find Your Dream Home at the Click of a Button
          </h1>
          <p className="text-gray-200 text-lg mb-6">
            Browse verified properties, compare prices, and connect directly
            with trusted sellers across Nigeria.
          </p>
          <button className="bg-blue-600
          hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg"
          type="button"
          onClick={() =>navigate('/allListing')}>
            Browse Properties
          </button>
        </div>
      </section>

     
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-blue-700 mb-12">
            What We Do
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <h3 className="text-xl font-semibold mb-3">Buy Properties</h3>
              <p className="text-gray-600">
                Find houses, apartments, and lands that suit your budget and lifestyle.
              </p>
            </div>

            <div className="bg-blue-200 p-6 rounded-lg shadow text-center">
              <h3 className="text-xl font-semibold mb-3">Sell Properties</h3>
              <p className="text-black">
                List your property and reach thousands of serious buyers instantly.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow text-center">
              <h3 className="text-xl font-semibold mb-3">Verified Listings</h3>
              <p className="text-gray-600">
                We verify listings to reduce fraud and protect buyers.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* ================= FEATURED PROPERTIES ================= */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl text-blue-700 font-bold text-center mb-10">
            Featured Properties
          </h2>

          {houses.length === 0 ? (
            <p className="text-center text-gray-500">
              No properties available
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {houses.slice(0, 6).map((house) => (
                <PropertyCard key={house._id} house={house} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ================= WHY CHOOSE US ================= */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl text-blue-700 font-bold text-center mb-12">
            Why Choose Us
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <ul className="space-y-4 text-lg">
              <li>✅ Trusted sellers and agents</li>
              <li>✅ Secure communication</li>
              <li>✅ No hidden charges</li>
              <li>✅ Easy to use platform</li>
            </ul>

            <div className="bg-blue-600 text-white rounded-lg p-8">
              <h3 className="text-2xl font-semibold mb-4">
                Over 1,000+ Happy Users
              </h3>
              <p>
                Our platform connects buyers and sellers seamlessly,
                making property transactions faster and safer.
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* ================= CALL TO ACTION ================= */}
      <section className="py-20 bg-blue-600 text-white text-center px-4">
        <h2 className="text-3xl font-bold mb-4">
          Ready to Find Your Next Home?
        </h2>
        <p className="mb-6 text-lg">
          Sign up today and start exploring verified listings.
        </p>
        <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold">
          Get Started
        </button>
      </section>
    </div>
  );
}
