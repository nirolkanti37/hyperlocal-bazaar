import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Send } from 'lucide-react';
import { useAuthContext } from '../context/AuthContext';
import { useChat } from '../modules/chat/chatHook';
import ChatBubble from '../components/ChatBubble';
import Spinner from '../components/Spinner';

const ChatPage = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { messages, loading, sending, send } = useChat(chatId, user?.uid);
  const [text, setText] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    send(text);
    setText('');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="bg-white border-b sticky top-0 z-30">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <h2 className="font-semibold">চ্যাট</h2>
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Phone size={20} className="text-primary-500" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : (
          <>
            {messages.map(msg => (
              <ChatBubble
                key={msg.id}
                message={msg}
                isSent={msg.senderId === user?.uid}
                timestamp={msg.createdAt}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <form onSubmit={handleSubmit} className="bg-white border-t p-3">
        <div className="max-w-lg mx-auto flex items-center gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="মেসেজ লিখুন..."
            className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            type="submit"
            disabled={!text.trim() || sending}
            className="p-2.5 bg-primary-500 text-white rounded-full hover:bg-primary-600 disabled:opacity-50"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatPage;
