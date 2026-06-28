import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, MapPin, ChevronDown, ArrowLeft, Check } from 'lucide-react';
import { useAuthContext } from '../context/AuthContext';
import { useProduct } from '../modules/product/productHook';
import { validateProduct } from '../modules/product/productValidator';
import { uploadMultipleImages } from '../services/storageService';
import { getCurrentPosition } from '../modules/location/locationService';
import Button from '../components/Button';
import Input from '../components/Input';
import ImageUploader from '../components/ImageUploader';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import { CATEGORIES } from '../constants/categories';
import { MESSAGES } from '../constants/messages';
import toast from 'react-hot-toast';

const SellPage = () => {
  const { user } = useAuthContext();
  const { addProduct } = useProduct();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    condition: 'new',
    location: null,
    images: []
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showConditionModal, setShowConditionModal] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  const conditions = [
    { value: 'new', label: 'নতুন', desc: 'একদম নতুন, ব্যবহার করা হয়নি' },
    { value: 'like-new', label: 'নতুনের মতো', desc: 'খুব কম ব্যবহার করা হয়েছে' },
    { value: 'good', label: 'ভালো অবস্থা', desc: 'স্বাভাবিক ব্যবহারের চিহ্ন আছে' },
    { value: 'fair', label: 'মাঝারি', desc: 'ব্যবহারের চিহ্ন স্পষ্ট' },
  ];

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleImagesChange = (files) => {
    setForm(prev => ({ ...prev, images: files }));
  };

  const handleGetLocation = async () => {
    setGettingLocation(true);
    try {
      const position = await getCurrentPosition();
      setForm(prev => ({
        ...prev,
        location: {
          lat: position.lat,
          lng: position.lng,
          address: 'আপনার অবস্থান'
        }
      }));
      toast.success('লোকেশন পাওয়া গেছে!');
    } catch (error) {
      toast.error('লোকেশন পেতে সমস্যা, ম্যানুয়ালি দিন');
    } finally {
      setGettingLocation(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate
    const validation = validateProduct({
      ...form,
      price: parseFloat(form.price)
    });

    if (!validation.isValid) {
      setErrors(validation.errors);
      toast.error('সব তথ্য সঠিকভাবে দিন');
      return;
    }

    setLoading(true);

    try {
      // Upload images first
      let imageUrls = [];
      if (form.images.length > 0) {
        const uploadResult = await uploadMultipleImages(form.images, user.uid);
        if (uploadResult.success) {
          imageUrls = uploadResult.images;
        } else {
          throw new Error('Image upload failed');
        }
      }

      // Create product
      const productData = {
        title: form.title.trim(),
        description: form.description.trim(),
        price: parseFloat(form.price),
        category: form.category,
        condition: form.condition,
        location: form.location,
        images: imageUrls,
        sellerId: user.uid,
        sellerName: user.displayName || 'বিক্রেতা',
        sellerPhone: user.phoneNumber || '',
      };

      const result = await addProduct(productData, user.uid);

      if (result.success) {
        toast.success(MESSAGES.product.createSuccess);
        navigate('/');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast.error(error.message || MESSAGES.product.createError);
    } finally {
      setLoading(false);
    }
  };

  const selectedCategory = CATEGORIES.find(c => c.slug === form.category);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white sticky top-0 z-30 border-b">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft size={22} />
          </button>
          <h1 className="text-lg font-bold">পণ্য বিক্রি করুন</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Images */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold mb-3">ছবি যোগ করুন</h3>
          <ImageUploader 
            maxImages={5} 
            onImagesChange={handleImagesChange}
          />
          {errors.images && <p className="text-red-500 text-sm mt-1">{errors.images}</p>}
        </div>

        {/* Title */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <Input
            label="শিরোনাম *"
            placeholder="যেমন: তাজা পালংশাক - ১ কেজি"
            value={form.title}
            onChange={(e) => handleChange('title', e.target.value)}
            error={errors.title}
            maxLength={100}
          />
        </div>

        {/* Category */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">ক্যাটাগরি *</label>
          <button
            type="button"
            onClick={() => setShowCategoryModal(true)}
            className={`w-full flex items-center justify-between p-3 rounded-lg border ${
              errors.category ? 'border-red-500' : 'border-gray-300'
            } hover:border-gray-400 transition-colors`}
          >
            <div className="flex items-center gap-2">
              {selectedCategory ? (
                <>
                  <span className="text-xl">{selectedCategory.emoji}</span>
                  <span className="font-medium">{selectedCategory.name}</span>
                </>
              ) : (
                <span className="text-gray-400">ক্যাটাগরি সিলেক্ট করুন</span>
              )}
            </div>
            <ChevronDown size={18} className="text-gray-400" />
          </button>
          {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
        </div>

        {/* Price */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <Input
            label="দাম (৳) *"
            type="number"
            placeholder="যেমন: ৫০"
            value={form.price}
            onChange={(e) => handleChange('price', e.target.value)}
            error={errors.price}
            leftIcon={<span className="text-gray-500 font-bold">৳</span>}
          />
        </div>

        {/* Condition */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">অবস্থা</label>
          <button
            type="button"
            onClick={() => setShowConditionModal(true)}
            className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-300 hover:border-gray-400 transition-colors"
          >
            <span className="font-medium">
              {conditions.find(c => c.value === form.condition)?.label || 'নতুন'}
            </span>
            <ChevronDown size={18} className="text-gray-400" />
          </button>
        </div>

        {/* Description */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <Input
            label="বিবরণ"
            textarea
            rows={4}
            placeholder="পণ্যের বিবরণ দিন..."
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
            error={errors.description}
            helperText={`${form.description.length}/1000`}
          />
        </div>

        {/* Location */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">লোকেশন *</label>
          {form.location ? (
            <div className="flex items-center gap-2 p-3 bg-primary-50 rounded-lg text-primary-700">
              <MapPin size={18} />
              <span className="text-sm font-medium">{form.location.address}</span>
              <button 
                type="button"
                onClick={handleGetLocation}
                className="ml-auto text-xs underline"
              >
                আপডেট
              </button>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              leftIcon={<MapPin size={18} />}
              onClick={handleGetLocation}
              loading={gettingLocation}
              className="w-full"
            >
              লোকেশন নির্ধারণ করুন
            </Button>
          )}
          {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
        </div>

        {/* Submit */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          loading={loading}
        >
          পণ্য যোগ করুন
        </Button>
      </form>

      {/* Category Modal */}
      <Modal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        title="ক্যাটাগরি সিলেক্ট করুন"
      >
        <div className="space-y-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => {
                handleChange('category', cat.slug);
                setShowCategoryModal(false);
              }}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                form.category === cat.slug 
                  ? 'bg-primary-50 border-2 border-primary-500' 
                  : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
              }`}
            >
              <span className="text-2xl">{cat.emoji}</span>
              <div className="text-left">
                <p className="font-medium text-gray-900">{cat.name}</p>
              </div>
              {form.category === cat.slug && (
                <Check size={18} className="ml-auto text-primary-500" />
              )}
            </button>
          ))}
        </div>
      </Modal>

      {/* Condition Modal */}
      <Modal
        isOpen={showConditionModal}
        onClose={() => setShowConditionModal(false)}
        title="অবস্থা সিলেক্ট করুন"
      >
        <div className="space-y-2">
          {conditions.map(cond => (
            <button
              key={cond.value}
              onClick={() => {
                handleChange('condition', cond.value);
                setShowConditionModal(false);
              }}
              className={`w-full text-left p-3 rounded-xl transition-colors ${
                form.condition === cond.value 
                  ? 'bg-primary-50 border-2 border-primary-500' 
                  : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
              }`}
            >
              <p className="font-medium text-gray-900">{cond.label}</p>
              <p className="text-sm text-gray-500">{cond.desc}</p>
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default SellPage;
