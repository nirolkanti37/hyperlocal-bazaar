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
      if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
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
          location: { lat: position.lat, lng: position.lng, address: 'আপনার অবস্থান' }
        }));
        toast.success('লোকেশন পাওয়া গেছে!');
      } catch {
        setForm(prev => ({
          ...prev,
          location: { lat: 23.8103, lng: 90.4125, address: 'বাংলাদেশ' }
        }));
        toast('লোকেশন পাওয়া যায়নি, ডিফল্ট সেট হয়েছে', { icon: '📍' });
      } finally {
        setGettingLocation(false);
      }
    };

    const handleSubmit = async (e) => {
      e.preventDefault();

      const locationToUse = form.location || { lat: 23.8103, lng: 90.4125, address: 'বাংলাদেশ' };

      const validation = validateProduct({
        ...form,
        price: parseFloat(form.price),
        location: locationToUse,
      });

      if (!validation.isValid) {
        setErrors(validation.errors);
        toast.error('সব তথ্য সঠিকভাবে দিন');
        return;
      }

      setLoading(true);
      try {
        let imageUrls = [];
        if (form.images && form.images.length > 0) {
          try {
            const uploadResult = await uploadMultipleImages(form.images, user.uid);
            if (uploadResult.success) {
              imageUrls = uploadResult.images;
            } else {
              toast('ছবি upload হয়নি, ছবি ছাড়াই যোগ হচ্ছে', { icon: '⚠️' });
            }
          } catch {
            toast('ছবি upload হয়নি, ছবি ছাড়াই যোগ হচ্ছে', { icon: '⚠️' });
          }
        }

        const productData = {
          title: form.title.trim(),
          description: form.description.trim(),
          price: parseFloat(form.price),
          category: form.category,
          condition: form.condition,
          location: locationToUse,
          images: imageUrls,
          sellerId: user.uid,
          sellerName: user.displayName || user.email || 'বিক্রেতা',
          sellerEmail: user.email || '',
        };

        const result = await addProduct(productData, user.uid);
        if (result.success) {
          toast.success(MESSAGES.product?.createSuccess || 'পণ্য যোগ হয়েছে! ✅');
          navigate('/');
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        toast.error(error.message || 'পণ্য যোগ করতে সমস্যা হয়েছে');
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100">
            <ArrowLeft size={20} className="text-gray-700" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">পণ্য বিক্রি করুন</h1>
        </div>

        <form onSubmit={handleSubmit} className="px-4 py-4 space-y-4 pb-24">

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Camera size={16} className="text-primary-500" />
              ছবি যোগ করুন <span className="text-gray-400 font-normal">(ঐচ্ছিক, সর্বোচ্চ ৫টি)</span>
            </p>
            <ImageUploader maxImages={5} onImagesChange={handleImagesChange} />
            {errors.images && <p className="text-red-500 text-xs mt-1">{errors.images}</p>}
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">পণ্যের নাম *</label>
              <Input
                type="text"
                placeholder="যেমন: Samsung Galaxy S21"
                value={form.title}
                onChange={e => handleChange('title', e.target.value)}
                error={errors.title}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">বিবরণ</label>
              <textarea
                placeholder="পণ্য সম্পর্কে বিস্তারিত লিখুন..."
                value={form.description}
                onChange={e => handleChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <label className="text-sm font-medium text-gray-700 mb-1 block">দাম (টাকা) *</label>
            <Input
              type="number"
              placeholder="0"
              value={form.price}
              onChange={e => handleChange('price', e.target.value)}
              error={errors.price}
            />
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <label className="text-sm font-medium text-gray-700 mb-1 block">ক্যাটাগরি *</label>
            <button
              type="button"
              onClick={() => setShowCategoryModal(true)}
              className={`w-full flex items-center justify-between px-3 py-2 border rounded-xl text-sm ${errors.category ? 'border-red-400' : 'border-gray-200'}`}
            >
              <span className={form.category ? 'text-gray-900' : 'text-gray-400'}>
                {form.category ? (CATEGORIES.find(c => c.slug === form.category)?.name || form.category) : 'ক্যাটাগরি সিলেক্ট করুন'}
              </span>
              <ChevronDown size={16} className="text-gray-400" />
            </button>
            {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <label className="text-sm font-medium text-gray-700 mb-1 block">অবস্থা</label>
            <button
              type="button"
              onClick={() => setShowConditionModal(true)}
              className="w-full flex items-center justify-between px-3 py-2 border border-gray-200 rounded-xl text-sm"
            >
              <span className="text-gray-900">
                {conditions.find(c => c.value === form.condition)?.label || 'নতুন'}
              </span>
              <ChevronDown size={16} className="text-gray-400" />
            </button>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              <MapPin size={16} className="inline text-primary-500 mr-1" />
              অবস্থান <span className="text-gray-400 font-normal">(ঐচ্ছিক)</span>
            </label>
            <Button
              type="button"
              variant={form.location ? 'success' : 'outline'}
              size="sm"
              onClick={handleGetLocation}
              loading={gettingLocation}
              leftIcon={<MapPin size={16} />}
              className="w-full"
            >
              {form.location ? `✓ ${form.location.address}` : 'আমার অবস্থান নিন'}
            </Button>
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full" loading={loading}>
            পণ্য যোগ করুন
          </Button>
        </form>

        <Modal isOpen={showCategoryModal} onClose={() => setShowCategoryModal(false)} title="ক্যাটাগরি সিলেক্ট করুন">
          <div className="space-y-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.slug}
                onClick={() => { handleChange('category', cat.slug); setShowCategoryModal(false); }}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                  form.category === cat.slug ? 'bg-primary-50 border-2 border-primary-500' : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                }`}
              >
                <span className="text-2xl">{cat.emoji}</span>
                <p className="font-medium text-gray-900 text-left">{cat.name}</p>
                {form.category === cat.slug && <Check size={18} className="ml-auto text-primary-500" />}
              </button>
            ))}
          </div>
        </Modal>

        <Modal isOpen={showConditionModal} onClose={() => setShowConditionModal(false)} title="অবস্থা সিলেক্ট করুন">
          <div className="space-y-2">
            {conditions.map(cond => (
              <button
                key={cond.value}
                onClick={() => { handleChange('condition', cond.value); setShowConditionModal(false); }}
                className={`w-full text-left p-3 rounded-xl transition-colors ${
                  form.condition === cond.value ? 'bg-primary-50 border-2 border-primary-500' : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
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
    