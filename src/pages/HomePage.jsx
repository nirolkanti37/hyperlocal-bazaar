import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, SlidersHorizontal } from 'lucide-react';
import { useAuthContext } from '../context/AuthContext';
import { useProductList } from '../modules/product/productHook';
import { getSavedUserLocation, saveUserLocation, getCurrentPosition } from '../modules/location/locationService';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import BannerSlider from '../components/BannerSlider';
import CategorySection from '../components/CategorySection';
import ProductGrid from '../components/ProductGrid';
import Button from '../components/Button';
import toast from 'react-hot-toast';

const HomePage = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);

  const { products, loading, error, hasMore, fetchProducts, refresh } = useProductList({
    category: selectedCategory,
    limit: 20
  });

  // Load saved location on mount
  useEffect(() => {
    const saved = getSavedUserLocation();
    if (saved) {
      setUserLocation(saved);
    }
  }, []);

  // Fetch products when location/category changes
  useEffect(() => {
    refresh();
  }, [selectedCategory]);

  const handleDetectLocation = async () => {
    setLocationLoading(true);
    try {
      const position = await getCurrentPosition();
      const location = {
        lat: position.lat,
        lng: position.lng,
        address: 'আপনার অবস্থান',
        detectedAt: new Date().toISOString()
      };
      saveUserLocation(location);
      setUserLocation(location);
      toast.success('লোকেশন পাওয়া গেছে!');
      refresh();
    } catch (error) {
      toast.error(error.message || 'লোকেশন পেতে সমস্যা');
    } finally {
      setLocationLoading(false);
    }
  };

  const handleCategorySelect = (slug) => {
    setSelectedCategory(slug === selectedCategory ? null : slug);
  };

  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchProducts();
    }
  }, [loading, hasMore, fetchProducts]);

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header 
        userLocation={userLocation}
        onSearchClick={() => navigate('/search')}
      />

      {/* Main Content */}
      <main className="max-w-lg mx-auto px-4 pt-20 pb-24">
        {/* Location Bar */}
        <div className="flex items-center gap-2 mb-4">
          {userLocation ? (
            <div className="flex items-center gap-1.5 text-sm text-primary-700 bg-primary-50 px-3 py-1.5 rounded-full">
              <MapPin size={14} />
              <span className="font-medium">{userLocation.address}</span>
              <span className="text-xs text-primary-500">(২ কিমি)</span>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<MapPin size={14} />}
              onClick={handleDetectLocation}
              loading={locationLoading}
              className="text-sm"
            >
              লোকেশন সেট করুন
            </Button>
          )}
          <button 
            onClick={() => navigate('/map')}
            className="ml-auto flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
          >
            <SlidersHorizontal size={14} />
            ম্যাপ
          </button>
        </div>

        {/* Banner */}
        <BannerSlider />

        {/* Categories */}
        <CategorySection onCategorySelect={handleCategorySelect} />

        {/* Section Header */}
        <div className="flex items-center justify-between mb-3 mt-2">
          <h2 className="text-lg font-bold text-gray-900">
            {selectedCategory ? 'ফিল্টার করা পণ্য' : 'আশেপাশের পণ্য'}
          </h2>
          {selectedCategory && (
            <button 
              onClick={() => setSelectedCategory(null)}
              className="text-sm text-primary-600 hover:underline"
            >
              সব দেখুন
            </button>
          )}
        </div>

        {/* Product Grid */}
        <ProductGrid
          products={products}
          loading={loading}
          hasMore={hasMore}
          onLoadMore={handleLoadMore}
          onProductClick={handleProductClick}
        />
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default HomePage;
