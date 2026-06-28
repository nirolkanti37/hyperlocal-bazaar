import { 
  collection, getDocs, query, where, orderBy, 
  doc, setDoc, updateDoc, increment, serverTimestamp
} from 'firebase/firestore';
import { db } from '../../config/firebase';

// Track event
export const trackEvent = async (eventName, userId, metadata = {}) => {
  try {
    await addDoc(collection(db, 'analytics'), {
      event: eventName,
      userId,
      metadata,
      timestamp: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Track product view
export const trackProductView = async (productId, userId) => {
  return trackEvent('product_view', userId, { productId });
};

// Track search
export const trackSearch = async (query, userId) => {
  return trackEvent('search', userId, { query });
};

// Get popular products
export const getPopularProducts = async (days = 7) => {
  try {
    const q = query(
      collection(db, 'products'),
      orderBy('viewCount', 'desc'),
      limit(10)
    );
    const snapshot = await getDocs(q);
    return { success: true, products: snapshot.docs.map(d => ({ id: d.id, ...d.data() })) };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get top sellers
export const getTopSellers = async () => {
  try {
    const q = query(
      collection(db, 'users'),
      orderBy('reviewCount', 'desc'),
      limit(10)
    );
    const snapshot = await getDocs(q);
    return { success: true, sellers: snapshot.docs.map(d => ({ id: d.id, ...d.data() })) };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get category stats
export const getCategoryStats = async () => {
  try {
    const snapshot = await getDocs(collection(db, 'products'));
    const categories = {};
    snapshot.docs.forEach(doc => {
      const cat = doc.data().category || 'others';
      categories[cat] = (categories[cat] || 0) + 1;
    });
    return { success: true, stats: categories };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
