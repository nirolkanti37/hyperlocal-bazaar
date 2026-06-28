import { useState, useEffect, useCallback } from 'react';
import { getUserChats, getMessages, sendMessage, markAsRead } from './chatService';

export const useChatList = (userId) => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const loadChats = async () => {
      try {
        const chatData = await getUserChats(userId);
        setChats(chatData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadChats();
  }, [userId]);

  return { chats, loading };
};

export const useChat = (chatId, userId) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!chatId) return;

    const unsubscribe = getMessages(chatId, (msgs) => {
      setMessages(msgs);
      setLoading(false);
      markAsRead(chatId, userId);
    });

    return () => unsubscribe();
  }, [chatId, userId]);

  const send = useCallback(async (text) => {
    if (!text.trim()) return;
    setSending(true);
    try {
      await sendMessage(chatId, userId, text.trim());
    } finally {
      setSending(false);
    }
  }, [chatId, userId]);

  return { messages, loading, sending, send };
};
