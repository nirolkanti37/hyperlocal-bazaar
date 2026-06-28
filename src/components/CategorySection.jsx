import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CATEGORIES } from '../constants/categories';

const CategorySection = ({ onCategorySelect }) => {
  const navigate = useNavigate();

  const handleClick = (slug) => {
    if (onCategorySelect) {
      onCategorySelect(slug);
    } else {
      navigate(`/search?category=${slug}`);
    }
  };

  return (
    <div className="py-4">
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="text-lg font-bold text-gray-900">ক্যাটাগরি</h2>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => handleClick(cat.slug)}
            className="flex flex-col items-center gap-2 flex-shrink-0 group"
          >
            <div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm transition-transform group-hover:scale-105"
              style={{ backgroundColor: `${cat.color}15` }}
            >
              {cat.emoji}
            </div>
            <span className="text-xs font-medium text-gray-700 whitespace-nowrap">
              {cat.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategorySection;
