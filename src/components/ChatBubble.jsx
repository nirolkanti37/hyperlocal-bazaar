import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { bn } from 'date-fns/locale';

const ChatBubble = ({ message, isSent, timestamp }) => {
  const time = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);

  return (
    <div className={`flex ${isSent ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
        isSent 
          ? 'bg-primary-500 text-white rounded-br-md' 
          : 'bg-white text-gray-800 rounded-bl-md shadow-sm'
      }`}>
        <p className="text-sm leading-relaxed">{message.text}</p>
        <p className={`text-[10px] mt-1 ${isSent ? 'text-primary-100' : 'text-gray-400'}`}>
          {formatDistanceToNow(time, { locale: bn, addSuffix: true })}
        </p>
      </div>
    </div>
  );
};

export default ChatBubble;
