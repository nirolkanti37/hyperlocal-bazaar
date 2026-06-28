import React from 'react';
import { MapPin, Heart } from 'lucide-react';

const ProductCard = ({ 
  image, 
  title, 
  price, 
  location, 
  distance,
  category,
  isFavorite = false,
  onFavoriteToggle,
  onClick,
  className = ''
}) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-xl shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300 overflow-hidden cursor-pointer group ${className}`}
    >
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <img 
          src={image || '/assets/placeholder-product.jpg'} 
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <button
          onClick={(e) => {
            e.stopPropagation();
            onFavoriteToggle?.();
          }}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors"
        >
          <Heart 
            size={18} 
            className={isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'} 
          />
        </button>
        {category && (
          <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-white text-xs">
            {category}
          </span>
        )}
      </div>

      <div className="p-3">
        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1 leading-tight">
          {title}
        </h3>
        <p className="text-primary-600 font-bold text-base mb-1.5">
          {formatPrice(price)}
        </p>
        <div className="flex items-center gap-1 text-gray-500 text-xs">
          <MapPin size={12} />
          <span className="truncate">{location}</span>
          {distance && (
            <span className="text-primary-500 font-medium ml-auto flex-shrink-0">
              {distance < 1 ? `${Math.round(distance * 1000)} মি` : `${distance.toFixed(1)} কিমি`}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
