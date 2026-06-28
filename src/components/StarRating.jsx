import React, { useState } from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ rating = 0, onRate = null, readOnly = false, size = 'md', showValue = true }) => {
  const [hover, setHover] = useState(0);
  const sizes = { sm: 14, md: 20, lg: 28 };
  const starSize = sizes[size];

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star} type="button" disabled={readOnly}
          onClick={() => onRate?.(star)}
          onMouseEnter={() => !readOnly && setHover(star)}
          onMouseLeave={() => setHover(0)}
          className={`transition-all duration-150 ${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
        >
          <Star size={starSize}
            className={`transition-colors duration-150 ${
              star <= (hover || rating) ? 'fill-yellow-400 text-yellow-400' : 'fill-none text-gray-300 dark:text-gray-600'
            }`}
          />
        </button>
      ))}
      {showValue && rating > 0 && (
        <span className="ml-1 text-sm font-semibold text-gray-700 dark:text-gray-300">{rating.toFixed(1)}</span>
      )}
    </div>
  );
};

export default StarRating;
