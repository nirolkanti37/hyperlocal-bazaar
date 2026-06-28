import React, { useState } from 'react';
import { Search, Bell, Menu, X, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Header = ({ 
  userLocation = null,
  notificationCount = 0,
  onMenuToggle,
  onSearchClick
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white shadow-sm safe-area-top">
      <div className="max-w-lg mx-auto px-4 py-2.5">
        <div className="flex items-center gap-3">
          {/* Logo */}
          <button 
            onClick={() => navigate('/')}
            className="flex-shrink-0 font-bold text-primary-600 text-lg tracking-tight"
          >
            বাজার
          </button>

          {/* Search Bar */}
          <div 
            onClick={onSearchClick || (() => navigate('/search'))}
            className="flex-1 flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 cursor-pointer hover:bg-gray-200 transition-colors"
          >
            <Search size={18} className="text-gray-400" />
            <span className="text-gray-400 text-sm">পণ্য খুঁজুন...</span>
          </div>

          {/* Location */}
          {userLocation && (
            <button className="flex-shrink-0 flex items-center gap-1 text-xs text-primary-600 bg-primary-50 px-2 py-1 rounded-full">
              <MapPin size={14} />
              <span className="hidden sm:inline">{userLocation.name || 'আশেপাশে'}</span>
            </button>
          )}

          {/* Notifications */}
          <button 
            onClick={() => navigate('/notifications')}
            className="relative flex-shrink-0 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Bell size={22} className="text-gray-700" />
            {notificationCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
