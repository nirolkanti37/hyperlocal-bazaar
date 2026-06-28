import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { useChatList } from '../modules/chat/chatHook';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import ChatCard from '../components/ChatCard';
import EmptyState from '../components/EmptyState';
import { MessageSquare } from 'lucide-react';

const ChatListPage = () => {
  const { user } = useAuthContext();
  const { chats, loading } = useChatList(user?.uid);
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>লগইন করুন</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-lg mx-auto pt-20 pb-24 px-4">
        <h1 className="text-xl font-bold mb-4">মেসেজ</h1>

        {chats.length === 0 ? (
          <EmptyState
            icon={<MessageSquare size={64} className="text-gray-300" />}
            title="কোনো মেসেজ নেই"
            description="পণ্য কিনতে বা বিক্রি করতে চ্যাট শুরু করুন"
          />
        ) : (
          <div className="space-y-1">
            {chats.map(chat => (
              <ChatCard
                key={chat.id}
                name={chat.otherUserName || 'ব্যবহারকারী'}
                lastMessage={chat.lastMessage}
                timestamp={chat.lastMessageAt}
                unreadCount={chat.unreadCount?.[user.uid] || 0}
                onClick={() => navigate(`/chat/${chat.id}`)}
              />
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default ChatListPage;
