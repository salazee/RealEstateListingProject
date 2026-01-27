// src/pages/seller/CreateListing.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createListing } from '../../utils/property';
import { uploadToCloudinary } from '../../utils/cloudinary';
import { toast } from 'react-hot-toast';

export default function CreateListing() {
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
  const [images, setImages] = useState([]); // File objects
  const [previewUrls, setPreviewUrls] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  // Handle files (from input or drop)
  const handleFiles = (files) => {
    const validFiles = Array.from(files).filter(file =>
      file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024 // 10MB limit
    );

    if (validFiles.length !== files.length) {
      toast.error('Only images under 10MB are allowed');
      return;
    }

    if (images.length + validFiles.length > 10) {
      toast.error('You can upload up to 10 images');
      return;
    }

    setImages(prev => [...prev, ...validFiles]);
    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...newPreviews]);
  };

  // File input change
  const handleImageSelect = (e) => {
    handleFiles(e.target.files);
  };

  // Drag events
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  // Remove image
  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  // Form input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  // Validate form
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
    if (images.length === 0) {
      toast.error('Please upload at least one image');
      return false;
    }
    return true;
  };

  // Upload images to Cloudinary
  const uploadImages = async () => {
    setUploading(true);
    try {
      const urls = await Promise.all(
        images.map(img => uploadToCloudinary(img))
      );
      return urls;
    } catch (err) {
      toast.error(err.message || 'Image upload failed');
      throw err;
    } finally {
      setUploading(false);
    }
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const imageUrls = await uploadImages();
      const payload = {
        ...form,
        price: Number(form.price),
        bedrooms: form.bedrooms ? Number(form.bedrooms) : undefined,
        bathrooms: form.bathrooms ? Number(form.bathrooms) : undefined,
        squarefoot: form.squarefoot ? Number(form.squarefoot) : undefined,
        images: imageUrls,
      };

      await createListing(payload);
      toast.success('Listing submitted! Awaiting admin approval.');
      navigate('/dashboard/seller');
    } catch (err) {
      toast.error('Failed to create listing. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      <h1 className="text-2xl font-bold mb-6">List a New Property</h1>

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

        {/* Image Upload */}
        <div>
          <label className="block mb-2 font-medium">Property Images * (Max 10)</label>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              isDragging
                ? 'border-secondary bg-yellow-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <p className="mb-2">
              {isDragging
                ? 'Drop images here!'
                : 'Drag & drop images here, or click to browse'}
            </p>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer text-blue-600 hover:underline"
            >
              Select files
            </label>
            <p className="text-sm text-gray-500 mt-1">
              JPG, PNG, WEBP • Max 10MB each
            </p>
          </div>

          {/* Image Previews */}
          {previewUrls.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">Previews ({previewUrls.length}/10):</p>
              <div className="flex flex-wrap gap-2">
                {previewUrls.map((url, i) => (
                  <div key={i} className="relative w-24 h-24">
                    <img
                      src={url}
                      alt={`Preview ${i + 1}`}
                      className="w-full h-full object-cover rounded border"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow"
                      aria-label="Remove image"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting || uploading}
          className={`w-full py-3 rounded font-semibold ${
            submitting || uploading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-primary text-white bg-blue-600 hover:bg-blue-800'
          }`}
        >
          {uploading ? 'Uploading Images...' : submitting ? 'Submitting...' : 'Submit Listing'}
        </button>
      </form>
    </div>
  );
}