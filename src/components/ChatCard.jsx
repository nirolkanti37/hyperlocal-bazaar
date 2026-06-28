import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { bn } from 'date-fns/locale';

const ChatCard = ({
  avatar,
  name,
  lastMessage,
  timestamp,
  unreadCount = 0,
  isOnline = false,
  productImage,
  onClick
}) => {
  return (
    <div 
      onClick={onClick}
      className="flex items-center gap-3 p-3 bg-white hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-100 last:border-0"
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <img 
          src={avatar || '/assets/default-avatar.jpg'} 
          alt={name}
          className="w-12 h-12 rounded-full object-cover bg-gray-200"
        />
        {isOnline && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <h4 className="font-semibold text-gray-900 text-sm truncate">{name}</h4>
          {timestamp && (
            <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
              {formatDistanceToNow(new Date(timestamp), { locale: bn, addSuffix: true })}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 truncate">{lastMessage}</p>
      </div>

      {/* Right Side */}
      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
        {productImage && (
          <img 
            src={productImage} 
            alt="product"
            className="w-10 h-10 rounded-lg object-cover bg-gray-100"
          />
        )}
        {unreadCount > 0 && (
          <span className="w-5 h-5 bg-primary-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </div>
    </div>
  );
};

export default ChatCard;
