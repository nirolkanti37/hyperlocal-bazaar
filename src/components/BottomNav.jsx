import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, PlusCircle, MessageCircle, User } from 'lucide-react';

const BottomNav = () => {
  const navItems = [
    { to: '/', icon: Home, label: 'হোম' },
    { to: '/search', icon: Search, label: 'খুঁজুন' },
    { to: '/sell', icon: PlusCircle, label: 'বিক্রি', highlight: true },
    { to: '/chat', icon: MessageCircle, label: 'চ্যাট' },
    { to: '/profile', icon: User, label: 'প্রোফাইল' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 safe-area-bottom">
      <div className="max-w-lg mx-auto flex justify-around items-center py-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `
              flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl transition-colors duration-200
              ${isActive 
                ? 'text-primary-600' 
                : 'text-gray-400 hover:text-gray-600'
              }
              ${item.highlight ? 'relative -mt-4' : ''}
            `}
          >
            {item.highlight ? (
              <div className="bg-primary-500 text-white p-3 rounded-full shadow-lg shadow-primary-500/30 hover:scale-105 transition-transform">
                <item.icon size={24} />
              </div>
            ) : (
              <item.icon size={22} strokeWidth={2} />
            )}
            <span className={`text-[10px] font-medium ${item.highlight ? 'text-primary-600' : ''}`}>
              {item.label}
            </span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
