import { 
  collection, addDoc, getDoc, getDocs, doc, updateDoc, 
  query, where, orderBy, onSnapshot, serverTimestamp, arrayUnion
} from 'firebase/firestore';
import { db } from '../../config/firebase';

// Create or get existing chat
export const createChat = async (buyerId, sellerId, productId) => {
  try {
    // Check if chat already exists
    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', buyerId),
      where('productId', '==', productId)
    );
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      return snapshot.docs[0].id;
    }

    // Create new chat
    const chatRef = await addDoc(collection(db, 'chats'), {
      participants: [buyerId, sellerId],
      productId,
      createdAt: serverTimestamp(),
      lastMessageAt: serverTimestamp(),
      lastMessage: '',
      unreadCount: { [buyerId]: 0, [sellerId]: 0 }
    });

    return chatRef.id;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Get user's chats
export const getUserChats = async (userId) => {
  try {
    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', userId),
      orderBy('lastMessageAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    throw new Error(error.message);
  }
};

// Send message
export const sendMessage = async (chatId, senderId, text) => {
  try {
    const messageRef = await addDoc(collection(db, 'messages'), {
      chatId,
      senderId,
      text,
      createdAt: serverTimestamp(),
      read: false
    });

    // Update chat last message
    const chatRef = doc(db, 'chats', chatId);
    const chatSnap = await getDoc(chatRef);
    if (chatSnap.exists()) {
      const data = chatSnap.data();
      const otherParticipant = data.participants.find(p => p !== senderId);
      await updateDoc(chatRef, {
        lastMessage: text,
        lastMessageAt: serverTimestamp(),
        [`unreadCount.${otherParticipant}`]: (data.unreadCount?.[otherParticipant] || 0) + 1
      });
    }

    return messageRef.id;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Get messages for a chat
export const getMessages = (chatId, callback) => {
  const q = query(
    collection(db, 'messages'),
    where('chatId', '==', chatId),
    orderBy('createdAt', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(messages);
  });
};

// Mark messages as read
export const markAsRead = async (chatId, userId) => {
  try {
    const chatRef = doc(db, 'chats', chatId);
    await updateDoc(chatRef, {
      [`unreadCount.${userId}`]: 0
    });
  } catch (error) {
    console.error('Error marking as read:', error);
  }
};

// Get chat details
export const getChat = async (chatId) => {
  try {
    const chatRef = doc(db, 'chats', chatId);
    const chatSnap = await getDoc(chatRef);
    if (chatSnap.exists()) {
      return { id: chatSnap.id, ...chatSnap.data() };
    }
    return null;
  } catch (error) {
    throw new Error(error.message);
  }
};
