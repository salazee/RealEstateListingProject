// src/pages/seller/EditListing.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getHouse, editHouse } from '../../Utils/property';
import { uploadToCloudinary } from '../../Utils/cloudinary';
import { toast } from 'react-hot-toast';

export default function EditListing() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    address: '',
    location: '',
    property: 'house',
    bedrooms: '',
    bathrooms: '',
    squarefoot: '',
  });
  
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [newPreviewUrls, setNewPreviewUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchListing();
  }, [id]);

  const fetchListing = async () => {
    try {
      const res = await getHouse(id);
      const house = res.data.getHouse;
      
      setForm({
        name: house.name || '',
        description: house.description || '',
        price: house.price || '',
        address: house.address || '',
        location: house.location || '',
        property: house.property || 'house',
        bedrooms: house.bedrooms || '',
        bathrooms: house.bathrooms || '',
        squarefoot: house.squarefoot || '',
      });
      
      setExistingImages(house.images || []);
    } catch (error) {
      toast.error('Failed to load listing', error);
      navigate('/MyListings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleNewImages = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file =>
      file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024
    );

    if (validFiles.length !== files.length) {
      toast.error('Only images under 10MB are allowed');
      return;
    }

    if (existingImages.length + newImages.length + validFiles.length > 10) {
      toast.error('Maximum 10 images allowed');
      return;
    }

    setNewImages(prev => [...prev, ...validFiles]);
    const previews = validFiles.map(file => URL.createObjectURL(file));
    setNewPreviewUrls(prev => [...prev, ...previews]);
  };

  const removeExistingImage = (index) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
    setNewPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    if (!form.name.trim()) {
      toast.error('Property name is required');
      return false;
    }
    if (form.description.trim().length < 30) {
      toast.error('Description must be at least 30 characters');
      return false;
    }
    if (!form.price || Number(form.price) <= 0) {
      toast.error('Valid price is required');
      return false;
    }
    if (!form.location.trim()) {
      toast.error('Location is required');
      return false;
    }
    if (existingImages.length === 0 && newImages.length === 0) {
      toast.error('At least one image is required');
      return false;
    }
    return true;
  };

  const uploadNewImages = async () => {
    if (newImages.length === 0) return [];
    
    setUploading(true);
    try {
      const urls = await Promise.all(
        newImages.map(img => uploadToCloudinary(img))
      );
      return urls;
    } catch (err) {
      toast.error(err.message || 'Image upload failed');
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSubmitting(true);
    try {
      const newImageUrls = await uploadNewImages();
      const allImages = [...existingImages, ...newImageUrls];
      
      const payload = {
       
        name: form.name,
        description: form.description,
        price: Number(form.price),
        address: form.address || undefined,
        location: form.location,
        property: form.property,
        bedrooms: form.bedrooms ? Number(form.bedrooms) : undefined,
        bathrooms: form.bathrooms ? Number(form.bathrooms) : undefined,
        squarefoot: form.squarefoot ? Number(form.squarefoot) : undefined,
        images: allImages,
      };

      await editHouse(id, payload);
      
      toast.success('Listing updated successfully!');
      navigate('/MyListings');
    } catch (err) {
      console.error('Update error:', err);
      toast.error(err.response?.data?.message || 'Failed to update listing');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-t-blue-600 border-solid rounded-full animate-spin mb-2"></div>
          <p>Loading listing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Edit Listing</h1>
        <button
          onClick={() => navigate('/MyListings')}
          className="text-blue-600 hover:underline"
        >
          ← Back to Listings
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Property Name */}
        <div>
          <label className="block mb-2 font-medium">Property Name *</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g., Luxury 3-Bed Duplex"
            className="w-full p-2 border rounded"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block mb-2 font-medium">Description * (min 30 chars)</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Describe your property..."
            className="w-full p-2 border rounded"
            rows="4"
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            {form.description.length}/30+ characters
          </p>
        </div>

        {/* Price */}
        <div>
          <label className="block mb-2 font-medium">Price (₦) *</label>
          <input
            name="price"
            type="number"
            value={form.price}
            onChange={handleChange}
            placeholder="1500000"
            className="w-full p-2 border rounded"
            min="1"
            required
          />
        </div>

        {/* Address & Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 font-medium">Address</label>
            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Full address"
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-2 font-medium">Location *</label>
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="e.g., Lekki, Lagos"
              className="w-full p-2 border rounded"
              required
            />
          </div>
        </div>

        {/* Property Type */}
        <div>
          <label className="block mb-2 font-medium">Property Type</label>
          <select
            name="property"
            value={form.property}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="house">House</option>
            <option value="apartment">Apartment</option>
            <option value="condo">Condo</option>
          </select>
        </div>

        {/* Bedrooms, Bathrooms, Size */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block mb-2 font-medium">Bedrooms</label>
            <input
              name="bedrooms"
              type="number"
              value={form.bedrooms}
              onChange={handleChange}
              placeholder="3"
              className="w-full p-2 border rounded"
              min="0"
            />
          </div>
          <div>
            <label className="block mb-2 font-medium">Bathrooms</label>
            <input
              name="bathrooms"
              type="number"
              value={form.bathrooms}
              onChange={handleChange}
              placeholder="2"
              className="w-full p-2 border rounded"
              min="0"
            />
          </div>
          <div>
            <label className="block mb-2 font-medium">Size (sq ft)</label>
            <input
              name="squarefoot"
              type="number"
              value={form.squarefoot}
              onChange={handleChange}
              placeholder="1200"
              className="w-full p-2 border rounded"
              min="1"
            />
          </div>
        </div>

        {/* Images */}
        <div>
          <label className="block mb-2 font-medium">Property Images</label>
          
          {/* Existing Images */}
          {existingImages.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium mb-2">Current Images:</p>
              <div className="flex flex-wrap gap-2">
                {existingImages.map((url, i) => (
                  <div key={i} className="relative w-24 h-24">
                    <img
                      src={url}
                      alt={`Current ${i + 1}`}
                      className="w-full h-full object-cover rounded border"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(i)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Images */}
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleNewImages}
            className="w-full p-2 border rounded"
          />
          
          {newPreviewUrls.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">New Images:</p>
              <div className="flex flex-wrap gap-2">
                {newPreviewUrls.map((url, i) => (
                  <div key={i} className="relative w-24 h-24">
                    <img
                      src={url}
                      alt={`New ${i + 1}`}
                      className="w-full h-full object-cover rounded border"
                    />
                    <button
                      type="button"
                      onClick={() => removeNewImage(i)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <p className="text-sm text-gray-500 mt-2">
            Total: {existingImages.length + newImages.length}/10 images
          </p>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting || uploading}
          className={`w-full py-3 rounded font-semibold ${
            submitting || uploading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {uploading ? 'Uploading Images...' : submitting ? 'Updating...' : 'Update Listing'}
        </button>
      </form>
    </div>
  );
}