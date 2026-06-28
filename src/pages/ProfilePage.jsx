import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Settings, Package, Heart, MapPin } from 'lucide-react';
import { useAuthContext } from '../context/AuthContext';
import { useMyProducts } from '../modules/product/productHook';
import { logout } from '../modules/auth/authService';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import ProductCard from '../components/ProductCard';
import Button from '../components/Button';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user, isAuthenticated } = useAuthContext();
  const { products, loading, handleMarkAsSold, handleDelete } = useMyProducts(user?.uid);
  const [activeTab, setActiveTab] = useState('active');
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Button onClick={() => navigate('/login')}>লগইন করুন</Button>
      </div>
    );
  }

  const tabs = [
    { id: 'active', label: 'সক্রিয়' },
    { id: 'sold', label: 'বিক্রিত' },
    { id: 'hidden', label: 'লুকানো' }
  ];

  const filteredProducts = products.filter(p => p.status === activeTab);

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      toast.success('লগআউট সফল');
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-lg mx-auto pt-20 pb-24 px-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-2xl font-bold">
              {user.displayName?.charAt(0) || user.phoneNumber?.charAt(3) || 'U'}
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-lg">{user.displayName || 'ব্যবহারকারী'}</h2>
              <p className="text-sm text-gray-500">{user.phoneNumber}</p>
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button className="flex-1 py-2 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200">
              এডিট প্রোফাইল
            </button>
            <button 
              onClick={handleLogout}
              className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-white rounded-xl p-3 text-center shadow-sm">
            <p className="text-xl font-bold text-primary-600">{products.filter(p => p.status === 'active').length}</p>
            <p className="text-xs text-gray-500">সক্রিয়</p>
          </div>
          <div className="bg-white rounded-xl p-3 text-center shadow-sm">
            <p className="text-xl font-bold text-green-600">{products.filter(p => p.status === 'sold').length}</p>
            <p className="text-xs text-gray-500">বিক্রিত</p>
          </div>
          <div className="bg-white rounded-xl p-3 text-center shadow-sm">
            <p className="text-xl font-bold text-blue-600">0</p>
            <p className="text-xs text-gray-500">রেটিং</p>
          </div>
        </div>

        <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm mb-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === tab.id ? 'bg-primary-500 text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              image={product.images?.[0]?.url}
              title={product.title}
              price={product.price}
              location={product.location?.address}
              onClick={() => navigate(`/product/${product.id}`)}
            />
          ))}
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default ProfilePage;
